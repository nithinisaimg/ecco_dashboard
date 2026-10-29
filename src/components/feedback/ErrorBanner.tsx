import React from 'react';
import { AlertTriangle, RefreshCw, ServerOff, Terminal, FileQuestion, Database, AlertOctagon } from 'lucide-react';
import type { ApiError } from '../../types/api';

interface ErrorBannerProps {
  error: ApiError | string | null;
  onRetry?: () => void;
  className?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onRetry, className = '' }) => {
  if (!error) return null;

  const isApiError = typeof error === 'object' && error !== null && 'status' in error;
  const status = isApiError ? (error as ApiError).status : undefined;
  const endpoint = isApiError ? (error as ApiError).endpoint : undefined;
  const message = isApiError ? (error as ApiError).message : String(error);
  const kind = isApiError ? (error as ApiError).kind : undefined;

  const isNetworkFailure = kind === 'network_failure' || status === 0;
  const isEndpointMissing = kind === 'endpoint_unavailable' || status === 404 || status === 501;
  const isInvalidResponse = kind === 'invalid_response';
  const isDbDisconnected = kind === 'database_disconnected';

  const getTitle = () => {
    if (isNetworkFailure) return 'FastAPI Backend Connection Failed';
    if (isEndpointMissing) return 'Endpoint Not Implemented (HTTP 404)';
    if (isInvalidResponse) return 'Invalid Response Shape from Backend';
    if (isDbDisconnected) return 'PostgreSQL Database Disconnected';
    return 'API Request Error';
  };

  const getIcon = () => {
    if (isNetworkFailure) return <ServerOff className="w-5 h-5 text-red-400" />;
    if (isEndpointMissing) return <FileQuestion className="w-5 h-5 text-amber-400" />;
    if (isDbDisconnected) return <Database className="w-5 h-5 text-rose-400" />;
    if (isInvalidResponse) return <AlertOctagon className="w-5 h-5 text-purple-400" />;
    return <AlertTriangle className="w-5 h-5 text-red-400" />;
  };

  return (
    <div
      className={`rounded-xl border border-red-900/60 bg-red-950/30 p-4 text-red-200 backdrop-blur-sm ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-red-900/40 mt-0.5 shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-red-300">
              {getTitle()}
            </h4>
            {status !== undefined && (
              <span className="px-2 py-0.5 text-xs font-mono rounded bg-red-900/50 text-red-300 border border-red-800">
                HTTP {status === 0 ? 'OFFLINE' : status}
              </span>
            )}
            {endpoint && (
              <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-900/60 text-slate-400 border border-slate-800">
                {endpoint}
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-red-300/90 leading-relaxed font-sans">{message}</p>

          {isNetworkFailure && (
            <div className="mt-3 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 font-mono text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                Backend Connection Instructions:
              </div>
              <p className="text-slate-400">
                1. Ensure FastAPI server is running: <span className="text-emerald-400">uvicorn main:app --reload --port 8000</span>
              </p>
              <p className="text-slate-400">
                2. Verify CORS middleware allows <span className="text-amber-400">http://localhost:5173</span>
              </p>
            </div>
          )}

          {isEndpointMissing && (
            <div className="mt-2 text-[11px] text-amber-400/90 font-mono">
              Note: This candidate endpoint is defined in the frontend contract but has not yet been implemented on the FastAPI server.
            </div>
          )}
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-200 bg-red-900/40 hover:bg-red-900/60 border border-red-700/60 rounded-lg transition-colors shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
};
