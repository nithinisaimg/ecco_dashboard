import React, { useState, useEffect, useCallback } from 'react';

import { supplierService } from '../../services/supplier-service';
import { DataTable, type Column } from '../../components/data-display/DataTable';
import { StatusBadge } from '../../components/data-display/StatusBadge';
import type { Supplier, ApiError } from '../../types/api';

export const SuppliersView: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[] | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchSuppliers = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await supplierService.getSuppliers(
        {
          tier: selectedTier === 'all' ? undefined : selectedTier,
          status: selectedStatus === 'all' ? undefined : selectedStatus,
        },
        signal
      );
      const items = Array.isArray(res) ? res : res?.items || [];
      setSuppliers(items);
      setError(null);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr?.kind !== 'aborted') {
        setError(apiErr);
        setSuppliers(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedTier, selectedStatus]);

  const handleManualRefresh = useCallback(() => {
    setIsLoading(true);
    fetchSuppliers();
  }, [fetchSuppliers]);

  useEffect(() => {
    const controller = new AbortController();

    Promise.resolve().then(() => {
      fetchSuppliers(controller.signal);
    });

    const handleExternalRefresh = () => handleManualRefresh();
    window.addEventListener('ecco:refresh-data', handleExternalRefresh);
    return () => {
      controller.abort();
      window.removeEventListener('ecco:refresh-data', handleExternalRefresh);
    };
  }, [fetchSuppliers, handleManualRefresh]);

  const columns: Column<Supplier>[] = [
    {
      key: 'code',
      header: 'Supplier Code',
      sortable: true,
      render: (item) => (
        <span className="font-mono font-medium text-amber-400">{item.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Tannery / Supplier Name',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-medium text-white block">{item.name}</span>
          {item.contact_email && (
            <span className="text-[11px] text-slate-500 font-mono">{item.contact_email}</span>
          )}
        </div>
      ),
    },
    {
      key: 'country',
      header: 'Location / Country',
      sortable: true,
      render: (item) => <span className="text-slate-300">{item.country}</span>,
    },
    {
      key: 'tier',
      header: 'Supply Tier',
      sortable: true,
      render: (item) => <StatusBadge status={item.tier} size="sm" />,
    },
    {
      key: 'rating',
      header: 'Rating',
      sortable: true,
      align: 'center',
      render: (item) =>
        item.rating !== undefined && item.rating !== null ? (
          <span className="font-mono font-bold text-amber-400">{item.rating} / 5.0</span>
        ) : (
          <span className="text-slate-500 italic text-[11px]">Unavailable</span>
        ),
    },
    {
      key: 'on_time_delivery_rate',
      header: 'On-Time Rate',
      sortable: true,
      align: 'right',
      render: (item) =>
        item.on_time_delivery_rate !== undefined && item.on_time_delivery_rate !== null ? (
          <span
            className={`font-mono font-medium ${item.on_time_delivery_rate >= 90
                ? 'text-emerald-400'
                : item.on_time_delivery_rate >= 80
                  ? 'text-amber-400'
                  : 'text-red-400'
              }`}
          >
            {item.on_time_delivery_rate}%
          </span>
        ) : (
          <span className="text-slate-500 italic text-[11px]">Unavailable</span>
        ),
    },
    {
      key: 'quality_score',
      header: 'Quality Score',
      sortable: true,
      align: 'right',
      render: (item) =>
        item.quality_score !== undefined && item.quality_score !== null ? (
          <span className="font-mono text-slate-200">{item.quality_score}%</span>
        ) : (
          <span className="text-slate-500 italic text-[11px]">Unavailable</span>
        ),
    },
    {
      key: 'esg_compliance_score',
      header: 'ESG Score',
      sortable: true,
      align: 'right',
      render: (item) =>
        item.esg_compliance_score !== undefined && item.esg_compliance_score !== null ? (
          <span className="font-mono text-emerald-400">{item.esg_compliance_score}/100</span>
        ) : (
          <span className="text-slate-500 italic text-[11px]">Unavailable</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} type="supplier" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tier and Status Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          {['all', 'Tier 1', 'Tier 2', 'Tier 3'].map((tier) => (
            <button
              key={tier}
              onClick={() => {
                setIsLoading(true);
                setSelectedTier(tier);
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${selectedTier === tier
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              {tier === 'all' ? 'All Tiers' : tier}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          {['all', 'preferred', 'approved', 'under_review', 'inactive'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setIsLoading(true);
                setSelectedStatus(st);
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${selectedStatus === st
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              {st === 'all' ? 'All Statuses' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        data={suppliers as unknown as Record<string, unknown>[] | null}
        isLoading={isLoading}
        error={error}
        onRetry={handleManualRefresh}
        searchPlaceholder="Search suppliers by name or code..."
        searchKey="name"
        emptyTitle="No supplier records found"
        emptyDescription="No tannery or vendor records exist in the PostgreSQL database."
      />
    </div>
  );
};
