import React, { useState, useEffect, useCallback } from 'react';
import { Box, Layers, X } from 'lucide-react';
import { skuService } from '../../services/sku-service';
import { DataTable, type Column } from '../../components/data-display/DataTable';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { EmptyState } from '../../components/feedback/EmptyState';
import type { SKU, SKUCommodityMapping, ApiError } from '../../types/api';

export const SkusView: React.FC = () => {
  const [skus, setSkus] = useState<SKU[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  // BOM Mapping Modal State
  const [selectedSku, setSelectedSku] = useState<SKU | null>(null);
  const [mappings, setMappings] = useState<SKUCommodityMapping[] | null>(null);
  const [isLoadingMappings, setIsLoadingMappings] = useState<boolean>(false);
  const [mappingError, setMappingError] = useState<ApiError | null>(null);

  const fetchSkus = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await skuService.getSkus(undefined, signal);
      const items = Array.isArray(res) ? res : res?.items || [];
      setSkus(items);
      setError(null);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr?.kind !== 'aborted') {
        setError(apiErr);
        setSkus(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleManualRefresh = useCallback(() => {
    setIsLoading(true);
    fetchSkus();
  }, [fetchSkus]);

  useEffect(() => {
    const controller = new AbortController();

    Promise.resolve().then(() => {
      fetchSkus(controller.signal);
    });

    const handleExternalRefresh = () => handleManualRefresh();
    window.addEventListener('ecco:refresh-data', handleExternalRefresh);
    return () => {
      controller.abort();
      window.removeEventListener('ecco:refresh-data', handleExternalRefresh);
    };
  }, [fetchSkus, handleManualRefresh]);

  const handleOpenBOM = async (sku: SKU) => {
    setSelectedSku(sku);
    setIsLoadingMappings(true);
    setMappingError(null);
    try {
      const boms = await skuService.getCommodityMappings(sku.id);
      setMappings(boms);
    } catch (err) {
      setMappingError(err as ApiError);
      setMappings(null);
    } finally {
      setIsLoadingMappings(false);
    }
  };

  const columns: Column<SKU>[] = [
    {
      key: 'sku_code',
      header: 'SKU Code',
      sortable: true,
      render: (item) => (
        <span className="font-mono font-medium text-amber-400">{item.sku_code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Shoe Model Name',
      sortable: true,
      render: (item) => <span className="font-medium text-white">{item.name}</span>,
    },
    {
      key: 'collection',
      header: 'Collection',
      sortable: true,
      render: (item) => (
        <span className="text-slate-300">{item.collection || 'Core Collection'}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (item) => <span className="capitalize text-slate-400">{item.category}</span>,
    },
    {
      key: 'unit_cost',
      header: 'Unit Cost',
      sortable: true,
      align: 'right',
      render: (item) =>
        item.unit_cost !== undefined && item.unit_cost !== null ? (
          <span className="font-mono font-medium text-slate-200">
            {item.currency || '$'}{Number(item.unit_cost).toFixed(2)}
          </span>
        ) : (
          <span className="text-slate-500 italic text-[11px]">Unavailable</span>
        ),
    },
    {
      key: 'current_inventory',
      header: 'Current Stock',
      sortable: true,
      align: 'right',
      render: (item) =>
        item.current_inventory !== undefined && item.current_inventory !== null ? (
          <span
            className={`font-mono font-medium ${item.target_stock && item.current_inventory < item.target_stock
                ? 'text-amber-400'
                : 'text-emerald-400'
              }`}
          >
            {item.current_inventory.toLocaleString()} pairs
          </span>
        ) : (
          <span className="text-slate-500 italic text-[11px]">Unavailable</span>
        ),
    },
    {
      key: 'target_stock',
      header: 'Target Stock',
      sortable: true,
      align: 'right',
      render: (item) =>
        item.target_stock !== undefined && item.target_stock !== null ? (
          <span className="font-mono text-slate-400">
            {item.target_stock.toLocaleString()} pairs
          </span>
        ) : (
          <span className="text-slate-500">—</span>
        ),
    },
    {
      key: 'actions',
      header: 'Materials (BOM)',
      align: 'right',
      render: (item) => (
        <button
          onClick={() => handleOpenBOM(item)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
        >
          <Layers className="w-3 h-3" />
          BOM
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        data={skus as unknown as Record<string, unknown>[] | null}
        isLoading={isLoading}
        error={error}
        onRetry={handleManualRefresh}
        searchPlaceholder="Search footwear models or SKU codes..."
        searchKey="name"
        emptyTitle="No SKU records found"
        emptyDescription="No finished shoe models are registered in the PostgreSQL database."
      />

      {/* Bill of Materials (BOM) Modal */}
      {selectedSku && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Box className="w-4 h-4 text-amber-400" />
                  {selectedSku.name} — Bill of Materials (BOM)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  SKU: <span className="font-mono text-amber-400">{selectedSku.sku_code}</span> |
                  Raw material requirements per pair
                </p>
              </div>
              <button
                onClick={() => setSelectedSku(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4">
              {isLoadingMappings ? (
                <LoadingSpinner message="Retrieving bill of materials..." />
              ) : mappingError ? (
                <EmptyState
                  title="Unable to load BOM mapping"
                  description={mappingError.message}
                  icon="alert"
                  variant={mappingError.kind === 'endpoint_unavailable' ? 'endpoint_missing' : 'offline'}
                />
              ) : !mappings || mappings.length === 0 ? (
                <EmptyState
                  title="No BOM mappings registered"
                  description="No raw material mappings have been configured for this shoe model in the database."
                  icon="database"
                />
              ) : (
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                        <th className="p-2">Material Code</th>
                        <th className="p-2">Commodity Name</th>
                        <th className="p-2 text-right">Required Quantity</th>
                        <th className="p-2 text-right">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {mappings.map((bom) => (
                        <tr key={bom.id}>
                          <td className="p-2 font-mono text-amber-400">{bom.commodity_code || '—'}</td>
                          <td className="p-2 font-medium text-white">{bom.commodity_name || `Commodity #${bom.commodity_id}`}</td>
                          <td className="p-2 text-right font-mono font-semibold text-slate-200">
                            {bom.quantity_required}
                          </td>
                          <td className="p-2 text-right font-mono text-slate-400">{bom.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedSku(null)}
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
