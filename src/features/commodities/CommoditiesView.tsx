import React, { useState, useEffect, useCallback } from 'react';
import { Layers, TrendingUp, X } from 'lucide-react';
import { commodityService } from '../../services/commodity-service';
import { DataTable, type Column } from '../../components/data-display/DataTable';
import { StatusBadge } from '../../components/data-display/StatusBadge';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { EmptyState } from '../../components/feedback/EmptyState';
import type { Commodity, CommodityPriceHistory, ApiError } from '../../types/api';

export const CommoditiesView: React.FC = () => {
  const [commodities, setCommodities] = useState<Commodity[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Price history modal state
  const [activeCommodity, setActiveCommodity] = useState<Commodity | null>(null);
  const [priceHistory, setPriceHistory] = useState<CommodityPriceHistory[] | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<ApiError | null>(null);

  const fetchCommodities = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await commodityService.getCommodities(
        {
          category: selectedCategory === 'all' ? undefined : selectedCategory,
        },
        signal
      );
      // Handle both paginated and raw array responses
      const items = Array.isArray(res) ? res : res?.items || [];
      setCommodities(items);
      setError(null);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr?.kind !== 'aborted') {
        setError(apiErr);
        setCommodities(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  const handleManualRefresh = useCallback(() => {
    setIsLoading(true);
    fetchCommodities();
  }, [fetchCommodities]);

  useEffect(() => {
    const controller = new AbortController();

    Promise.resolve().then(() => {
      fetchCommodities(controller.signal);
    });

    const handleExternalRefresh = () => handleManualRefresh();
    window.addEventListener('ecco:refresh-data', handleExternalRefresh);
    return () => {
      controller.abort();
      window.removeEventListener('ecco:refresh-data', handleExternalRefresh);
    };
  }, [fetchCommodities, handleManualRefresh]);

  const handleOpenPriceHistory = async (commodity: Commodity) => {
    setActiveCommodity(commodity);
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const history = await commodityService.getPriceHistory(commodity.id);
      setPriceHistory(history);
    } catch (err) {
      setHistoryError(err as ApiError);
      setPriceHistory(null);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Commodities' },
    { id: 'leather', label: 'Leather & Hides' },
    { id: 'rubber', label: 'Rubber & Polymers' },
    { id: 'textiles', label: 'Textiles & Linings' },
    { id: 'hardware', label: 'Hardware & Eyelets' },
  ];

  const columns: Column<Commodity>[] = [
    {
      key: 'code',
      header: 'Commodity Code',
      sortable: true,
      render: (item) => (
        <span className="font-mono font-medium text-amber-400">{item.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Material Name',
      sortable: true,
      render: (item) => (
        <span className="font-medium text-white">{item.name}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (item) => (
        <span className="capitalize text-slate-300">{item.category}</span>
      ),
    },
    {
      key: 'unit_of_measure',
      header: 'Unit',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-slate-400">{item.unit_of_measure}</span>
      ),
    },
    {
      key: 'current_price',
      header: 'Current Price',
      sortable: true,
      align: 'right',
      render: (item) =>
        item.current_price !== undefined && item.current_price !== null ? (
          <span className="font-mono font-semibold text-emerald-400">
            {item.currency || '$'}{Number(item.current_price).toFixed(2)}
          </span>
        ) : (
          <span className="text-slate-500 italic text-[11px]">Unavailable</span>
        ),
    },
    {
      key: 'lead_time_days',
      header: 'Lead Time',
      sortable: true,
      align: 'center',
      render: (item) =>
        item.lead_time_days !== undefined && item.lead_time_days !== null ? (
          <span className="text-slate-300">{item.lead_time_days} days</span>
        ) : (
          <span className="text-slate-500 italic text-[11px]">Unavailable</span>
        ),
    },
    {
      key: 'risk_level',
      header: 'Risk Level',
      sortable: true,
      render: (item) =>
        item.risk_level ? (
          <StatusBadge status={item.risk_level} type="risk" />
        ) : (
          <span className="text-slate-500">—</span>
        ),
    },
    {
      key: 'actions',
      header: 'History',
      align: 'right',
      render: (item) => (
        <button
          onClick={() => handleOpenPriceHistory(item)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
        >
          <TrendingUp className="w-3 h-3" />
          Prices
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setIsLoading(true);
              setSelectedCategory(cat.id);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        data={commodities as unknown as Record<string, unknown>[] | null}
        isLoading={isLoading}
        error={error}
        onRetry={handleManualRefresh}
        searchPlaceholder="Search materials by name or code..."
        searchKey="name"
        emptyTitle="No commodity records found"
        emptyDescription="No raw material records are available in the PostgreSQL database for this category."
      />

      {/* Price History Modal */}
      {activeCommodity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  {activeCommodity.name} ({activeCommodity.code})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Historical price recordings from PostgreSQL database
                </p>
              </div>
              <button
                onClick={() => setActiveCommodity(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4">
              {isLoadingHistory ? (
                <LoadingSpinner message="Querying price records..." />
              ) : historyError ? (
                <EmptyState
                  title="Unable to load price history"
                  description={historyError.message}
                  icon="alert"
                  variant={historyError.kind === 'endpoint_unavailable' ? 'endpoint_missing' : 'offline'}
                />
              ) : !priceHistory || priceHistory.length === 0 ? (
                <EmptyState
                  title="No price history recorded"
                  description="No historical pricing points found for this commodity in the database."
                  icon="database"
                />
              ) : (
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                        <th className="p-2">Date</th>
                        <th className="p-2 text-right">Price</th>
                        <th className="p-2 text-right">Volume</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                      {priceHistory.map((rec) => (
                        <tr key={rec.id}>
                          <td className="p-2 text-slate-400">{rec.date}</td>
                          <td className="p-2 text-right text-emerald-400">
                            {rec.currency || '$'}{Number(rec.price).toFixed(2)}
                          </td>
                          <td className="p-2 text-right text-slate-400">{rec.volume ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setActiveCommodity(null)}
                className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
