import React, { useState } from 'react';
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Users,
  RotateCcw,
  Star,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  OverviewKpis,
  RevenueTimeSeriesPoint,
  CategoryBreakdown,
  RegionBreakdown,
  TopProduct,
} from '../../types';
import { KpiCard } from '../common/KpiCard';
import { ChartCard } from '../common/ChartCard';
import { formatINR, formatPercent } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface OverviewPageProps {
  kpis: OverviewKpis;
  timeSeries: RevenueTimeSeriesPoint[];
  categories: CategoryBreakdown[];
  regions: RegionBreakdown[];
  topProducts: TopProduct[];
  timeGrouping: 'daily' | 'weekly' | 'monthly';
  onTimeGroupingChange: (group: 'daily' | 'weekly' | 'monthly') => void;
  isFilteredEmpty: boolean;
}

const REGION_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
const CATEGORY_COLORS = [
  '#f59e0b', // Electronics (Amber)
  '#ec4899', // Fashion (Pink)
  '#3b82f6', // Home & Kitchen (Blue)
  '#8b5cf6', // Beauty (Purple)
  '#10b981', // Books (Emerald)
  '#06b6d4', // Grocery (Cyan)
];

export const OverviewPage: React.FC<OverviewPageProps> = ({
  kpis,
  timeSeries,
  categories,
  regions,
  topProducts,
  timeGrouping,
  onTimeGroupingChange,
  isFilteredEmpty,
}) => {
  const [productSortKey, setProductSortKey] = useState<keyof TopProduct>('revenue');
  const [productSortAsc, setProductSortAsc] = useState<boolean>(false);
  const { user } = useAuth();

  const firstName = user?.displayName
    ? user.displayName.trim().split(' ')[0]
    : 'Analyst';
  const companyName = user?.companyName || 'KartKing';

  const handleSort = (key: keyof TopProduct) => {
    if (productSortKey === key) {
      setProductSortAsc(!productSortAsc);
    } else {
      setProductSortKey(key);
      setProductSortAsc(false); // default descending for metrics
    }
  };

  const sortedProducts = [...topProducts].sort((a, b) => {
    const valA = a[productSortKey];
    const valB = b[productSortKey];
    if (typeof valA === 'string' && typeof valB === 'string') {
      return productSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    const numA = Number(valA);
    const numB = Number(valB);
    return productSortAsc ? numA - numB : numB - numA;
  });

  return (
    <div className="space-y-6">
      {/* Welcome greeting */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3 dark:border-slate-800/80">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {firstName}
            <span className="ml-2 font-normal text-slate-500 dark:text-slate-400 text-xs">
              · {companyName} Analytics Hub
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Live commercial performance, revenue trajectory, and operations overview.
          </p>
        </div>
      </div>

      {/* 1. KPI Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Total Revenue"
          metric={kpis.totalRevenue}
          icon={<IndianRupee className="h-5 w-5" />}
          tooltip="Gross revenue from delivered and returned orders (excluding cancellations)"
        />
        <KpiCard
          title="Total Orders"
          metric={kpis.totalOrders}
          icon={<ShoppingBag className="h-5 w-5" />}
          tooltip="Total orders placed in the selected filter period"
        />
        <KpiCard
          title="Avg Order Value"
          metric={kpis.averageOrderValue}
          icon={<TrendingUp className="h-5 w-5" />}
          tooltip="Average net revenue per placed order (AOV = Total Revenue / Orders)"
        />
        <KpiCard
          title="Unique Customers"
          metric={kpis.uniqueCustomers}
          icon={<Users className="h-5 w-5" />}
          tooltip="Distinct individual customer accounts making purchases"
        />
        <KpiCard
          title="Return Rate"
          metric={kpis.returnRate}
          icon={<RotateCcw className="h-5 w-5" />}
          tooltip="Returned orders divided by total non-cancelled orders"
        />
        <KpiCard
          title="Avg Rating"
          metric={kpis.averageRating}
          icon={<Star className="h-5 w-5" />}
          tooltip="Overall customer feedback score out of 5 stars"
        />
      </div>

      {/* 2. Main Revenue Trend Chart */}
      <ChartCard
        title="Revenue & Demand Trajectory"
        subtitle="Historical sales performance with festive peaks (Diwali, Republic Day)"
        isEmpty={isFilteredEmpty || timeSeries.length === 0}
        headerRight={
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
            {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onTimeGroupingChange(mode)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  timeGrouping === mode
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={timeSeries} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickFormatter={(v) => formatINR(v, { compact: true, decimals: 0 })}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload as RevenueTimeSeriesPoint;
                return (
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900 text-xs">
                    <p className="font-semibold text-slate-900 dark:text-white mb-1.5">{label}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-4 text-slate-600 dark:text-slate-300">
                        <span>Total Revenue:</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                          {formatINR(data.revenue, { compact: false })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-slate-600 dark:text-slate-300">
                        <span>Delivered Revenue:</span>
                        <span className="font-semibold tabular-nums">
                          {formatINR(data.deliveredRevenue, { compact: false })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-slate-600 dark:text-slate-300">
                        <span>Orders Count:</span>
                        <span className="font-semibold tabular-nums">{data.orders} orders</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={timeGrouping === 'monthly'}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 3. Mid Grid: Revenue by Category & Revenue by Region */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category Bar Chart */}
        <ChartCard
          title="Revenue by Category"
          subtitle="Sales contribution and volume across merchandise categories"
          isEmpty={isFilteredEmpty || categories.length === 0}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={categories}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#94a3b8" strokeOpacity={0.2} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(v) => formatINR(v, { compact: true })}
              />
              <YAxis
                dataKey="category"
                type="category"
                tickLine={false}
                axisLine={false}
                width={100}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload as CategoryBreakdown;
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-800 dark:bg-slate-900 text-xs">
                      <p className="font-semibold text-slate-900 dark:text-white">{item.category}</p>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">
                        Revenue: <span className="font-bold text-amber-600">{formatINR(item.revenue, { compact: false })}</span>
                      </p>
                      <p className="text-slate-500">
                        Share: {formatPercent(item.share)} · {item.orders} orders
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                {categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Region Donut Chart */}
        <ChartCard
          title="Revenue by Geographic Region"
          subtitle="Regional share across South, West, North, and East zones"
          isEmpty={isFilteredEmpty || regions.length === 0}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between h-[280px]">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={regions}
                  dataKey="revenue"
                  nameKey="region"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {regions.map((entry, index) => (
                    <Cell key={`reg-${index}`} fill={REGION_COLORS[index % REGION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val), { compact: false }), 'Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex sm:flex-col gap-2.5 sm:w-48 text-xs shrink-0 px-2">
              {regions.map((reg, idx) => (
                <div key={reg.region} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: REGION_COLORS[idx % REGION_COLORS.length] }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{reg.region}</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                    {formatPercent(reg.share, 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* 4. Top 10 Products Sortable Table */}
      <ChartCard
        title="Top 10 Products by Commercial Performance"
        subtitle="Catalog ranking with units sold, revenue, average discount, and return volume"
        isEmpty={isFilteredEmpty || topProducts.length === 0}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="pb-3 font-semibold">#</th>
                <th
                  className="pb-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSort('product_name')}
                >
                  <div className="flex items-center gap-1">
                    <span>Product Name</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="pb-3 font-semibold">Category</th>
                <th
                  className="pb-3 font-semibold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSort('units_sold')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Units Sold</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="pb-3 font-semibold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSort('avg_discount')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Avg Disc %</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="pb-3 font-semibold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSort('return_rate')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Return %</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="pb-3 font-semibold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSort('revenue')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Revenue</span>
                    {productSortKey === 'revenue' && (productSortAsc ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {sortedProducts.map((p, idx) => (
                <tr
                  key={p.product_name}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 font-medium text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 font-semibold text-slate-900 dark:text-slate-100 max-w-[240px] truncate">
                    {p.product_name}
                  </td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-400">
                    {p.category}
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {p.units_sold.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                    {p.avg_discount.toFixed(1)}%
                  </td>
                  <td className="py-2.5 text-right">
                    <span
                      className={`font-mono tabular-nums font-medium ${
                        p.return_rate > 15
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {formatPercent(p.return_rate, 1)}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold tabular-nums text-amber-600 dark:text-amber-400">
                    {formatINR(p.revenue, { compact: false })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
};
