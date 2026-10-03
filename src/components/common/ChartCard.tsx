import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
  footerNote?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  headerRight,
  children,
  isEmpty = false,
  emptyMessage = 'No data matching selected filters',
  loading = false,
  className = '',
  footerNote,
}) => {
  return (
    <div
      className={`flex flex-col rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
        {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
      </div>

      <div className="relative flex-1 min-h-[280px] w-full">
        {loading ? (
          <div className="flex h-full min-h-[280px] w-full animate-pulse flex-col items-center justify-center space-y-3">
            <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-40 w-full rounded bg-slate-100 dark:bg-slate-800/60" />
          </div>
        ) : isEmpty ? (
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center p-6 text-slate-400">
            <AlertCircle className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{emptyMessage}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try widening your date range or clearing filters.</p>
          </div>
        ) : (
          children
        )}
      </div>

      {footerNote && (
        <div className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-400 dark:border-slate-800/80 dark:text-slate-500">
          {footerNote}
        </div>
      )}
    </div>
  );
};
