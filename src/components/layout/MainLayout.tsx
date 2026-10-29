import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../navigation/Sidebar';
import { Header } from '../navigation/Header';

const routeHeaders: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Executive Procurement & Forecasting Dashboard',
    subtitle: 'Real-time commodity trends, SKU cost dependencies, and model recommendations for ECCO Footwear',
  },
  '/commodities': {
    title: 'Raw Materials & Commodity Intelligence',
    subtitle: 'Leather hides, calfskin, synthetic polymers, rubber, and macro market risk indicators',
  },
  '/skus': {
    title: 'SKU Catalog & Bill of Materials (BOM)',
    subtitle: 'Footwear collections, material requirement mapping, and inventory status',
  },
  '/suppliers': {
    title: 'Suppliers & Tanneries Qualification',
    subtitle: 'Global vendor directory, ESG compliance, lead times, and on-time performance scores',
  },
  '/purchases': {
    title: 'Purchase Orders & Procurement Transactions',
    subtitle: 'Material purchase order tracking, volume summaries, and fulfillment records',
  },
  '/forecasts': {
    title: 'Forecasting Models & Demand Projections',
    subtitle: 'Machine learning model runs, price predictions, error metrics, and confidence bands',
  },
  '/recommendations': {
    title: 'Procurement Action Center & Optimization',
    subtitle: 'Algorithmic purchase timing, bulk discount advisories, and risk hedging actions',
  },
  '/diagnostics': {
    title: 'FastAPI Backend & PostgreSQL Diagnostics',
    subtitle: 'Endpoint health verification, schema inspectability, and live latency monitoring',
  },
};

export const MainLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const location = useLocation();

  const currentRoute = routeHeaders[location.pathname] || {
    title: 'ECCO Shoes Optimization Platform',
    subtitle: 'Raw Material Forecasting and Strategic Procurement',
  };

  const handleRefresh = () => {
    // Dispatch custom event to notify active view to re-fetch
    window.dispatchEvent(new CustomEvent('ecco:refresh-data'));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />

      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Header
          title={currentRoute.title}
          subtitle={currentRoute.subtitle}
          onRefresh={handleRefresh}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
