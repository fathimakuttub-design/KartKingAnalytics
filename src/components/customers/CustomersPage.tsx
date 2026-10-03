import React, { useState } from 'react';
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
} from 'recharts';
import { Search, UserCheck, ShieldAlert, Award, UserX } from 'lucide-react';
import {
  CustomerRfm,
  RfmSegmentDistribution,
  CityRevenue,
  CustomerTrendPoint,
  RfmSegmentName,
} from '../../types';
import { ChartCard } from '../common/ChartCard';
import { formatINR, formatPercent } from '../../utils/formatters';

interface CustomersPageProps {
  rfmCustomers: CustomerRfm[];
  rfmDistribution: RfmSegmentDistribution[];
  cities: CityRevenue[];
  retentionTrend: CustomerTrendPoint[];
  isFilteredEmpty: boolean;
}

const SEGMENT_COLORS: Record<RfmSegmentName, string> = {
  Champions: '#10b981', // Emerald
  Loyal: '#3b82f6', // Blue
  'At Risk': '#f59e0b', // Amber
  Lost: '#ef4444', // Red
};

export const CustomersPage: React.FC<CustomersPageProps> = ({
  rfmCustomers,
  rfmDistribution,
  cities,
  retentionTrend,
  isFilteredEmpty,
}) => {
  const [selectedSegment, setSelectedSegment] = useState<RfmSegmentName | 'All'>('All');
  const [customerSearch, setCustomerSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filteredCustomers = rfmCustomers.filter((c) => {
    if (selectedSegment !== 'All' && c.segment !== selectedSegment) return false;
    if (customerSearch.trim()) {
      const q = customerSearch.toLowerCase();
      return (
        c.customerName.toLowerCase().includes(q) ||
        c.customerId.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const paginatedCustomers = filteredCustomers.slice((page - 1) * pageSize, page * pageSize);

  const totalRevenue = rfmCustomers.reduce((sum, c) => sum + c.totalSpend, 0);

  return (
    <div className="space-y-6">
      {/* 1. RFM Summary Metric Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rfmDistribution.map((item) => {
          const isSelected = selectedSegment === item.segment;
          return (
            <div
              key={item.segment}
              onClick={() => {
                setSelectedSegment(isSelected ? 'All' : item.segment);
                setPage(1);
              }}
              className={`cursor-pointer rounded-xl border p-4 shadow-xs transition-all ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 dark:border-amber-400 dark:bg-amber-950/20'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {item.segment}
                </span>
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {item.count}
                </span>
                <span className="text-xs font-medium text-slate-500 tabular-nums">
                  {formatPercent((item.count / (rfmCustomers.length || 1)) * 100, 0)} share
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                Spend: <span className="font-semibold text-slate-900 dark:text-white">{formatINR(item.revenue)}</span>
                <span className="text-slate-400"> · Avg {formatINR(item.avgSpend)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Charts: New vs Returning Customers & RFM Segment Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Retention Trend */}
        <ChartCard
          title="New vs Returning Customer Trajectory"
          subtitle="Monthly breakdown of first-time vs repeat purchasing patrons"
          isEmpty={isFilteredEmpty || retentionTrend.length === 0}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={retentionTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
              <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const newC = Number(payload.find((p) => p.dataKey === 'newCustomers')?.value || 0);
                  const retC = Number(payload.find((p) => p.dataKey === 'returningCustomers')?.value || 0);
                  const total = newC + retC;
                  const repeatRate = total > 0 ? (retC / total) * 100 : 0;
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-800 dark:bg-slate-900 text-xs">
                      <p className="font-semibold text-slate-900 dark:text-white">{label}</p>
                      <p className="text-emerald-600 mt-1">New: {newC} buyers</p>
                      <p className="text-blue-600">Returning: {retC} buyers</p>
                      <p className="text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800 mt-1">
                        Repeat Share: {repeatRate.toFixed(1)}%
                      </p>
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="newCustomers" name="New Customers" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="returningCustomers" name="Returning Customers" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* RFM Segment Breakdown */}
        <ChartCard
          title="RFM Segmentation Distribution"
          subtitle="Customer classification based on Recency, Frequency, and Monetary value"
          isEmpty={isFilteredEmpty || rfmDistribution.length === 0}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between h-[280px]">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={rfmDistribution}
                  dataKey="count"
                  nameKey="segment"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {rfmDistribution.map((entry) => (
                    <Cell key={entry.segment} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val} customers (${formatINR(item.payload.revenue)})`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex sm:flex-col gap-2.5 sm:w-52 text-xs shrink-0 px-2">
              {rfmDistribution.map((seg) => (
                <div key={seg.segment} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{seg.segment}</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                    {seg.count} ({formatPercent((seg.count / (rfmCustomers.length || 1)) * 100, 0)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* 3. Mid Grid: Top 10 Cities & Customer RFM Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top 10 Cities by Revenue */}
        <ChartCard
          title="Top 10 Cities by Revenue"
          subtitle="Metros & emerging hubs driving marketplace turnover"
          className="lg:col-span-1"
          isEmpty={isFilteredEmpty || cities.length === 0}
        >
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={cities}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#94a3b8" strokeOpacity={0.2} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(v) => formatINR(v, { compact: true })}
              />
              <YAxis
                dataKey="city"
                type="category"
                tickLine={false}
                axisLine={false}
                width={80}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload as CityRevenue;
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-800 dark:bg-slate-900 text-xs">
                      <p className="font-semibold text-slate-900 dark:text-white">{item.city}, {item.state}</p>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">
                        Revenue: <span className="font-bold text-amber-600">{formatINR(item.revenue, { compact: false })}</span>
                      </p>
                      <p className="text-slate-500">
                        Orders: {item.orders} · Zone: {item.region}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Customer RFM Table */}
        <ChartCard
          title="Customer RFM Ledger"
          subtitle="Individual spend, order frequency, recency, and assigned segment"
          className="lg:col-span-2"
          isEmpty={isFilteredEmpty || filteredCustomers.length === 0}
          headerRight={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by customer..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-50 py-1 pl-8 pr-2.5 text-xs text-slate-800 outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 w-40 sm:w-48"
                />
              </div>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="pb-2.5 font-semibold">Customer</th>
                  <th className="pb-2.5 font-semibold">Location</th>
                  <th className="pb-2.5 font-semibold">Segment</th>
                  <th className="pb-2.5 font-semibold text-right">Orders</th>
                  <th className="pb-2.5 font-semibold text-right">Recency</th>
                  <th className="pb-2.5 font-semibold text-right">Total Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedCustomers.map((c) => {
                  const segmentColor = SEGMENT_COLORS[c.segment];
                  return (
                    <tr
                      key={c.customerId}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {c.customerName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{c.customerId}</div>
                      </td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">
                        {c.city}, {c.state}
                      </td>
                      <td className="py-2.5">
                        <span
                          className="inline-flex items-center gap-1.5 font-medium"
                          style={{ color: segmentColor }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: segmentColor }}
                          />
                          {c.segment}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {c.totalOrders}
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-slate-500">
                        {c.recencyDays}d ago
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                        {formatINR(c.totalSpend, { compact: false })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
            <span>
              Showing {filteredCustomers.length === 0 ? 0 : (page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, filteredCustomers.length)} of {filteredCustomers.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded px-2.5 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Prev
              </button>
              <span className="px-2 font-mono">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded px-2.5 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};
