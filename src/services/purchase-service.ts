import { apiClient } from './api-client';
import {
  API_ENDPOINTS,
  type PurchaseOrder,
  type PaginatedResponse,
} from '../types/api';

export const purchaseService = {
  getPurchases: async (
    params?: {
      status?: string;
      supplier_id?: string | number;
      page?: number;
      limit?: number;
    },
    signal?: AbortSignal
  ): Promise<PaginatedResponse<PurchaseOrder> | PurchaseOrder[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.supplier_id) query.append('supplier_id', params.supplier_id.toString());
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<PaginatedResponse<PurchaseOrder> | PurchaseOrder[]>(
      `${API_ENDPOINTS.PURCHASES}${queryString}`,
      { signal }
    );
  },

  getPurchaseById: async (id: string | number, signal?: AbortSignal): Promise<PurchaseOrder> => {
    return apiClient.get<PurchaseOrder>(API_ENDPOINTS.PURCHASE_BY_ID(id), { signal });
  },
};
