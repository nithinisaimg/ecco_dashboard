import type { ApiError, ApiErrorKind } from '../types/api';

const DEFAULT_BASE_URL = 'http://localhost:8000';

function resolveBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!envUrl) return DEFAULT_BASE_URL;

  // Security check: ensure no database connection strings were accidentally pasted
  if (envUrl.startsWith('postgresql://') || envUrl.startsWith('postgres://') || envUrl.startsWith('sqlite:')) {
    console.error(
      'CRITICAL CONFIGURATION ERROR: VITE_API_BASE_URL contains a database connection string. ' +
      'Frontend must communicate via HTTP REST to FastAPI, never directly to database engines.'
    );
    return DEFAULT_BASE_URL;
  }

  return envUrl;
}

export const API_BASE_URL: string = resolveBaseUrl();

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

function combineSignals(signalA?: AbortSignal | null, signalB?: AbortSignal | null): AbortSignal {
  if (!signalA && signalB) return signalB;
  if (signalA && !signalB) return signalA;
  if (!signalA && !signalB) return new AbortController().signal;

  if (typeof AbortSignal.any === 'function') {
    return AbortSignal.any([signalA!, signalB!]);
  }

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (signalA!.aborted || signalB!.aborted) {
    controller.abort();
  } else {
    signalA!.addEventListener('abort', onAbort, { once: true });
    signalB!.addEventListener('abort', onAbort, { once: true });
  }
  return controller.signal;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;

    const { timeoutMs = 10000, headers, signal: callerSignal, ...rest } = options;
    const timeoutController = new AbortController();
    let timeoutFired = false;

    const timeoutId = setTimeout(() => {
      timeoutFired = true;
      timeoutController.abort();
    }, timeoutMs);

    const mergedSignal = combineSignals(callerSignal, timeoutController.signal);

    try {
      const response = await fetch(url, {
        ...rest,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...headers,
        },
        signal: mergedSignal,
      });

      if (!response.ok) {
        let errorDetails: unknown = null;
        let errorMessage = `API Error ${response.status}: ${response.statusText}`;

        try {
          const jsonError = await response.json();
          errorDetails = jsonError;
          if (jsonError?.detail) {
            errorMessage = typeof jsonError.detail === 'string'
              ? jsonError.detail
              : JSON.stringify(jsonError.detail);
          } else if (jsonError?.message) {
            errorMessage = jsonError.message;
          }
        } catch {
          // Response body was not JSON
        }

        let kind: ApiErrorKind = 'server_error';
        if (response.status === 404 || response.status === 501) {
          kind = 'endpoint_unavailable';
          errorMessage = `Endpoint ${cleanEndpoint} is not implemented or not found on the backend (HTTP ${response.status}).`;
        }

        const apiError: ApiError = {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          endpoint: cleanEndpoint,
          kind,
          details: errorDetails,
        };
        throw apiError;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      // Safe JSON parsing with distinct error handling for invalid payload structure
      let data: T;
      try {
        data = (await response.json()) as T;
      } catch (jsonParseErr) {
        const apiError: ApiError = {
          status: response.status,
          statusText: 'Invalid JSON Response',
          message: `The server responded with HTTP ${response.status}, but the payload was not valid JSON.`,
          endpoint: cleanEndpoint,
          kind: 'invalid_response',
          details: jsonParseErr,
        };
        throw apiError;
      }

      return data;
    } catch (err: unknown) {
      // If it's already an ApiError, re-throw directly
      if (typeof err === 'object' && err !== null && 'status' in err && 'endpoint' in err) {
        throw err as ApiError;
      }

      // Differentiate between user-aborted, timeout, and network connection refused
      const isCallerAbort = callerSignal?.aborted;
      const isTimeout = timeoutFired || (!isCallerAbort && (err as Error)?.name === 'AbortError');

      let kind: ApiErrorKind = 'network_failure';
      let message = `Unable to connect to FastAPI backend at ${this.baseUrl}. Check if server is running.`;
      let statusText = 'Network Failure';

      if (isCallerAbort) {
        kind = 'aborted';
        statusText = 'Request Aborted';
        message = `Request to ${cleanEndpoint} was cancelled.`;
      } else if (isTimeout) {
        kind = 'timeout';
        statusText = 'Request Timeout';
        message = `Request to ${cleanEndpoint} timed out after ${timeoutMs}ms.`;
      }

      const apiError: ApiError = {
        status: 0,
        statusText,
        message,
        endpoint: cleanEndpoint,
        kind,
        details: err,
      };
      throw apiError;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
