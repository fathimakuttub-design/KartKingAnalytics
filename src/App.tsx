/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { generateSyntheticOrders } from './data/mockDataGenerator';
import {
  filterOrders,
  calculateOverviewKpis,
  getRevenueTimeSeries,
  getCategoryBreakdown,
  getRegionBreakdown,
  getTopProducts,
  computeRfmAnalysis,
  getCustomerRetentionTrend,
  getTopCitiesByRevenue,
  getOrderStatusBreakdown,
  getReturnRateByCategory,
  getRegionalDeliveryStats,
  getDeliveryVsRating,
  getPaymentMethodShare,
  generateAnalyticsSummary,
} from './utils/analytics';
import { FilterState, Order } from './types';
import { Header } from './components/common/Header';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { FilterBar } from './components/common/FilterBar';
import { CsvUploadModal } from './components/upload/CsvUploadModal';
import { OverviewPage } from './components/overview/OverviewPage';
import { CustomersPage } from './components/customers/CustomersPage';
import { OperationsPage } from './components/operations/OperationsPage';
import { AiInsightsPage } from './components/ai/AiInsightsPage';
import { DataExplorerPage } from './components/explorer/DataExplorerPage';
import { AboutPage } from './components/about/AboutPage';

// Auth Imports
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/ProtectedRoute';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { ForgotPassword } from './components/auth/ForgotPassword';

const INITIAL_FILTERS: FilterState = {
  datePreset: 'all_time',
  startDate: '2024-01-01',
  endDate: '2025-12-31',
  regions: [],
  states: [],
  categories: [],
  paymentMethods: [],
  orderStatuses: [],
  searchQuery: '',
};

