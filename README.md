# ECCO Shoes — Raw Material Forecasting & Procurement Optimization Frontend

Enterprise frontend architecture for the **ECCO Shoes Raw Material Forecasting & Procurement Optimization** platform. Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **React Router v7**, **Lucide Icons**, and **Recharts**.

---

## 1. Architecture Overview

This frontend acts as an intelligent procurement action center for footwear supply chain managers, buyers, and inventory analysts. It models the core footwear manufacturing lifecycle: tracking leather hides, calfskin, synthetic polymers, and textiles through Bill of Materials (BOM) mappings to finished shoe models (e.g. ECCO Soft 7, Biom), evaluating global tannery suppliers, tracking purchase orders, visualizing ML forecasting projections, and executing optimization actions.

```text
[ React 19 + TypeScript + Tailwind CSS ]  (Default Port: 5173)
                   │
                   ▼ HTTP / JSON (Fetch API Client)
        [ Python FastAPI Backend ]       (Default Port: 8000)
                   │
                   ▼ SQLAlchemy / asyncpg
        [ PostgreSQL Database ]          (Default Port: 5432)
```

> **Strict Data Integrity Policy**: This application contains **zero mock data, zero fake users, and zero fabricated business numbers**. When the backend is offline or the database is unpopulated, explicit, styled empty, unconfigured, or offline states are displayed with detailed diagnostics. Missing metrics are presented as "Unavailable" rather than zero.

---

## 2. Directory Structure

The project adheres strictly to a domain-driven, modular frontend architecture:

```text
src/
├── main.tsx                   # Application bootstrap
├── index.css                  # Tailwind v4 directives & Scandinavian dark theme tokens
├── app/
│   ├── App.tsx                # Root App component with RouterProvider
│   └── router.tsx             # Centralized route definitions
├── components/
│   ├── layout/
│   │   └── MainLayout.tsx     # Shell layout (Sidebar + Header + Page container)
│   ├── navigation/
│   │   ├── Sidebar.tsx        # Navigation sidebar with real-time FastAPI ping
│   │   └── Header.tsx         # Contextual header with backend URL & Swagger docs link
│   ├── data-display/
│   │   ├── MetricCard.tsx     # KPI summary card with trend indicator & unavailable states
│   │   ├── DataTable.tsx      # Reusable table with search, sort, pagination, and empty states
│   │   └── StatusBadge.tsx    # Styled badges for risk, PO statuses, and supplier tiers
│   └── feedback/
│       ├── LoadingSpinner.tsx # Pulsing loading indicator
│       ├── EmptyState.tsx     # Formatted empty/offline/unconfigured state
│       └── ErrorBanner.tsx    # Network & API error telemetry with troubleshooting tips
├── features/
│   ├── dashboard/
│   │   └── DashboardView.tsx  # Executive overview & market alerts
│   ├── commodities/
│   │   └── CommoditiesView.tsx# Raw materials & price history inspection
│   ├── skus/
│   │   └── SkusView.tsx       # Shoe style catalog & Bill of Materials (BOM) modal
│   ├── suppliers/
│   │   └── SuppliersView.tsx  # Global tanneries, ESG ratings, and performance
│   ├── purchases/
│   │   └── PurchasesView.tsx  # Purchase orders and procurement tracking
│   ├── forecasts/
│   │   └── ForecastsView.tsx  # ML forecast executions & Recharts area visualization
│   ├── recommendations/
│   │   └── RecommendationsView.tsx # Algorithmic procurement action center with in-flight guards
│   └── diagnostics/
│       └── DiagnosticsView.tsx# Live FastAPI contract tester & schema inspector
├── services/
│   ├── api-client.ts          # Centralized Fetch API client with timeout, abort & error handling
│   ├── health-service.ts      # Health check endpoint service
│   ├── dashboard-service.ts   # Dashboard summary endpoint service
│   ├── commodity-service.ts   # Commodities and price history service
│   ├── sku-service.ts         # SKU catalog and BOM mappings service
│   ├── supplier-service.ts    # Supplier directory and performance service
│   ├── purchase-service.ts    # Purchase orders service
│   ├── forecast-service.ts    # Forecasting models and points service
│   └── recommendation-service.ts # Recommendations and status mutation service
└── types/
    └── api.ts                 # TypeScript interfaces, API_ENDPOINTS registry & error models
```

---

## 3. Application Routes

| Path | View Component | Description |
| :--- | :--- | :--- |
| `/` | `DashboardView` | Executive KPI cards, real-time FastAPI health, market alerts, trajectory placeholder |
| `/commodities` | `CommoditiesView` | Raw materials inventory, category filters, and price history drawer |
| `/skus` | `SkusView` | Shoe model catalog, inventory levels, and Bill of Materials (BOM) modal |
| `/suppliers` | `SuppliersView` | Tanneries directory, supply tiers, ratings, and ESG scores |
| `/purchases` | `PurchasesView` | Purchase order tracking, quantities, unit prices, and fulfillment status |
| `/forecasts` | `ForecastsView` | Model runs (ARIMA/LSTM), error metrics, and Recharts area plot |
| `/recommendations` | `RecommendationsView` | Procurement advice, bulk purchase tips, and approve/reject workflows |
| `/diagnostics` | `DiagnosticsView` | Interactive FastAPI test suite with latency monitoring & JSON inspection |

---

## 4. API Compatibility & Implementation Checklist

All candidate endpoints are derived from footwear procurement domain specifications.

