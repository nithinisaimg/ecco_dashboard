import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { DashboardView } from '../features/dashboard/DashboardView';
import { CommoditiesView } from '../features/commodities/CommoditiesView';
import { SkusView } from '../features/skus/SkusView';
import { SuppliersView } from '../features/suppliers/SuppliersView';
import { PurchasesView } from '../features/purchases/PurchasesView';
import { ForecastsView } from '../features/forecasts/ForecastsView';
import { RecommendationsView } from '../features/recommendations/RecommendationsView';
import { DiagnosticsView } from '../features/diagnostics/DiagnosticsView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DashboardView />,
      },
      {
        path: 'commodities',
        element: <CommoditiesView />,
      },
      {
        path: 'skus',
        element: <SkusView />,
      },
      {
        path: 'suppliers',
        element: <SuppliersView />,
      },
      {
        path: 'purchases',
        element: <PurchasesView />,
      },
      {
        path: 'forecasts',
        element: <ForecastsView />,
      },
      {
        path: 'recommendations',
        element: <RecommendationsView />,
      },
      {
        path: 'diagnostics',
        element: <DiagnosticsView />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
