import { apiClient } from './api-client';
import {
  API_ENDPOINTS,
  type Recommendation,
  type PaginatedResponse,
} from '../types/api';

export const recommendationService = {
  getRecommendations: async (
    params?: { priority?: string; status?: string; page?: number; limit?: number },
    signal?: AbortSignal
  ): Promise<PaginatedResponse<Recommendation> | Recommendation[]> => {
    const query = new URLSearchParams();
    if (params?.priority) query.append('priority', params.priority);
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<PaginatedResponse<Recommendation> | Recommendation[]>(
      `${API_ENDPOINTS.RECOMMENDATIONS}${queryString}`,
      { signal }
    );
  },

  getRecommendationById: async (
    id: string | number,
    signal?: AbortSignal
  ): Promise<Recommendation> => {
    return apiClient.get<Recommendation>(API_ENDPOINTS.RECOMMENDATION_BY_ID(id), { signal });
  },

  updateStatus: async (
    id: string | number,
    status: 'approved' | 'rejected' | 'applied',
    signal?: AbortSignal
  ): Promise<Recommendation> => {
    return apiClient.put<Recommendation>(
      API_ENDPOINTS.RECOMMENDATION_STATUS(id),
      { status },
      { signal }
    );
  },
};
