import { apiClient } from './api-client';
import {
  API_ENDPOINTS,
  type Supplier,
  type PaginatedResponse,
} from '../types/api';

export const supplierService = {
  getSuppliers: async (
    params?: { status?: string; tier?: string; page?: number; limit?: number },
    signal?: AbortSignal
  ): Promise<PaginatedResponse<Supplier> | Supplier[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.tier) query.append('tier', params.tier);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<PaginatedResponse<Supplier> | Supplier[]>(
      `${API_ENDPOINTS.SUPPLIERS}${queryString}`,
      { signal }
    );
  },

  getSupplierById: async (id: string | number, signal?: AbortSignal): Promise<Supplier> => {
    return apiClient.get<Supplier>(API_ENDPOINTS.SUPPLIER_BY_ID(id), { signal });
  },
};
