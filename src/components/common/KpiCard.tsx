import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, HelpCircle } from 'lucide-react';
import { KpiMetric } from '../../types';

interface KpiCardProps {
  title: string;
  metric: KpiMetric;
  icon: React.ReactNode;
  subtitle?: string;
  tooltip?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  metric,
  icon,
  subtitle = 'vs prev equivalent period',
  tooltip,
}) => {
  const isZero = Math.abs(metric.percentChange) < 0.05;
  const isPositive = metric.percentChange > 0;

  // For metrics like return rate, lower is better
  const isFavorable = metric.isPositiveGood === false ? !isPositive : isPositive;

  const badgeColorClass = isZero
    ? 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400'
    : isFavorable
    ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400'
    : 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400';

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{title}</span>
            {tooltip && (
              <span title={tooltip} className="cursor-help text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <HelpCircle className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {metric.formattedValue}
          </div>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs">
        <div className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-medium tabular-nums ${badgeColorClass}`}>
          {isZero ? (
            <Minus className="h-3 w-3" />
          ) : isPositive ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          <span>{Math.abs(metric.percentChange).toFixed(1)}%</span>
        </div>
        <span className="text-slate-500 dark:text-slate-400 truncate">{subtitle}</span>
      </div>
    </div>
  );
};
