import { apiClient } from './api-client';
import { API_ENDPOINTS, type HealthStatus } from '../types/api';

export const healthService = {
  checkHealth: async (signal?: AbortSignal): Promise<HealthStatus> => {
    return apiClient.get<HealthStatus>(API_ENDPOINTS.HEALTH, { signal, timeoutMs: 5000 });
  },
};
