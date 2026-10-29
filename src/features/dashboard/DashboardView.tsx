import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Box,
  Truck,
  ShoppingCart,
  Sparkles,
  AlertOctagon,
  Activity,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboard-service';
import { healthService } from '../../services/health-service';
import { MetricCard } from '../../components/data-display/MetricCard';
import { StatusBadge } from '../../components/data-display/StatusBadge';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorBanner } from '../../components/feedback/ErrorBanner';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import type { DashboardSummary, HealthStatus, ApiError } from '../../types/api';

export const DashboardView: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchDashboardData = useCallback(async (signal?: AbortSignal) => {
    try {
      // Fetch summary and health concurrently with caller's cancellation signal
      const [summaryRes, healthRes] = await Promise.allSettled([
        dashboardService.getSummary(signal),
        healthService.checkHealth(signal),
      ]);

      if (summaryRes.status === 'fulfilled') {
        setSummary(summaryRes.value);
        setError(null);
      } else {
        const err = summaryRes.reason as ApiError;
        // Don't set error if request was aborted
        if (err?.kind !== 'aborted') {
          setError(err);
          setSummary(null);
        }
      }

      if (healthRes.status === 'fulfilled') {
        setHealth(healthRes.value);
      } else {
        const healthErr = healthRes.reason as ApiError;
        if (healthErr?.kind !== 'aborted') {
          setHealth({ status: 'offline', database: 'unknown', service: 'FastAPI' });
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleManualRefresh = useCallback(() => {
    setIsLoading(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const controller = new AbortController();

    Promise.resolve().then(() => {
      fetchDashboardData(controller.signal);
    });

    const handleExternalRefresh = () => handleManualRefresh();
    window.addEventListener('ecco:refresh-data', handleExternalRefresh);
    return () => {
      controller.abort();
      window.removeEventListener('ecco:refresh-data', handleExternalRefresh);
    };
  }, [fetchDashboardData, handleManualRefresh]);

  // Determine chart state
  const isBackendOffline = health?.status === 'offline' || error?.kind === 'network_failure';

  return (
    <div className="space-y-6">
      {/* Backend & Database Health Status Strip - Keeps health distinct from business data */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${health?.status === 'healthy'
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                : 'bg-red-950/60 border-red-800 text-red-400'
              }`}
          >
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                System Status:
              </span>
              <span
                className={`text-xs font-bold capitalize ${health?.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'
                  }`}
              >
                {health?.status === 'healthy' ? 'FastAPI Connected' : 'FastAPI Offline'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              PostgreSQL Database Connection:{' '}
              <strong className="text-slate-300 capitalize">
                {health?.database || 'Pending API verification'}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <Link
            to="/diagnostics"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <span>View Endpoint Diagnostics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Global Error Banner if API failed */}
      {error && <ErrorBanner error={error} onRetry={handleManualRefresh} />}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Commodities"
          value={summary?.total_commodities}
          subtitle="Raw materials tracked"
          icon={<Layers className="w-4 h-4" />}
          badge="Materials"
          isLoading={isLoading}
        />
        <MetricCard
          title="Active SKUs"
          value={summary?.total_skus}
          subtitle="Shoe styles & collections"
          icon={<Box className="w-4 h-4" />}
          badge="Catalog"
          isLoading={isLoading}
        />
        <MetricCard
          title="Suppliers"
          value={summary?.total_suppliers}
          subtitle="Tanneries & vendors"
          icon={<Truck className="w-4 h-4" />}
          badge="Global"
          isLoading={isLoading}
        />
        <MetricCard
          title="Active POs"
          value={summary?.total_active_pos}
          subtitle="Purchase orders in pipeline"
          icon={<ShoppingCart className="w-4 h-4" />}
          badge="Procurement"
          isLoading={isLoading}
        />
        <MetricCard
          title="High Risk"
          value={summary?.high_risk_commodities_count}
          subtitle="Commodities with volatility"
          icon={<AlertOctagon className="w-4 h-4" />}
          badge="Risk"
          isLoading={isLoading}
        />
        <MetricCard
          title="Action Alerts"
          value={summary?.pending_recommendations_count}
          subtitle="Pending optimization items"
          icon={<Sparkles className="w-4 h-4" />}
          badge="Action Center"
          isLoading={isLoading}
        />
      </div>

      {/* Secondary Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend / Forecast Chart Container */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Raw Material Price & Forecast Trajectory
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Time-series projections for primary footwear commodities
              </p>
            </div>
            <Link
              to="/forecasts"
              className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1"
            >
              Open Forecasts <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Chart Display: Clearly labelled as not yet connected until real endpoint is wired */}
          <div className="min-h-[260px] flex items-center justify-center rounded-lg bg-slate-950/40 border border-slate-800/50 p-6">
            <EmptyState
              title="Trajectory Endpoint Not Connected"
              description="No verified time-series endpoint is currently configured for dashboard trajectory visualization. This panel will activate once a verified forecasting or commodity price history feed is connected."
              icon={isBackendOffline ? 'offline' : 'alert'}
              variant={isBackendOffline ? 'offline' : 'endpoint_missing'}
            />
          </div>
        </div>

        {/* Market Indicators / Risk Alerts Container */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 shadow-lg backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              Market Risk Indicators
            </h2>
            <Link
              to="/commodities"
              className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Checking market indicators..." />
          ) : !summary?.recent_market_alerts || summary.recent_market_alerts.length === 0 ? (
            <EmptyState
              title="No market risk alerts"
              description="No elevated risk indicators reported by the backend."
              icon="database"
              variant={isBackendOffline ? 'offline' : 'empty'}
            />
          ) : (
            <div className="divide-y divide-slate-800/80 flex-1">
              {summary.recent_market_alerts.map((indicator) => (
                <div key={indicator.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{indicator.name}</p>
                    <span className="text-[10px] text-slate-500">{indicator.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-medium text-white">
                      {indicator.value} {indicator.unit || ''}
                    </span>
                    {indicator.risk_score !== undefined && indicator.risk_score !== null && (
                      <div className="mt-0.5">
                        <StatusBadge
                          status={indicator.risk_score > 70 ? 'high' : 'medium'}
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