function DashboardLayout({
  darkMode,
  setDarkMode,
}: {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // Navigation & Sidebar State
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dataset State (Synthetic vs Custom Uploaded CSV)
  const syntheticOrders = useMemo(() => generateSyntheticOrders(3000), []);
  const [customOrders, setCustomOrders] = useState<Order[] | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const activeRawOrders = useMemo(() => {
    return customOrders && customOrders.length > 0 ? customOrders : syntheticOrders;
  }, [customOrders, syntheticOrders]);

  // Time Grouping for Overview Trajectory Chart
  const [timeGrouping, setTimeGrouping] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // Global Filter State
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Derive unique states from active dataset
  const availableStates = useMemo(() => {
    const set = new Set(activeRawOrders.map((o) => o.state));
    return Array.from(set).sort();
  }, [activeRawOrders]);

  // Memoized Filtered Dataset
  const filteredOrders = useMemo(() => {
    return filterOrders(activeRawOrders, filters);
  }, [activeRawOrders, filters]);

  const isFilteredEmpty = filteredOrders.length === 0;

  // Analytical Aggregations (using useMemo for instant reactivity)
  const kpis = useMemo(() => {
    return calculateOverviewKpis(
      filteredOrders,
      activeRawOrders,
      filters.startDate,
      filters.endDate
    );
  }, [filteredOrders, activeRawOrders, filters.startDate, filters.endDate]);

  const timeSeries = useMemo(() => {
    return getRevenueTimeSeries(filteredOrders, timeGrouping);
  }, [filteredOrders, timeGrouping]);

  const categoryBreakdown = useMemo(() => {
    return getCategoryBreakdown(filteredOrders);
  }, [filteredOrders]);

  const regionBreakdown = useMemo(() => {
    return getRegionBreakdown(filteredOrders);
  }, [filteredOrders]);

  const topProducts = useMemo(() => {
    return getTopProducts(filteredOrders, 10);
  }, [filteredOrders]);

  const rfmAnalysis = useMemo(() => {
    return computeRfmAnalysis(filteredOrders, activeRawOrders);
  }, [filteredOrders, activeRawOrders]);

  const retentionTrend = useMemo(() => {
    return getCustomerRetentionTrend(filteredOrders, activeRawOrders);
  }, [filteredOrders, activeRawOrders]);

  const topCities = useMemo(() => {
    return getTopCitiesByRevenue(filteredOrders, 10);
  }, [filteredOrders]);

  const orderStatusBreakdown = useMemo(() => {
    return getOrderStatusBreakdown(filteredOrders);
  }, [filteredOrders]);

  const returnByCategory = useMemo(() => {
    return getReturnRateByCategory(filteredOrders);
  }, [filteredOrders]);

  const regionalDelivery = useMemo(() => {
    return getRegionalDeliveryStats(filteredOrders);
  }, [filteredOrders]);

  const deliveryVsRating = useMemo(() => {
    return getDeliveryVsRating(filteredOrders);
  }, [filteredOrders]);

  const paymentMethodShare = useMemo(() => {
    return getPaymentMethodShare(filteredOrders);
  }, [filteredOrders]);

  const analyticsSummary = useMemo(() => {
    return generateAnalyticsSummary(
      filteredOrders,
      activeRawOrders,
      filters.startDate,
      filters.endDate
    );
  }, [filteredOrders, activeRawOrders, filters.startDate, filters.endDate]);

  // Handlers
  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleCustomDataLoaded = (orders: Order[]) => {
    setCustomOrders(orders);
    const minD = orders[0]?.order_date || '2024-01-01';
    const maxD = orders[orders.length - 1]?.order_date || '2025-12-31';
    setFilters({
      ...INITIAL_FILTERS,
      startDate: minD,
      endDate: maxD,
    });
  };

  const handleResetToSynthetic = () => {
    setCustomOrders(null);
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100 font-sans">
      {/* Top Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        isCustomDataLoaded={Boolean(customOrders)}
        onResetToSyntheticData={handleResetToSynthetic}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Sticky Global Filter Bar */}
          <FilterBar
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            availableStates={availableStates}
            totalFilteredCount={filteredOrders.length}
            totalTotalCount={activeRawOrders.length}
          />

          {/* Tab Pages */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {activeTab === 'overview' && (
              <OverviewPage
                kpis={kpis}
                timeSeries={timeSeries}
                categories={categoryBreakdown}
                regions={regionBreakdown}
                topProducts={topProducts}
                timeGrouping={timeGrouping}
                onTimeGroupingChange={setTimeGrouping}
                isFilteredEmpty={isFilteredEmpty}
              />
            )}

            {activeTab === 'customers' && (
              <CustomersPage
                rfmCustomers={rfmAnalysis.customers}
                rfmDistribution={rfmAnalysis.distribution}
                cities={topCities}
                retentionTrend={retentionTrend}
                isFilteredEmpty={isFilteredEmpty}
              />
            )}

            {activeTab === 'operations' && (
              <OperationsPage
                orderStatus={orderStatusBreakdown}
                returnByCategory={returnByCategory}
                regionalDelivery={regionalDelivery}
                deliveryVsRating={deliveryVsRating}
                paymentShare={paymentMethodShare}
                isFilteredEmpty={isFilteredEmpty}
              />
            )}

            {activeTab === 'ai' && (
              <AiInsightsPage
                summary={analyticsSummary}
                isFilteredEmpty={isFilteredEmpty}
              />
            )}

            {activeTab === 'explorer' && (
              <DataExplorerPage orders={filteredOrders} />
            )}

            {activeTab === 'about' && <AboutPage />}
          </main>
        </div>
      </div>

      {/* CSV Upload Modal */}
      <CsvUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDataLoaded={handleCustomDataLoaded}
      />
    </div>
  );
}

export default function App() {
  // Theme State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('kartking_theme') === 'dark' ||
        (!('kartking_theme' in localStorage) &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kartking_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kartking_theme', 'light');
    }
  }, [darkMode]);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <Signup />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicOnlyRoute>
                <ForgotPassword />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Dashboard Route */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          />

          {/* Fallback to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
