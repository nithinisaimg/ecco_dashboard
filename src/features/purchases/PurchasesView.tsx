import React, { useState, useEffect, useCallback } from 'react';

import { purchaseService } from '../../services/purchase-service';
import { DataTable, type Column } from '../../components/data-display/DataTable';
import { StatusBadge } from '../../components/data-display/StatusBadge';
import type { PurchaseOrder, ApiError } from '../../types/api';

export const PurchasesView: React.FC = () => {
  const [purchases, setPurchases] = useState<PurchaseOrder[] | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchPurchases = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await purchaseService.getPurchases(
        {
          status: selectedStatus === 'all' ? undefined : selectedStatus,
        },
        signal
      );
      const items = Array.isArray(res) ? res : res?.items || [];
      setPurchases(items);
      setError(null);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr?.kind !== 'aborted') {
        setError(apiErr);
        setPurchases(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus]);

  const handleManualRefresh = useCallback(() => {
    setIsLoading(true);
    fetchPurchases();
  }, [fetchPurchases]);

  useEffect(() => {
    const controller = new AbortController();

    // Defer execution to avoid synchronous cascading re-render in effect body
    Promise.resolve().then(() => {
      fetchPurchases(controller.signal);
    });

    const handleExternalRefresh = () => handleManualRefresh();
    window.addEventListener('ecco:refresh-data', handleExternalRefresh);
    return () => {
      controller.abort();
      window.removeEventListener('ecco:refresh-data', handleExternalRefresh);
    };
  }, [fetchPurchases, handleManualRefresh]);

  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'po_number',
      header: 'PO Number',
      sortable: true,
      render: (item) => (
        <span className="font-mono font-medium text-amber-400">{item.po_number}</span>
      ),
    },
    {
      key: 'supplier_name',
      header: 'Supplier / Tannery',
      sortable: true,
      render: (item) => (
        <span className="font-medium text-white">
          {item.supplier_name || `Supplier #${item.supplier_id}`}
        </span>
      ),
    },
    {
      key: 'commodity_name',
      header: 'Material / Commodity',
      sortable: true,
      render: (item) => (
        <span className="text-slate-300">
          {item.commodity_name || `Commodity #${item.commodity_id}`}
        </span>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className="font-mono font-medium text-white">
          {item.quantity?.toLocaleString() ?? '—'} {item.unit || ''}
        </span>
      ),
    },
    {
      key: 'unit_price',
      header: 'Unit Price',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className="font-mono text-slate-300">
          {item.currency || '$'}{Number(item.unit_price || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'total_amount',
      header: 'Total Order Value',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className="font-mono font-bold text-emerald-400">
          {item.currency || '$'}{Number(item.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'order_date',
      header: 'Order Date',
      sortable: true,
      render: (item) => <span className="font-mono text-slate-400">{item.order_date}</span>,
    },
    {
      key: 'expected_delivery_date',
      header: 'Expected Delivery',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-slate-400">{item.expected_delivery_date || '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} type="po" />,
    },
  ];

  const statusFilters = [
    { id: 'all', label: 'All Orders' },
    { id: 'ordered', label: 'Ordered' },
    { id: 'in_transit', label: 'In Transit' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'draft', label: 'Draft' },
  ];

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {statusFilters.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setIsLoading(true);
              setSelectedStatus(tab.id);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${selectedStatus === tab.id
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        data={purchases as unknown as Record<string, unknown>[] | null}
        isLoading={isLoading}
        error={error}
        onRetry={handleManualRefresh}
        searchPlaceholder="Search by PO number or supplier name..."
        searchKey="po_number"
        emptyTitle="No purchase orders found"
        emptyDescription="No procurement order records have been found in the PostgreSQL database."
      />
    </div>
  );
};
