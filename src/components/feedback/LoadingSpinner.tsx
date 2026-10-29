import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading data from backend...',
  size = 'md',
  fullHeight = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-slate-400 ${
        fullHeight ? 'min-h-[50vh]' : ''
      }`}
    >
      <Loader2 className={`${sizeClasses[size]} animate-spin text-amber-500 mb-3`} />
      <p className="text-sm font-medium tracking-wide">{message}</p>
    </div>
  );
};
