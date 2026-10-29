import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { recommendationService } from '../../services/recommendation-service';
import { DataTable, type Column } from '../../components/data-display/DataTable';
import { StatusBadge } from '../../components/data-display/StatusBadge';
import type { Recommendation, ApiError } from '../../types/api';

export const RecommendationsView: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | number | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const fetchRecommendations = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await recommendationService.getRecommendations(
        {
          priority: selectedPriority === 'all' ? undefined : selectedPriority,
          status: selectedStatus === 'all' ? undefined : selectedStatus,
        },
        signal
      );
      const items = Array.isArray(res) ? res : res?.items || [];
      setRecommendations(items);
      setError(null);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr?.kind !== 'aborted') {
        setError(apiErr);
        setRecommendations(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedPriority, selectedStatus]);

  const handleManualRefresh = useCallback(() => {
    setIsLoading(true);
    fetchRecommendations();
  }, [fetchRecommendations]);

  useEffect(() => {
    const controller = new AbortController();

    Promise.resolve().then(() => {
      fetchRecommendations(controller.signal);
    });

    const handleExternalRefresh = () => handleManualRefresh();
    window.addEventListener('ecco:refresh-data', handleExternalRefresh);
    return () => {
      controller.abort();
      window.removeEventListener('ecco:refresh-data', handleExternalRefresh);
    };
  }, [fetchRecommendations, handleManualRefresh]);

  const handleUpdateStatus = async (
    id: string | number,
    status: 'approved' | 'rejected' | 'applied'
  ) => {
    // Prevent repeated submissions while an update is already pending
    if (pendingActionId !== null) return;

    setPendingActionId(id);
    setActionFeedback(null);

    try {
      const updated = await recommendationService.updateStatus(id, status);
      // Confirm update succeeded before showing success message
      setActionFeedback({
        type: 'success',
        message: `Recommendation #${id} confirmed updated to "${updated?.status || status}".`,
      });
      // Refresh the dataset after confirmed backend mutation
      await fetchRecommendations();
    } catch (err) {
      const apiErr = err as ApiError;
      let errorMsg = apiErr.message;
      if (apiErr.kind === 'endpoint_unavailable' || apiErr.status === 404 || apiErr.status === 501) {
        errorMsg = `Mutation failed: Backend endpoint PUT /api/recommendations/${id}/status is not implemented or not found.`;
      }
      setActionFeedback({
        type: 'error',
        message: errorMsg,
      });
    } finally {
      setPendingActionId(null);
    }
  };

  const columns: Column<Recommendation>[] = [
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (item) => <StatusBadge status={item.priority} type="priority" />,
    },
    {
      key: 'title',
      header: 'Recommendation Action',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-semibold text-white block">{item.title}</span>
          <span className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
            {item.description}
          </span>
        </div>
      ),
    },
    {
      key: 'recommendation_type',
      header: 'Strategy Type',
      sortable: true,
      render: (item) => (
        <span className="capitalize text-slate-300 font-medium">
          {item.recommendation_type.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'target_name',
      header: 'Target Material / Vendor',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-medium text-amber-400 block">{item.target_name}</span>
          <span className="text-[10px] text-slate-500 uppercase">{item.target_type}</span>
        </div>
      ),
    },
    {
      key: 'expected_cost_impact',
      header: 'Projected Savings',
      sortable: true,
      align: 'right',
      render: (item) =>
        item.expected_cost_impact !== undefined && item.expected_cost_impact !== null ? (
          <span className="font-mono font-bold text-emerald-400">
            ${Number(item.expected_cost_impact).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        ) : (
          <span className="text-slate-500 italic text-[11px]">Unavailable</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} type="recommendation" />,
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (item) => {
        const isThisPending = pendingActionId === item.id;
        const isAnyPending = pendingActionId !== null;

        if (item.status === 'pending') {
          return (
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => handleUpdateStatus(item.id, 'approved')}
                disabled={isAnyPending}
                className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Approve recommendation (PUT /api/recommendations/{id}/status)"
              >
                {isThisPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleUpdateStatus(item.id, 'rejected')}
                disabled={isAnyPending}
                className="p-1.5 rounded-lg text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Reject recommendation (PUT /api/recommendations/{id}/status)"
              >
                {isThisPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        }
        return <span className="text-[11px] text-slate-500 italic">Completed</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Action feedback message */}
      {actionFeedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-slate-400 hover:text-white text-xs font-mono px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          {['all', 'critical', 'high', 'medium', 'low'].map((prio) => (
            <button
              key={prio}
              onClick={() => {
                setIsLoading(true);
                setSelectedPriority(prio);
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                selectedPriority === prio
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {prio === 'all' ? 'All Priorities' : prio}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          {['all', 'pending', 'approved', 'rejected', 'applied'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setIsLoading(true);
                setSelectedStatus(st);
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                selectedStatus === st
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'all' ? 'All Statuses' : st}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        data={recommendations as unknown as Record<string, unknown>[] | null}
        isLoading={isLoading}
        error={error}
        onRetry={handleManualRefresh}
        searchPlaceholder="Search recommendations by title or material..."
        searchKey="title"
        emptyTitle="No procurement recommendations found"
        emptyDescription="No optimization recommendations generated by forecasting models in the PostgreSQL database."
      />
    </div>
  );
};
