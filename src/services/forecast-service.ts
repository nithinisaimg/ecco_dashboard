import { apiClient } from './api-client';
import {
  API_ENDPOINTS,
  type Forecast,
  type PaginatedResponse,
} from '../types/api';

export const forecastService = {
  getForecasts: async (
    params?: {
      commodity_id?: string | number;
      sku_id?: string | number;
      page?: number;
      limit?: number;
    },
    signal?: AbortSignal
  ): Promise<PaginatedResponse<Forecast> | Forecast[]> => {
    const query = new URLSearchParams();
    if (params?.commodity_id) query.append('commodity_id', params.commodity_id.toString());
    if (params?.sku_id) query.append('sku_id', params.sku_id.toString());
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<PaginatedResponse<Forecast> | Forecast[]>(
      `${API_ENDPOINTS.FORECASTS}${queryString}`,
      { signal }
    );
  },

  getForecastById: async (id: string | number, signal?: AbortSignal): Promise<Forecast> => {
    return apiClient.get<Forecast>(API_ENDPOINTS.FORECAST_BY_ID(id), { signal });
  },
};
