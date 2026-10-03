import React, { useState } from 'react';
import {
  Search,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { downloadFilteredCsv } from '../../utils/csvHandler';
import { formatINR, formatDate } from '../../utils/formatters';

interface DataExplorerPageProps {
  orders: Order[];
}

export const DataExplorerPage: React.FC<DataExplorerPageProps> = ({ orders }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [sortField, setSortField] = useState<keyof Order>('order_date');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'All' && o.order_status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.order_id.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.product_name.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    const numA = Number(valA);
    const numB = Number(valB);
    return sortAsc ? numA - numB : numB - numA;
  });

  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / pageSize));
  const paginatedOrders = sortedOrders.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls: Search, Quick Status Filter, CSV Download */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search order ID, customer, product, city..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-64 sm:w-80 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 outline-none focus:border-amber-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800 text-xs">
            {(['All', 'Delivered', 'Returned', 'Cancelled'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => downloadFilteredCsv(sortedOrders)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Download filtered data as CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                <th
                  className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSort('order_date')}
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSort('order_id')}
                >
                  <div className="flex items-center gap-1">
                    <span>Order ID</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSort('customer_name')}
                >
                  <div className="flex items-center gap-1">
                    <span>Customer</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3 font-semibold">City, State</th>
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-3 font-semibold">Product</th>
                <th
                  className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSort('quantity')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Qty</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSort('total_revenue')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Net</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3 font-semibold">Payment</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    No orders match your current query or filters.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o) => {
                  const statusColor =
                    o.order_status === 'Delivered'
                      ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : o.order_status === 'Returned'
                      ? 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400'
                      : 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400';

                  return (
                    <tr
                      key={o.order_id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {formatDate(o.order_date)}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-800 dark:text-slate-200">
                        {o.order_id}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                        {o.customer_name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {o.city}, {o.state}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {o.category}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 max-w-[180px] truncate" title={o.product_name}>
                        {o.product_name}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                        {o.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-amber-600 dark:text-amber-400">
                        {formatINR(o.total_revenue, { compact: false })}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {o.payment_method}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ${statusColor}`}>
                          {o.order_status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-amber-500">
                        {o.customer_rating} ★
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 px-4 py-3 text-xs text-slate-500 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>
              Showing {sortedOrders.length === 0 ? 0 : (page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, sortedOrders.length)} of {sortedOrders.length.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="flex items-center gap-0.5 rounded px-2.5 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            <span className="px-2 font-mono">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="flex items-center gap-0.5 rounded px-2.5 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
