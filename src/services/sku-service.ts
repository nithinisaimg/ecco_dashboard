import { apiClient } from './api-client';
import {
  API_ENDPOINTS,
  type SKU,
  type SKUCommodityMapping,
  type PaginatedResponse,
} from '../types/api';

export const skuService = {
  getSkus: async (
    params?: { category?: string; page?: number; limit?: number },
    signal?: AbortSignal
  ): Promise<PaginatedResponse<SKU> | SKU[]> => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<PaginatedResponse<SKU> | SKU[]>(
      `${API_ENDPOINTS.SKUS}${queryString}`,
      { signal }
    );
  },

  getSkuById: async (id: string | number, signal?: AbortSignal): Promise<SKU> => {
    return apiClient.get<SKU>(API_ENDPOINTS.SKU_BY_ID(id), { signal });
  },

  getCommodityMappings: async (
    skuId: string | number,
    signal?: AbortSignal
  ): Promise<SKUCommodityMapping[]> => {
    return apiClient.get<SKUCommodityMapping[]>(API_ENDPOINTS.SKU_COMMODITIES(skuId), { signal });
  },
};
