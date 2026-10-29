import React from 'react';
import { Database, AlertCircle, FileSearch, RefreshCw, ServerOff, HelpCircle } from 'lucide-react';

export type EmptyStateVariant =
  | 'empty'
  | 'offline'
  | 'endpoint_missing'
  | 'db_disconnected'
  | 'invalid_response'
  | 'unconfigured';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: 'database' | 'search' | 'alert' | 'offline' | 'help';
  actionLabel?: string;
  onAction?: () => void;
  variant?: EmptyStateVariant;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There are currently no records available in the database for this view.',
  icon = 'database',
  actionLabel,
  onAction,
  variant = 'empty',
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'alert':
        return <AlertCircle className="w-12 h-12 text-amber-500/80 mb-3" />;
      case 'offline':
        return <ServerOff className="w-12 h-12 text-red-500/80 mb-3" />;
      case 'search':
        return <FileSearch className="w-12 h-12 text-slate-500 mb-3" />;
      case 'help':
        return <HelpCircle className="w-12 h-12 text-sky-500/80 mb-3" />;
      default:
        return <Database className="w-12 h-12 text-slate-600 mb-3" />;
    }
  };

  const getBadge = () => {
    switch (variant) {
      case 'offline':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-950 text-red-400 border border-red-800/60 mb-2">
            FastAPI Backend Offline
          </span>
        );
      case 'endpoint_missing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950 text-amber-400 border border-amber-800/60 mb-2">
            Endpoint Not Connected
          </span>
        );
      case 'db_disconnected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-950 text-rose-400 border border-rose-800/60 mb-2">
            PostgreSQL Disconnected
          </span>
        );
      case 'invalid_response':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-950 text-purple-400 border border-purple-800/60 mb-2">
            Invalid Response Contract
          </span>
        );
      case 'unconfigured':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950 text-amber-400 border border-amber-800/60 mb-2">
            Data Source Not Configured
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700 mb-2">
            Empty Dataset
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800/80 my-4 backdrop-blur-sm">
      {getBadge()}
      {getIcon()}
      <h3 className="text-base font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-5 leading-relaxed">{description}</p>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
