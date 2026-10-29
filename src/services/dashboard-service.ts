import { apiClient } from './api-client';
import { API_ENDPOINTS, type DashboardSummary } from '../types/api';

export const dashboardService = {
  getSummary: async (signal?: AbortSignal): Promise<DashboardSummary> => {
    return apiClient.get<DashboardSummary>(API_ENDPOINTS.DASHBOARD, { signal });
  },
};
