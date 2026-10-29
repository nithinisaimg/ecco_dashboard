import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number | null | undefined;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
    isPositiveGood?: boolean;
  };
  badge?: string;
  isLoading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  badge,
  isLoading = false,
}) => {
  const isAvailable = value !== null && value !== undefined;

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 shadow-lg backdrop-blur-sm hover:border-slate-700/80 transition-all duration-200">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-slate-800/80 text-amber-400 border border-slate-700/60">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        {isLoading ? (
          <div className="h-8 w-24 bg-slate-800 animate-pulse rounded my-1" />
        ) : isAvailable ? (
          <span className="text-2xl font-bold tracking-tight text-white font-sans">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
        ) : (
          <span className="text-sm font-medium text-slate-500 italic">Not available</span>
        )}

        {badge && (
          <span className="ml-auto text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
        {subtitle && <span>{subtitle}</span>}

        {trend && isAvailable && (
          <div
            className={`flex items-center gap-1 font-medium ${
              trend.value > 0
                ? trend.isPositiveGood !== false
                  ? 'text-emerald-400'
                  : 'text-red-400'
                : trend.value < 0
                ? trend.isPositiveGood !== false
                  ? 'text-red-400'
                  : 'text-emerald-400'
                : 'text-slate-400'
            }`}
          >
            {trend.value > 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : trend.value < 0 ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>
              {trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`} {trend.label || ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
