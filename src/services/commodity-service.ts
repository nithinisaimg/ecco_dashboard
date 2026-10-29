import { apiClient } from './api-client';
import {
  API_ENDPOINTS,
  type Commodity,
  type CommodityPriceHistory,
  type MarketIndicator,
  type PaginatedResponse,
} from '../types/api';

export const commodityService = {
  getCommodities: async (
    params?: { category?: string; page?: number; limit?: number },
    signal?: AbortSignal
  ): Promise<PaginatedResponse<Commodity> | Commodity[]> => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<PaginatedResponse<Commodity> | Commodity[]>(
      `${API_ENDPOINTS.COMMODITIES}${queryString}`,
      { signal }
    );
  },

  getCommodityById: async (id: string | number, signal?: AbortSignal): Promise<Commodity> => {
    return apiClient.get<Commodity>(API_ENDPOINTS.COMMODITY_BY_ID(id), { signal });
  },

  getPriceHistory: async (
    commodityId: string | number,
    days?: number,
    signal?: AbortSignal
  ): Promise<CommodityPriceHistory[]> => {
    const query = days ? `?days=${days}` : '';
    return apiClient.get<CommodityPriceHistory[]>(
      `${API_ENDPOINTS.COMMODITY_PRICES(commodityId)}${query}`,
      { signal }
    );
  },

  getMarketIndicators: async (signal?: AbortSignal): Promise<MarketIndicator[]> => {
    return apiClient.get<MarketIndicator[]>(API_ENDPOINTS.COMMODITY_MARKET_INDICATORS, { signal });
  },
};
