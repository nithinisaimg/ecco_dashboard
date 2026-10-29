// API & Domain Entity Types for ECCO Shoes Raw Material Forecasting & Procurement Optimization
//
// NOTE: All domain types below represent CANDIDATE CONTRACTS derived from footwear domain requirements.
// Because the actual PostgreSQL database schema has not yet been provisioned in this repository,
// all entity fields are marked as Candidate / Unverified until verified against a running FastAPI backend.

/**
 * Centralized registry of all candidate API endpoints.
 * Markings: Candidate Contract (Awaiting FastAPI & PostgreSQL implementation)
 */
export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  DASHBOARD: '/api/dashboard',
  COMMODITIES: '/api/commodities',
  COMMODITY_BY_ID: (id: string | number) => `/api/commodities/${id}`,
  COMMODITY_PRICES: (id: string | number) => `/api/commodities/${id}/prices`,
  COMMODITY_MARKET_INDICATORS: '/api/commodities/market-indicators',
  SKUS: '/api/skus',
  SKU_BY_ID: (id: string | number) => `/api/skus/${id}`,
  SKU_COMMODITIES: (id: string | number) => `/api/skus/${id}/commodities`,
  SUPPLIERS: '/api/suppliers',
  SUPPLIER_BY_ID: (id: string | number) => `/api/suppliers/${id}`,
  PURCHASES: '/api/purchases',
  PURCHASE_BY_ID: (id: string | number) => `/api/purchases/${id}`,
  FORECASTS: '/api/forecasts',
  FORECAST_BY_ID: (id: string | number) => `/api/forecasts/${id}`,
  RECOMMENDATIONS: '/api/recommendations',
  RECOMMENDATION_BY_ID: (id: string | number) => `/api/recommendations/${id}`,
  RECOMMENDATION_STATUS: (id: string | number) => `/api/recommendations/${id}/status`,
} as const;

export type ApiErrorKind =
  | 'network_failure'
  | 'timeout'
  | 'aborted'
  | 'endpoint_unavailable'
  | 'server_error'
  | 'database_disconnected'
  | 'invalid_response';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages?: number;
}

export interface ApiError {
  status: number;
  statusText: string;
  message: string;
  endpoint: string;
  kind?: ApiErrorKind;
  details?: unknown;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'offline';
  database: 'connected' | 'disconnected' | 'unknown';
  service: string;
  version?: string;
  timestamp?: string;
}

/**
 * Raw Material / Commodity entity (e.g., Calfskin, Rubber, Polymer, Eyelets)
 * Status: Candidate Schema (Unverified against PostgreSQL)
 */
export interface Commodity {
  id: string | number;
  code: string;
  name: string;
  category: string;
  unit_of_measure: string;
  current_price?: number | null;
  currency?: string | null;
  risk_level?: 'low' | 'medium' | 'high' | 'critical' | null;
  lead_time_days?: number | null;
  updated_at?: string | null;
}

/**
 * Historical price point for raw materials
 * Status: Candidate Schema (Unverified against PostgreSQL)
 */
export interface CommodityPriceHistory {
  id: string | number;
  commodity_id: string | number;
  date: string;
  price: number;
  volume?: number | null;
  currency?: string | null;
}

/**
 * External or macroeconomic market risk indicators
 * Status: Candidate Schema (Unverified against PostgreSQL)
 */
export interface MarketIndicator {
  id: string | number;
  name: string;
  category: string;
  value: number;
  unit?: string | null;
  change_pct?: number | null;
  risk_score?: number | null;
  recorded_at: string;
}

/**
 * Finished Shoe Style / Stock Keeping Unit (e.g., ECCO Soft 7)
 * Status: Candidate Schema (Unverified against PostgreSQL)
 */
export interface SKU {
  id: string | number;
  sku_code: string;
  name: string;
  category: string;
  collection?: string | null;
  unit_cost?: number | null;
  currency?: string | null;
  target_stock?: number | null;
  current_inventory?: number | null;
  created_at?: string | null;
}

/**
 * Bill of Materials (BOM) linking a finished Shoe SKU to required Commodities
 * Status: Candidate Schema (Unverified against PostgreSQL)
 */
export interface SKUCommodityMapping {
  id: string | number;
  sku_id: string | number;
  commodity_id: string | number;
  commodity_name?: string | null;
  commodity_code?: string | null;
  quantity_required: number;
  unit: string;
}

/**
 * Global Tannery / Material Supplier
 * Status: Candidate Schema (Unverified against PostgreSQL)
 */
export interface Supplier {
  id: string | number;
  code: string;
  name: string;
  country: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3' | string;
  rating?: number | null;
  on_time_delivery_rate?: number | null;
  quality_score?: number | null;
  esg_compliance_score?: number | null;
  status: 'preferred' | 'approved' | 'under_review' | 'inactive' | string;
  contact_email?: string | null;
}

/**
 * Procurement Purchase Order
 * Status: Candidate Schema (Unverified against PostgreSQL)
 */
export interface PurchaseOrder {
  id: string | number;
  po_number: string;
  supplier_id: string | number;
  supplier_name?: string | null;
  commodity_id?: string | number | null;
  commodity_name?: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  total_amount: number;
  currency: string;
  order_date: string;
  expected_delivery_date?: string | null;
  status: 'draft' | 'pending_approval' | 'ordered' | 'in_transit' | 'delivered' | 'cancelled' | string;
}

/**
 * Individual point within a time-series forecast projection
 * Status: Candidate Schema (Unverified against PostgreSQL)
 */
export interface ForecastPoint {
  date: string;
  predicted_value: number;
  lower_bound?: number | null;
  upper_bound?: number | null;
  actual_value?: number | null;
}

/**
 * Machine learning or statistical forecast run
 * Status: Candidate Schema (Unverified against PostgreSQL)
 */
export interface Forecast {
  id: string | number;
  model_name: string;
  commodity_id?: string | number | null;
  commodity_name?: string | null;
  sku_id?: string | number | null;
  sku_code?: string | null;
  horizon_days: number;
  generated_at: string;
  mean_absolute_error?: number | null;
  confidence_interval?: number | null;
  points?: ForecastPoint[];
}

/**
 * Optimization recommendation generated by procurement algorithms
 * Status: Candidate Schema (Unverified against PostgreSQL)
 */
export interface Recommendation {
  id: string | number;
  recommendation_type: 'bulk_order' | 'dual_sourcing' | 'buffer_stock' | 'price_hedge' | 'supplier_shift' | string;
  priority: 'critical' | 'high' | 'medium' | 'low' | string;
  target_type: 'commodity' | 'sku' | 'supplier' | string;
  target_name: string;
  title: string;
  description: string;
  expected_cost_impact?: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'applied' | string;
  created_at: string;
}

/**
 * Aggregated dashboard metrics response
 * Status: Candidate Schema (Unverified against PostgreSQL)
 */
export interface DashboardSummary {
  total_commodities?: number | null;
  total_skus?: number | null;
  total_suppliers?: number | null;
  total_active_pos?: number | null;
  pending_recommendations_count?: number | null;
  high_risk_commodities_count?: number | null;
  recent_market_alerts?: MarketIndicator[] | null;
  health?: HealthStatus | null;
}