| # | Endpoint | Method | Expected Response Schema | Status |
| :- | :--- | :--- | :--- | :--- |
| 1 | `/api/health` | `GET` | `HealthStatus` (`{ status, database, service }`) | Defined API contract awaiting backend implementation |
| 2 | `/api/dashboard` | `GET` | `DashboardSummary` | Defined API contract awaiting backend implementation |
| 3 | `/api/commodities` | `GET` | `PaginatedResponse<Commodity>` or `Commodity[]` | Defined API contract awaiting backend implementation |
| 4 | `/api/commodities/{id}` | `GET` | `Commodity` | Defined API contract awaiting backend implementation |
| 5 | `/api/commodities/{id}/prices` | `GET` | `CommodityPriceHistory[]` | Defined API contract awaiting backend implementation |
| 6 | `/api/commodities/market-indicators` | `GET` | `MarketIndicator[]` | Defined API contract awaiting backend implementation |
| 7 | `/api/skus` | `GET` | `PaginatedResponse<SKU>` or `SKU[]` | Defined API contract awaiting backend implementation |
| 8 | `/api/skus/{id}` | `GET` | `SKU` | Defined API contract awaiting backend implementation |
| 9 | `/api/skus/{id}/commodities` | `GET` | `SKUCommodityMapping[]` (BOM) | Defined API contract awaiting backend implementation |
| 10 | `/api/suppliers` | `GET` | `PaginatedResponse<Supplier>` or `Supplier[]` | Defined API contract awaiting backend implementation |
| 11 | `/api/suppliers/{id}` | `GET` | `Supplier` | Defined API contract awaiting backend implementation |
| 12 | `/api/purchases` | `GET` | `PaginatedResponse<PurchaseOrder>` or `PurchaseOrder[]` | Defined API contract awaiting backend implementation |
| 13 | `/api/purchases/{id}` | `GET` | `PurchaseOrder` | Defined API contract awaiting backend implementation |
| 14 | `/api/forecasts` | `GET` | `PaginatedResponse<Forecast>` or `Forecast[]` | Defined API contract awaiting backend implementation |
| 15 | `/api/forecasts/{id}` | `GET` | `Forecast` | Defined API contract awaiting backend implementation |
| 16 | `/api/recommendations` | `GET` | `PaginatedResponse<Recommendation>` or `Recommendation[]` | Defined API contract awaiting backend implementation |
| 17 | `/api/recommendations/{id}/status` | `PUT` | `Recommendation` | Defined API contract awaiting backend implementation |

---

## 5. Implementation Status Breakdown

### Implemented and Locally Verified
- [x] Full Scandinavian minimalist enterprise design system with responsive collapsible sidebar and contextual header.
- [x] Complete domain-driven routing and navigation across all 8 views.
- [x] Centralized Fetch API client (`src/services/api-client.ts`) with timeout handling, caller `AbortSignal` merging, distinct error kinds (`network_failure`, `endpoint_unavailable`, `server_error`, `invalid_response`, `aborted`, `timeout`), and security check preventing database connection string leakage.
- [x] Strongly typed service modules and entity interfaces for all domain models in `src/types/api.ts`.
- [x] Strict data integrity enforcement: NO mock records, NO fabricated chart points, authentic empty/unavailable states.
- [x] Reusable `DataTable` with multi-field search, multi-type sorting (numbers, dates, strings), pagination, and stable React keys.
- [x] Live API Diagnostics suite (`/diagnostics`) with latency monitoring and JSON payload inspection.
- [x] Clean production build (`npm run build`) passing TypeScript compilation and Vite bundling with 0 errors.
- [x] Clean linter check (`npm run lint`) with 0 errors and 0 warnings.

### Implemented but Not Connected to the Backend
- [ ] Live PostgreSQL metric aggregation on `/api/dashboard`.
- [ ] Commodity inventory and price history rows on `/api/commodities`.
- [ ] Finished shoe model catalog and Bill of Materials on `/api/skus`.
- [ ] Supplier ratings, on-time delivery rates, and ESG compliance scores on `/api/suppliers`.
- [ ] Active purchase orders on `/api/purchases`.
- [ ] Statistical and ML forecast trajectories with confidence intervals on `/api/forecasts`.
- [ ] Algorithmic procurement recommendations and mutation actions on `/api/recommendations`.

### Defined API Contract Awaiting Backend Implementation
- [ ] All 17 candidate endpoints listed in Section 4.
- [ ] Standardized health response `{ status: 'healthy', database: 'connected' | 'disconnected', service: 'FastAPI' }`.

### Blocked by Missing Schema or Backend Infrastructure
- [ ] PostgreSQL / SQLite database file or migrations containing footwear domain tables (`commodities`, `skus`, `suppliers`, `purchases`, `forecasts`, `recommendations`, `sku_commodity_mappings`).
- [ ] Running FastAPI server instance listening on `http://localhost:8000` with CORS configured for `http://localhost:5173`.

---

## 6. Setup & Running Instructions

### Prerequisites
- Node.js >= 18.x (tested on v22.x)
- npm >= 9.x (tested on v10.x)

### Installation
```bash
# Clone or navigate to the project directory
cd ecco_1

# Install dependencies
npm install
```

### Environment Configuration
```bash
# Copy template to active environment file
cp .env.example .env
```
Ensure `VITE_API_BASE_URL` points to your running FastAPI instance:
```env
VITE_API_BASE_URL=http://localhost:8000
```
> **Security Notice**: Never put database connection strings or server secrets in `.env`. The frontend must communicate exclusively with FastAPI via HTTP REST.

### Run Development Server
```bash
npm run dev
# The application will start at http://localhost:5173
```

### Production Build & Linting
```bash
# Type check and production build
npm run build

# Code linting
npm run lint
```
