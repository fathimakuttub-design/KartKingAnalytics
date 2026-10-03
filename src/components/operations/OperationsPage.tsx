import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
} from 'recharts';
import {
  CheckCircle2,
  RotateCcw,
  XCircle,
  Truck,
  CreditCard,
  Star,
  Clock,
} from 'lucide-react';
import {
  OrderStatusBreakdown,
  ReturnRateByCategory,
  RegionalDeliveryStats,
  DeliveryVsRatingPoint,
  PaymentShare,
} from '../../types';
import { ChartCard } from '../common/ChartCard';
import { formatINR, formatPercent } from '../../utils/formatters';

interface OperationsPageProps {
  orderStatus: OrderStatusBreakdown[];
  returnByCategory: ReturnRateByCategory[];
  regionalDelivery: RegionalDeliveryStats[];
  deliveryVsRating: DeliveryVsRatingPoint[];
  paymentShare: PaymentShare[];
  isFilteredEmpty: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  Delivered: '#10b981', // Emerald
  Returned: '#f59e0b', // Amber
  Cancelled: '#ef4444', // Red
};

const PAYMENT_COLORS = ['#6366f1', '#3b82f6', '#06b6d4', '#f59e0b', '#8b5cf6'];

export const OperationsPage: React.FC<OperationsPageProps> = ({
  orderStatus,
  returnByCategory,
  regionalDelivery,
  deliveryVsRating,
  paymentShare,
  isFilteredEmpty,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Fulfillment Status Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {orderStatus.map((stat) => {
          const isDelivered = stat.status === 'Delivered';
          const isReturned = stat.status === 'Returned';
          const Icon = isDelivered ? CheckCircle2 : isReturned ? RotateCcw : XCircle;
          const colorClass = isDelivered
            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400'
            : isReturned
            ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400'
            : 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400';

          return (
            <div
              key={stat.status}
              className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {stat.status} Orders
                </span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {stat.count.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-semibold tabular-nums text-slate-500">
                  {formatPercent(stat.percentage, 1)}
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Revenue Impact:{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatINR(stat.revenue)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Mid Grid: Return Rate by Category & Payment Method Share */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Return Rate by Category */}
        <ChartCard
          title="Return Rate by Category"
          subtitle="Return propensity comparison (elevated reverse logistics in apparel)"
          isEmpty={isFilteredEmpty || returnByCategory.length === 0}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={returnByCategory}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#94a3b8" strokeOpacity={0.2} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                dataKey="category"
                type="category"
                tickLine={false}
                axisLine={false}
                width={100}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload as ReturnRateByCategory;
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-800 dark:bg-slate-900 text-xs">
                      <p className="font-semibold text-slate-900 dark:text-white">{item.category}</p>
                      <p className="mt-1 font-bold text-rose-600">
                        Return Rate: {formatPercent(item.returnRate, 1)}
                      </p>
                      <p className="text-slate-500">
                        {item.returnedOrders} returns of {item.totalOrders} total orders
                      </p>
                      <p className="text-slate-400 mt-1">
                        Avg Delivery Time: {item.avgDeliveryDays.toFixed(1)} days
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="returnRate" radius={[0, 4, 4, 0]}>
                {returnByCategory.map((entry, index) => (
                  <Cell
                    key={`ret-${index}`}
                    fill={entry.returnRate > 15 ? '#ef4444' : entry.returnRate > 8 ? '#f59e0b' : '#10b981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Payment Method Share */}
        <ChartCard
          title="Payment Mode Distribution"
          subtitle="Prepaid UPI & Cards vs Cash on Delivery (COD) friction"
          isEmpty={isFilteredEmpty || paymentShare.length === 0}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between h-[280px]">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={paymentShare}
                  dataKey="orders"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {paymentShare.map((entry, index) => (
                    <Cell key={entry.method} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val} orders (${formatPercent(item.payload.share, 1)})`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex sm:flex-col gap-2 sm:w-52 text-xs shrink-0 px-2">
              {paymentShare.map((p, idx) => (
                <div key={p.method} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: PAYMENT_COLORS[idx % PAYMENT_COLORS.length] }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{p.method}</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                    {formatPercent(p.share, 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* 3. Lower Grid: Delivery Days by Region & Delivery Days vs Customer Rating */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Regional Delivery SLA */}
        <ChartCard
          title="Average Delivery SLA by Zone"
          subtitle="Fulfillment lead times across North, South, West, and East clusters"
          isEmpty={isFilteredEmpty || regionalDelivery.length === 0}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={regionalDelivery}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
              <XAxis dataKey="region" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(v) => `${v}d`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload as RegionalDeliveryStats;
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-800 dark:bg-slate-900 text-xs">
                      <p className="font-semibold text-slate-900 dark:text-white">{label} Region</p>
                      <p className="mt-1 font-bold text-amber-600">
                        Avg Delivery: {item.avgDeliveryDays.toFixed(1)} days
                      </p>
                      <p className="text-slate-600 dark:text-slate-300">
                        On-Time (≤4 days): {formatPercent(item.onTimePercent, 1)}
                      </p>
                      <p className="text-slate-400">Total Shipments: {item.totalDelivered}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="avgDeliveryDays" name="Avg Delivery Days" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Delivery Days vs Customer Rating Impact */}
        <ChartCard
          title="Delivery Speed vs Customer Rating"
          subtitle="Direct relationship showing CSAT degradation as transit delay increases"
          isEmpty={isFilteredEmpty || deliveryVsRating.length === 0}
        >
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={deliveryVsRating} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
              <XAxis
                dataKey="deliveryDays"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(d) => `${d}d`}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(r) => `${r}★`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload as DeliveryVsRatingPoint;
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-800 dark:bg-slate-900 text-xs">
                      <p className="font-semibold text-slate-900 dark:text-white">Delivery Time: {label} Days</p>
                      <p className="mt-1 font-bold text-amber-500">
                        Average Rating: {item.avgRating.toFixed(2)} ★
                      </p>
                      <p className="text-slate-500">Orders Sample: {item.orderCount} parcels</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="orderCount" yAxisId={0} fill="#e2e8f0" radius={[4, 4, 0, 0]} opacity={0.4} />
              <Line
                type="monotone"
                dataKey="avgRating"
                stroke="#ec4899"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};
