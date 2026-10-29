import React from 'react';

type BadgeType =
  | 'risk'
  | 'po'
  | 'supplier'
  | 'priority'
  | 'recommendation';

interface StatusBadgeProps {
  status: string;
  type?: BadgeType;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'sm',
}) => {
  const norm = (status || '').toLowerCase().replace(/_/g, ' ');

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  // Critical / High / Danger
  if (['critical', 'cancelled', 'inactive', 'rejected', 'high'].includes(norm)) {
    colorClasses = 'bg-red-950/80 text-red-400 border-red-800/80';
  }
  // Warning / Medium / In Transit / Under Review / Pending
  else if (['medium', 'in transit', 'under review', 'pending', 'pending approval'].includes(norm)) {
    colorClasses = 'bg-amber-950/80 text-amber-400 border-amber-800/80';
  }
  // Success / Preferred / Delivered / Approved / Low / Healthy
  else if (['preferred', 'approved', 'delivered', 'low', 'applied', 'healthy'].includes(norm)) {
    colorClasses = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
  }
  // Info / Ordered / Draft / Tier
  else if (['ordered', 'draft', 'tier 1', 'tier 2', 'tier 3'].includes(norm)) {
    colorClasses = 'bg-sky-950/80 text-sky-400 border-sky-800/80';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border capitalize whitespace-nowrap ${sizeClasses} ${colorClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {norm}
    </span>
  );
};
