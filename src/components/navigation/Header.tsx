import React from 'react';
import { RefreshCw, ExternalLink, ShieldCheck, Database } from 'lucide-react';
import { API_BASE_URL } from '../../services/api-client';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <header className="h-16 px-6 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4">
      {/* Title & Subtitle Context Area */}
      <div className="min-w-0 flex-1">
        <h1 className="text-base font-bold text-white tracking-wide font-sans m-0 truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-400 font-normal mt-0.5 truncate max-w-xl">
            {subtitle}
          </p>
        )}
      </div>

      {/* Header Actions & Telemetry Strip */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Backend Target Indicator */}
        <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 h-8 rounded-lg bg-slate-900 border border-slate-800 text-xs shrink-0 whitespace-nowrap">
          <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-400 font-mono text-[11px] truncate max-w-[180px]">
            {API_BASE_URL}
          </span>
        </div>

        {/* Swagger Docs Link */}
        <a
          href={`${API_BASE_URL}/docs`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 h-8 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors shrink-0 whitespace-nowrap"
          title="Open FastAPI Swagger Documentation"
        >
          <span className="font-mono text-[11px]">API Docs</span>
          <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
        </a>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 h-8 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors disabled:opacity-50 shrink-0 whitespace-nowrap"
            title="Refresh data from FastAPI"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}

        {/* Security / Role Badge */}
        <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 h-8 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 shrink-0 whitespace-nowrap">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>PostgreSQL Client</span>
        </div>
      </div>
    </header>
  );
};
