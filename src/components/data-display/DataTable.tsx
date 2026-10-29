import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Database } from 'lucide-react';
import { LoadingSpinner } from '../feedback/LoadingSpinner';
import { EmptyState, type EmptyStateVariant } from '../feedback/EmptyState';
import { ErrorBanner } from '../feedback/ErrorBanner';
import type { ApiError } from '../../types/api';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[] | null;
  isLoading?: boolean;
  error?: ApiError | string | null;
  onRetry?: () => void;
  searchPlaceholder?: string;
  searchKey?: keyof T | ((item: T) => string);
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
  headerAction?: React.ReactNode;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading = false,
  error = null,
  onRetry,
  searchPlaceholder = 'Search records...',
  searchKey,
  emptyTitle = 'No records found',
  emptyDescription = 'There are currently no records available in the database.',
  pageSize = 10,
  headerAction,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchTerm.trim()) return data;

    const term = searchTerm.toLowerCase();
    return data.filter((item) => {
      if (typeof searchKey === 'function') {
        return searchKey(item).toLowerCase().includes(term);
      }
      if (searchKey && item[searchKey] !== undefined) {
        return String(item[searchKey]).toLowerCase().includes(term);
      }
      // Default: search all string / number fields
      return Object.values(item).some(
        (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm, searchKey]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      // Number comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Date string comparison if both look like valid dates
      const aTime = typeof aVal === 'string' ? Date.parse(aVal) : NaN;
      const bTime = typeof bVal === 'string' ? Date.parse(bVal) : NaN;
      if (!isNaN(aTime) && !isNaN(bTime)) {
        return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
      }

      // Fallback string locale comparison
      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortKey, sortDirection]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string, sortable?: boolean) => {
    if (sortable === false) return;
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Determine error state variant if error occurred
  const getErrorVariant = (): EmptyStateVariant => {
    if (typeof error === 'object' && error !== null) {
      const apiErr = error as ApiError;
      if (apiErr.kind === 'endpoint_unavailable' || apiErr.status === 404 || apiErr.status === 501) {
        return 'endpoint_missing';
      }
      if (apiErr.kind === 'invalid_response') {
        return 'invalid_response';
      }
      if (apiErr.kind === 'database_disconnected') {
        return 'db_disconnected';
      }
    }
    return 'offline';
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>

      {/* Error state banner */}
      {error && <ErrorBanner error={error} onRetry={onRetry} />}

      {/* Table Box */}
      <div className="overflow-hidden rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-md backdrop-blur-sm">
        {isLoading ? (
          <LoadingSpinner fullHeight message="Loading database records..." />
        ) : error ? (
          <EmptyState
            title="Failed to load records"
            description={typeof error === 'object' && error !== null ? (error as ApiError).message : String(error)}
            icon="offline"
            actionLabel={onRetry ? 'Retry Request' : undefined}
            onAction={onRetry}
            variant={getErrorVariant()}
          />
        ) : !data || data.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            icon="database"
            actionLabel={onRetry ? 'Refresh' : undefined}
            onAction={onRetry}
            variant="empty"
          />
        ) : filteredData.length === 0 ? (
          <EmptyState
            title="No matching records"
            description={`No results found for "${searchTerm}". Try adjusting your search query.`}
            icon="search"
            actionLabel="Clear Search"
            onAction={() => setSearchTerm('')}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium tracking-wider uppercase text-[11px]">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key, col.sortable)}
                        className={`p-3.5 ${
                          col.sortable !== false
                            ? 'cursor-pointer select-none hover:text-slate-200 hover:bg-slate-900/60'
                            : ''
                        } ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        }`}
                        style={{ width: col.width }}
                      >
                        <div
                          className={`inline-flex items-center gap-1.5 ${
                            col.align === 'right' ? 'justify-end' : ''
                          }`}
                        >
                          <span>{col.header}</span>
                          {col.sortable !== false && (
                            <span className="text-slate-600">
                              {sortKey === col.key ? (
                                sortDirection === 'asc' ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                                )
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 opacity-30" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {paginatedData.map((item, idx) => {
                    const rowKey = String(
                      item.id ?? item.code ?? item.po_number ?? item.sku_code ?? idx
                    );
                    return (
                      <tr
                        key={rowKey}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        {columns.map((col) => (
                          <td
                            key={col.key}
                            className={`p-3.5 font-normal ${
                              col.align === 'right'
                                ? 'text-right'
                                : col.align === 'center'
                                ? 'text-center'
                                : 'text-left'
                            }`}
                          >
                            {col.render ? col.render(item) : String(item[col.key] ?? '—')}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Showing{' '}
                  <strong className="text-slate-200">
                    {Math.min(filteredData.length, (currentPage - 1) * pageSize + 1)}
                  </strong>{' '}
                  to{' '}
                  <strong className="text-slate-200">
                    {Math.min(filteredData.length, currentPage * pageSize)}
                  </strong>{' '}
                  of <strong className="text-slate-200">{filteredData.length}</strong> records
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-slate-400">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
