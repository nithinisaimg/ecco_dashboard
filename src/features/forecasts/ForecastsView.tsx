import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, Cpu, Calendar, BarChart2 } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { forecastService } from '../../services/forecast-service';
import { DataTable, type Column } from '../../components/data-display/DataTable';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import type { Forecast, ForecastPoint, ApiError } from '../../types/api';

export const ForecastsView: React.FC = () => {
  const [forecasts, setForecasts] = useState<Forecast[] | null>(null);
  const [selectedForecast, setSelectedForecast] = useState<Forecast | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchForecasts = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await forecastService.getForecasts(undefined, signal);
      const items = Array.isArray(res) ? res : res?.items || [];
      setForecasts(items);
      setError(null);
      setSelectedForecast((prev) => {
        if (!prev && items.length > 0) return items[0];
        if (prev && items.some((it) => it.id === prev.id)) {
          return items.find((it) => it.id === prev.id) || null;
        }
        return items[0] || null;
      });
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr?.kind !== 'aborted') {
        setError(apiErr);
        setForecasts(null);
        setSelectedForecast(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleManualRefresh = useCallback(() => {
    setIsLoading(true);
    fetchForecasts();
  }, [fetchForecasts]);

  useEffect(() => {
    const controller = new AbortController();

    Promise.resolve().then(() => {
      fetchForecasts(controller.signal);
    });

    const handleExternalRefresh = () => handleManualRefresh();
    window.addEventListener('ecco:refresh-data', handleExternalRefresh);
    return () => {
      controller.abort();
      window.removeEventListener('ecco:refresh-data', handleExternalRefresh);
    };
  }, [fetchForecasts, handleManualRefresh]);

  // Validate points before feeding them to Recharts AreaChart
  const validatedPoints: ForecastPoint[] = useMemo(() => {
    if (!selectedForecast?.points || !Array.isArray(selectedForecast.points)) {
      return [];
    }
    return selectedForecast.points.filter((pt) => {
      const hasDate = Boolean(pt?.date && typeof pt.date === 'string');
      const hasNumericPrediction =
        typeof pt?.predicted_value === 'number' && !isNaN(pt.predicted_value);
      return hasDate && hasNumericPrediction;
    });
  }, [selectedForecast]);

  const hasRuns = forecasts && forecasts.length > 0;
  const hasPoints = validatedPoints.length > 0;

  const columns: Column<Forecast>[] = [
    {
      key: 'model_name',
      header: 'Model Name',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-amber-400" />
          <span className="font-medium text-white">{item.model_name}</span>
        </div>
      ),
    },
    {
      key: 'target',
      header: 'Target Entity',
      sortable: true,
      render: (item) => (
        <span className="text-slate-300">
          {item.commodity_name || item.sku_code || `Target #${item.commodity_id || item.sku_id}`}
        </span>
      ),
    },
    {
      key: 'horizon_days',
      header: 'Horizon',
      sortable: true,
      align: 'center',
      render: (item) => (
        <span className="font-mono text-slate-300">{item.horizon_days} days</span>
      ),
    },
    {
      key: 'mean_absolute_error',
      header: 'MAE Error',
      sortable: true,
      align: 'right',
      render: (item) =>
        item.mean_absolute_error !== undefined && item.mean_absolute_error !== null ? (
          <span className="font-mono text-amber-400">
            {Number(item.mean_absolute_error).toFixed(3)}
          </span>
        ) : (
          <span className="text-slate-500 italic text-[11px]">Unavailable</span>
        ),
    },
    {
      key: 'confidence_interval',
      header: 'Confidence',
      sortable: true,
      align: 'right',
      render: (item) =>
        item.confidence_interval !== undefined && item.confidence_interval !== null ? (
          <span className="font-mono text-emerald-400">
            {Number(item.confidence_interval).toFixed(0)}%
          </span>
        ) : (
          <span className="text-slate-500 italic text-[11px]">Unavailable</span>
        ),
    },
    {
      key: 'generated_at',
      header: 'Generated At',
      sortable: true,
      render: (item) => <span className="font-mono text-slate-400">{item.generated_at}</span>,
    },
    {
      key: 'actions',
      header: 'Visualization',
      align: 'right',
      render: (item) => (
        <button
          onClick={() => setSelectedForecast(item)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
            selectedForecast?.id === item.id
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
          }`}
        >
          <BarChart2 className="w-3 h-3" />
          View Chart
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Forecast Visual Chart Section */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              {selectedForecast
                ? `${selectedForecast.model_name} — ${
                    selectedForecast.commodity_name || selectedForecast.sku_code || 'Model Projections'
                  }`
                : 'Forecast Projections'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Predicted raw material requirements and commodity price path
            </p>
          </div>
          {selectedForecast && (
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Horizon: {selectedForecast.horizon_days}d</span>
            </div>
          )}
        </div>

        <div className="pt-4">
          {isLoading ? (
            <LoadingSpinner fullHeight message="Checking for forecast output..." />
          ) : !hasRuns ? (
            /* Explicit Distinction: No forecast records exist in database */
            <EmptyState
              title="No Forecast Runs Available"
              description="No statistical or machine learning forecast model runs are currently recorded in the database. Forecast runs will appear here once executed via the Python FastAPI backend."
              icon="database"
              variant={error ? 'offline' : 'empty'}
            />
          ) : !hasPoints ? (
            /* Explicit Distinction: Model run exists, but has no prediction points */
            <EmptyState
              title={`No Prediction Points for ${selectedForecast?.model_name || 'Selected Model'}`}
              description="This forecast run record exists in the database, but contains no time-series projection points."
              icon="alert"
              variant="empty"
            />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={validatedPoints}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="predicted_value"
                    name="Predicted"
                    stroke="#f59e0b"
                    fillOpacity={1}
                    fill="url(#predictedGrad)"
                    strokeWidth={2}
                  />
                  {validatedPoints[0]?.actual_value !== undefined && validatedPoints[0]?.actual_value !== null && (
                    <Area
                      type="monotone"
                      dataKey="actual_value"
                      name="Actuals"
                      stroke="#10b981"
                      fillOpacity={0}
                      strokeWidth={2}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Forecast Runs Table */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Historical Model Executions
        </h3>
        <DataTable
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          data={forecasts as unknown as Record<string, unknown>[] | null}
          isLoading={isLoading}
          error={error}
          onRetry={handleManualRefresh}
          searchPlaceholder="Search models or target materials..."
          searchKey="model_name"
          emptyTitle="No forecast runs found"
          emptyDescription="No statistical or machine learning forecast runs are recorded in the PostgreSQL database."
        />
      </div>
    </div>
  );
};
