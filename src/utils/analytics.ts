import {
  Order,
  FilterState,
  OverviewKpis,
  KpiMetric,
  RevenueTimeSeriesPoint,
  CategoryBreakdown,
  RegionBreakdown,
  TopProduct,
  CustomerRfm,
  RfmSegmentDistribution,
  RfmSegmentName,
  CityRevenue,
  CustomerTrendPoint,
  OrderStatusBreakdown,
  ReturnRateByCategory,
  RegionalDeliveryStats,
  DeliveryVsRatingPoint,
  PaymentShare,
  AnalyticsSummary,
  Category,
  Region,
  PaymentMethod,
  OrderStatus,
} from '../types';
import { formatINR, formatPercent } from './formatters';

/**
 * Filter orders based on active global filter state
 */
export function filterOrders(orders: Order[], filters: FilterState): Order[] {
  return orders.filter((order) => {
    // Date range filter
    if (filters.startDate && order.order_date < filters.startDate) return false;
    if (filters.endDate && order.order_date > filters.endDate) return false;

    // Region multi-select
    if (filters.regions.length > 0 && !filters.regions.includes(order.region)) {
      return false;
    }

    // State multi-select
    if (filters.states.length > 0 && !filters.states.includes(order.state)) {
      return false;
    }

    // Category multi-select
    if (filters.categories.length > 0 && !filters.categories.includes(order.category)) {
      return false;
    }

    // Payment method multi-select
    if (
      filters.paymentMethods.length > 0 &&
      !filters.paymentMethods.includes(order.payment_method)
    ) {
      return false;
    }

    // Order status multi-select
    if (
      filters.orderStatuses.length > 0 &&
      !filters.orderStatuses.includes(order.order_status)
    ) {
      return false;
    }

    // Global text search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const match =
        order.order_id.toLowerCase().includes(q) ||
        order.customer_name.toLowerCase().includes(q) ||
        order.product_name.toLowerCase().includes(q) ||
        order.city.toLowerCase().includes(q) ||
        order.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });
}

/**
 * Calculates date boundaries for the previous equivalent period
 */
export function getPreviousPeriodBounds(startDate: string, endDate: string): { prevStart: string; prevEnd: string } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationMs = end.getTime() - start.getTime();

  // One day before current start is previous end
  const prevEndMs = start.getTime() - 24 * 60 * 60 * 1000;
  const prevStartMs = prevEndMs - durationMs;

  return {
    prevStart: new Date(prevStartMs).toISOString().split('T')[0],
    prevEnd: new Date(prevEndMs).toISOString().split('T')[0],
  };
}

/**
 * Calculate Overview KPIs with period-over-period comparisons
 */
export function calculateOverviewKpis(
  currentOrders: Order[],
  allOrders: Order[],
  startDate: string,
  endDate: string
): OverviewKpis {
  const { prevStart, prevEnd } = getPreviousPeriodBounds(startDate, endDate);

  // Filter previous period from all orders
  const prevOrders = allOrders.filter(
    (o) => o.order_date >= prevStart && o.order_date <= prevEnd
  );

  // Current calculations
  const totalRev = currentOrders.reduce((sum, o) => sum + o.total_revenue, 0);
  const totalOrders = currentOrders.length;
  const validForAov = currentOrders.filter((o) => o.order_status !== 'Cancelled');
  const aov = validForAov.length > 0 ? totalRev / validForAov.length : 0;

  const currentCustSet = new Set(currentOrders.map((o) => o.customer_id));
  const uniqueCust = currentCustSet.size;

  const returnedOrders = currentOrders.filter((o) => o.order_status === 'Returned').length;
  const eligibleForReturn = currentOrders.filter((o) => o.order_status !== 'Cancelled').length;
  const returnRate = eligibleForReturn > 0 ? (returnedOrders / eligibleForReturn) * 100 : 0;

  const avgRating =
    currentOrders.length > 0
      ? currentOrders.reduce((sum, o) => sum + o.customer_rating, 0) / currentOrders.length
      : 0;

  // Previous calculations
  const prevRev = prevOrders.reduce((sum, o) => sum + o.total_revenue, 0);
  const prevTotalOrders = prevOrders.length;
  const prevValidForAov = prevOrders.filter((o) => o.order_status !== 'Cancelled');
  const prevAov = prevValidForAov.length > 0 ? prevRev / prevValidForAov.length : 0;
  const prevCustSet = new Set(prevOrders.map((o) => o.customer_id));
  const prevUniqueCust = prevCustSet.size;

  const prevReturned = prevOrders.filter((o) => o.order_status === 'Returned').length;
  const prevEligibleForReturn = prevOrders.filter((o) => o.order_status !== 'Cancelled').length;
  const prevReturnRate =
    prevEligibleForReturn > 0 ? (prevReturned / prevEligibleForReturn) * 100 : 0;

  const prevAvgRating =
    prevOrders.length > 0
      ? prevOrders.reduce((sum, o) => sum + o.customer_rating, 0) / prevOrders.length
      : 0;

  const calcChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  return {
    totalRevenue: {
      value: totalRev,
      previousValue: prevRev,
      percentChange: calcChange(totalRev, prevRev),
      formattedValue: formatINR(totalRev, { compact: true }),
      isPositiveGood: true,
    },
    totalOrders: {
      value: totalOrders,
      previousValue: prevTotalOrders,
      percentChange: calcChange(totalOrders, prevTotalOrders),
      formattedValue: totalOrders.toLocaleString('en-IN'),
      isPositiveGood: true,
    },
    averageOrderValue: {
      value: aov,
      previousValue: prevAov,
      percentChange: calcChange(aov, prevAov),
      formattedValue: formatINR(aov, { compact: false, decimals: 0 }),
      isPositiveGood: true,
    },
    uniqueCustomers: {
      value: uniqueCust,
      previousValue: prevUniqueCust,
      percentChange: calcChange(uniqueCust, prevUniqueCust),
      formattedValue: uniqueCust.toLocaleString('en-IN'),
      isPositiveGood: true,
    },
    returnRate: {
      value: returnRate,
      previousValue: prevReturnRate,
      // For return rate, a drop in rate is good (negative change is green)
      percentChange: returnRate - prevReturnRate,
      formattedValue: formatPercent(returnRate, 1),
      isPositiveGood: false,
    },
    averageRating: {
      value: avgRating,
      previousValue: prevAvgRating,
      percentChange: calcChange(avgRating, prevAvgRating),
      formattedValue: `${avgRating.toFixed(2)} ★`,
      isPositiveGood: true,
    },
  };
}

/**
 * Generate time-series revenue aggregated by daily, weekly, or monthly intervals
 */
export function getRevenueTimeSeries(
  orders: Order[],
  groupBy: 'daily' | 'weekly' | 'monthly' = 'monthly'
): RevenueTimeSeriesPoint[] {
  const map = new Map<string, { revenue: number; orders: number; deliveredRevenue: number }>();

  for (const order of orders) {
    let key = '';
    const d = new Date(order.order_date);

    if (groupBy === 'daily') {
      key = order.order_date;
    } else if (groupBy === 'weekly') {
      // Group by ISO week (Monday)
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      key = monday.toISOString().split('T')[0];
    } else {
      // monthly: YYYY-MM
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }

    const current = map.get(key) || { revenue: 0, orders: 0, deliveredRevenue: 0 };
    current.revenue += order.total_revenue;
    current.orders += 1;
    if (order.order_status === 'Delivered') {
      current.deliveredRevenue += order.total_revenue;
    }
    map.set(key, current);
  }

  const sortedKeys = Array.from(map.keys()).sort();
  return sortedKeys.map((key) => {
    const val = map.get(key)!;
    // Format display date
    let displayDate = key;
    if (groupBy === 'monthly') {
      const [year, month] = key.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      displayDate = `${monthNames[parseInt(month, 10) - 1]} '${year.slice(2)}`;
    } else if (groupBy === 'weekly') {
      const parts = key.split('-');
      displayDate = `Wk ${parts[1]}/${parts[2]}`;
    }
    return {
      date: displayDate,
      revenue: val.revenue,
      orders: val.orders,
      deliveredRevenue: val.deliveredRevenue,
    };
  });
}

/**
 * Category Breakdown for bar chart
 */
export function getCategoryBreakdown(orders: Order[]): CategoryBreakdown[] {
  const map = new Map<Category, { revenue: number; orders: number }>();
  let totalRevenue = 0;

  for (const order of orders) {
    const current = map.get(order.category) || { revenue: 0, orders: 0 };
    current.revenue += order.total_revenue;
    current.orders += 1;
    totalRevenue += order.total_revenue;
    map.set(order.category, current);
  }

  const result: CategoryBreakdown[] = [];
  map.forEach((val, cat) => {
    result.push({
      category: cat,
      revenue: val.revenue,
      orders: val.orders,
      share: totalRevenue > 0 ? (val.revenue / totalRevenue) * 100 : 0,
    });
  });

  return result.sort((a, b) => b.revenue - a.revenue);
}

/**
 * Region breakdown for donut chart
 */
export function getRegionBreakdown(orders: Order[]): RegionBreakdown[] {
  const map = new Map<Region, { revenue: number; orders: number }>();
  let totalRevenue = 0;

  for (const order of orders) {
    const current = map.get(order.region) || { revenue: 0, orders: 0 };
    current.revenue += order.total_revenue;
    current.orders += 1;
    totalRevenue += order.total_revenue;
    map.set(order.region, current);
  }

  const result: RegionBreakdown[] = [];
  map.forEach((val, reg) => {
    result.push({
      region: reg,
      revenue: val.revenue,
      orders: val.orders,
      share: totalRevenue > 0 ? (val.revenue / totalRevenue) * 100 : 0,
    });
  });

  return result.sort((a, b) => b.revenue - a.revenue);
}

/**
 * Top 10 products ranking table
 */
export function getTopProducts(orders: Order[], limit: number = 10): TopProduct[] {
  const map = new Map<
    string,
    {
      category: Category;
      units_sold: number;
      revenue: number;
      discount_sum: number;
      orders_count: number;
      returns_count: number;
    }
  >();

  for (const order of orders) {
    const current = map.get(order.product_name) || {
      category: order.category,
      units_sold: 0,
      revenue: 0,
      discount_sum: 0,
      orders_count: 0,
      returns_count: 0,
    };

    current.units_sold += order.quantity;
    current.revenue += order.total_revenue;
    current.discount_sum += order.discount_percent;
    current.orders_count += 1;
    if (order.order_status === 'Returned') {
      current.returns_count += 1;
    }
    map.set(order.product_name, current);
  }

  const list: TopProduct[] = [];
  map.forEach((val, name) => {
    list.push({
      product_name: name,
      category: val.category,
      units_sold: val.units_sold,
      revenue: val.revenue,
      avg_discount: val.orders_count > 0 ? val.discount_sum / val.orders_count : 0,
      return_count: val.returns_count,
      return_rate: val.orders_count > 0 ? (val.returns_count / val.orders_count) * 100 : 0,
    });
  });

  return list.sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

/**
 * Compute RFM Scores and Segment Customers
 * R: Recency (days since last purchase, lower is better)
 * F: Frequency (number of orders, higher is better)
 * M: Monetary (total spend in INR, higher is better)
 */
export function computeRfmAnalysis(
  orders: Order[],
  allOrders: Order[]
): {
  customers: CustomerRfm[];
  distribution: RfmSegmentDistribution[];
} {
  // Find global max date as reference point
  let maxDate = '2024-01-01';
  for (const o of allOrders) {
    if (o.order_date > maxDate) maxDate = o.order_date;
  }
  const refTime = new Date(maxDate).getTime();

  // Aggregate by customer
  const customerMap = new Map<
    string,
    {
      name: string;
      city: string;
      state: string;
      ordersCount: number;
      totalSpend: number;
      latestDate: string;
    }
  >();

  for (const o of orders) {
    const existing = customerMap.get(o.customer_id) || {
      name: o.customer_name,
      city: o.city,
      state: o.state,
      ordersCount: 0,
      totalSpend: 0,
      latestDate: o.order_date,
    };
    existing.ordersCount += 1;
    existing.totalSpend += o.total_revenue;
    if (o.order_date > existing.latestDate) {
      existing.latestDate = o.order_date;
    }
    customerMap.set(o.customer_id, existing);
  }

  const rawList: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    totalOrders: number;
    totalSpend: number;
    latestDate: string;
    recencyDays: number;
  }> = [];

  customerMap.forEach((val, id) => {
    const orderTime = new Date(val.latestDate).getTime();
    const recencyDays = Math.max(0, Math.round((refTime - orderTime) / (1000 * 60 * 60 * 24)));
    rawList.push({
      id,
      name: val.name,
      city: val.city,
      state: val.state,
      totalOrders: val.ordersCount,
      totalSpend: val.totalSpend,
      latestDate: val.latestDate,
      recencyDays,
    });
  });

  if (rawList.length === 0) {
    return { customers: [], distribution: [] };
  }

  // Calculate quantiles or score thresholds
  const scoredCustomers: CustomerRfm[] = rawList.map((c) => {
    // Recency score (1-5): Recent purchases get 5, distant purchases get 1
    let rScore = 1;
    if (c.recencyDays <= 30) rScore = 5;
    else if (c.recencyDays <= 90) rScore = 4;
    else if (c.recencyDays <= 180) rScore = 3;
    else if (c.recencyDays <= 300) rScore = 2;
    else rScore = 1;

    // Frequency score (1-5)
    let fScore = 1;
    if (c.totalOrders >= 7) fScore = 5;
    else if (c.totalOrders >= 5) fScore = 4;
    else if (c.totalOrders >= 3) fScore = 3;
    else if (c.totalOrders >= 2) fScore = 2;
    else fScore = 1;

    // Monetary score (1-5)
    let mScore = 1;
    if (c.totalSpend >= 50000) mScore = 5;
    else if (c.totalSpend >= 25000) mScore = 4;
    else if (c.totalSpend >= 10000) mScore = 3;
    else if (c.totalSpend >= 4000) mScore = 2;
    else mScore = 1;

    // Segment Classification
    let segment: RfmSegmentName = 'Lost';
    const totalScore = rScore + fScore + mScore;

    if (rScore >= 4 && (fScore >= 4 || mScore >= 4)) {
      segment = 'Champions';
    } else if (fScore >= 3 && mScore >= 3) {
      segment = 'Loyal';
    } else if (rScore <= 2 && (fScore >= 3 || mScore >= 3)) {
      segment = 'At Risk';
    } else if (rScore >= 3 && fScore <= 2) {
      segment = 'Loyal'; // Active growing buyers
    } else {
      segment = 'Lost';
    }

    return {
      customerId: c.id,
      customerName: c.name,
      city: c.city,
      state: c.state,
      totalOrders: c.totalOrders,
      totalSpend: c.totalSpend,
      lastOrderDate: c.latestDate,
      recencyDays: c.recencyDays,
      rScore,
      fScore,
      mScore,
      segment,
      avgOrderValue: c.totalOrders > 0 ? c.totalSpend / c.totalOrders : 0,
    };
  });

  // Calculate segment distributions
  const segmentColors: Record<RfmSegmentName, string> = {
    Champions: '#10b981', // Emerald
    Loyal: '#3b82f6', // Blue
    'At Risk': '#f59e0b', // Amber
    Lost: '#ef4444', // Red
  };

  const segments: RfmSegmentName[] = ['Champions', 'Loyal', 'At Risk', 'Lost'];
  const distribution: RfmSegmentDistribution[] = segments.map((seg) => {
    const matched = scoredCustomers.filter((c) => c.segment === seg);
    const count = matched.length;
    const rev = matched.reduce((sum, c) => sum + c.totalSpend, 0);
    return {
      segment: seg,
      count,
      revenue: rev,
      avgSpend: count > 0 ? rev / count : 0,
      color: segmentColors[seg],
    };
  });

  return {
    customers: scoredCustomers.sort((a, b) => b.totalSpend - a.totalSpend),
    distribution,
  };
}

/**
 * New vs Returning Customers Trend over time
 */
export function getCustomerRetentionTrend(
  filteredOrders: Order[],
  allOrders: Order[]
): CustomerTrendPoint[] {
  // Map customer first order date globally
  const customerFirstSeen = new Map<string, string>();
  for (const o of allOrders) {
    const existing = customerFirstSeen.get(o.customer_id);
    if (!existing || o.order_date < existing) {
      customerFirstSeen.set(o.customer_id, o.order_date);
    }
  }

  // Monthly buckets for filtered orders
  const monthMap = new Map<string, { newCust: Set<string>; returnCust: Set<string> }>();

  for (const o of filteredOrders) {
    const d = new Date(o.order_date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { newCust: new Set(), returnCust: new Set() });
    }
    const bucket = monthMap.get(monthKey)!;

    const firstSeen = customerFirstSeen.get(o.customer_id)!;
    const firstSeenMonth = firstSeen.substring(0, 7);

    if (firstSeenMonth === monthKey) {
      bucket.newCust.add(o.customer_id);
    } else {
      bucket.returnCust.add(o.customer_id);
    }
  }

  const sortedMonths = Array.from(monthMap.keys()).sort();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return sortedMonths.map((m) => {
    const bucket = monthMap.get(m)!;
    const [year, month] = m.split('-');
    const label = `${monthNames[parseInt(month, 10) - 1]} '${year.slice(2)}`;
    return {
      period: label,
      newCustomers: bucket.newCust.size,
      returningCustomers: bucket.returnCust.size,
    };
  });
}

/**
 * Top 10 Cities by Revenue (horizontal bar chart)
 */
export function getTopCitiesByRevenue(orders: Order[], limit: number = 10): CityRevenue[] {
  const map = new Map<string, { state: string; region: Region; revenue: number; orders: number }>();

  for (const o of orders) {
    const current = map.get(o.city) || {
      state: o.state,
      region: o.region,
      revenue: 0,
      orders: 0,
    };
    current.revenue += o.total_revenue;
    current.orders += 1;
    map.set(o.city, current);
  }

  const list: CityRevenue[] = [];
  map.forEach((val, city) => {
    list.push({
      city,
      state: val.state,
      region: val.region,
      revenue: val.revenue,
      orders: val.orders,
    });
  });

  return list.sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

/**
 * Order Status Breakdown
 */
export function getOrderStatusBreakdown(orders: Order[]): OrderStatusBreakdown[] {
  const statuses: OrderStatus[] = ['Delivered', 'Returned', 'Cancelled'];
  const total = orders.length;

  return statuses.map((status) => {
    const filtered = orders.filter((o) => o.order_status === status);
    const rev = filtered.reduce((sum, o) => sum + o.total_revenue, 0);
    return {
      status,
      count: filtered.length,
      revenue: rev,
      percentage: total > 0 ? (filtered.length / total) * 100 : 0,
    };
  });
}

/**
 * Return Rate by Category
 */
export function getReturnRateByCategory(orders: Order[]): ReturnRateByCategory[] {
  const map = new Map<
    Category,
    { total: number; returned: number; deliverySum: number; deliveredCount: number }
  >();

  for (const o of orders) {
    const current = map.get(o.category) || {
      total: 0,
      returned: 0,
      deliverySum: 0,
      deliveredCount: 0,
    };
    if (o.order_status !== 'Cancelled') {
      current.total += 1;
      if (o.order_status === 'Returned') {
        current.returned += 1;
      }
      current.deliverySum += o.delivery_days;
      current.deliveredCount += 1;
    }
    map.set(o.category, current);
  }

  const list: ReturnRateByCategory[] = [];
  map.forEach((val, cat) => {
    list.push({
      category: cat,
      totalOrders: val.total,
      returnedOrders: val.returned,
      returnRate: val.total > 0 ? (val.returned / val.total) * 100 : 0,
      avgDeliveryDays: val.deliveredCount > 0 ? val.deliverySum / val.deliveredCount : 0,
    });
  });

  return list.sort((a, b) => b.returnRate - a.returnRate);
}

/**
 * Regional Delivery Days & Logistics Performance
 */
export function getRegionalDeliveryStats(orders: Order[]): RegionalDeliveryStats[] {
  const regions: Region[] = ['North', 'South', 'West', 'East'];

  return regions.map((region) => {
    const regOrders = orders.filter((o) => o.region === region && o.order_status !== 'Cancelled');
    const totalDelivered = regOrders.length;
    const avgDeliveryDays =
      totalDelivered > 0
        ? regOrders.reduce((sum, o) => sum + o.delivery_days, 0) / totalDelivered
        : 0;

    // Delivery under 4 days considered on-time
    const onTime = regOrders.filter((o) => o.delivery_days <= 4).length;
    const onTimePercent = totalDelivered > 0 ? (onTime / totalDelivered) * 100 : 0;

    return {
      region,
      avgDeliveryDays,
      onTimePercent,
      totalDelivered,
    };
  });
}

/**
 * Delivery Days vs Customer Rating
 */
export function getDeliveryVsRating(orders: Order[]): DeliveryVsRatingPoint[] {
  const map = new Map<number, { sumRating: number; count: number }>();

  for (const o of orders) {
    if (o.order_status !== 'Cancelled' && o.delivery_days > 0) {
      const days = o.delivery_days;
      const current = map.get(days) || { sumRating: 0, count: 0 };
      current.sumRating += o.customer_rating;
      current.count += 1;
      map.set(days, current);
    }
  }

  const sortedDays = Array.from(map.keys()).sort((a, b) => a - b);
  return sortedDays.map((days) => {
    const val = map.get(days)!;
    return {
      deliveryDays: days,
      avgRating: Number((val.sumRating / val.count).toFixed(2)),
      orderCount: val.count,
    };
  });
}

/**
 * Payment Method Share
 */
export function getPaymentMethodShare(orders: Order[]): PaymentShare[] {
  const map = new Map<PaymentMethod, { orders: number; revenue: number }>();
  let totalRevenue = 0;

  for (const o of orders) {
    const current = map.get(o.payment_method) || { orders: 0, revenue: 0 };
    current.orders += 1;
    current.revenue += o.total_revenue;
    totalRevenue += o.total_revenue;
    map.set(o.payment_method, current);
  }

  const list: PaymentShare[] = [];
  map.forEach((val, method) => {
    list.push({
      method,
      orders: val.orders,
      revenue: val.revenue,
      share: totalRevenue > 0 ? (val.revenue / totalRevenue) * 100 : 0,
    });
  });

  return list.sort((a, b) => b.revenue - a.revenue);
}

/**
 * Generate compact analytics summary payload for Gemini AI insights
 */
export function generateAnalyticsSummary(
  currentOrders: Order[],
  allOrders: Order[],
  startDate: string,
  endDate: string
): AnalyticsSummary {
  const kpis = calculateOverviewKpis(currentOrders, allOrders, startDate, endDate);
  const categories = getCategoryBreakdown(currentOrders);
  const returnByCat = getReturnRateByCategory(currentOrders);
  const regions = getRegionalDeliveryStats(currentOrders);
  const cities = getTopCitiesByRevenue(currentOrders, 5);
  const payments = getPaymentMethodShare(currentOrders);
  const rfm = computeRfmAnalysis(currentOrders, allOrders);
  const statusBreakdown = getOrderStatusBreakdown(currentOrders);

  const totalDelivered = statusBreakdown.find((s) => s.status === 'Delivered')?.percentage || 0;
  const totalReturned = statusBreakdown.find((s) => s.status === 'Returned')?.percentage || 0;
  const totalCancelled = statusBreakdown.find((s) => s.status === 'Cancelled')?.percentage || 0;

  const catMap = new Map(returnByCat.map((r) => [r.category, r.returnRate]));

  return {
    period: {
      start: startDate,
      end: endDate,
      label: `${startDate} to ${endDate}`,
    },
    kpis: {
      revenue: Math.round(kpis.totalRevenue.value),
      orders: kpis.totalOrders.value,
      aov: Math.round(kpis.averageOrderValue.value),
      customers: kpis.uniqueCustomers.value,
      returnRate: Number(kpis.returnRate.value.toFixed(1)),
      avgRating: Number(kpis.averageRating.value.toFixed(2)),
    },
    categoryPerformance: categories.map((c) => ({
      category: c.category,
      revenue: Math.round(c.revenue),
      returnRate: Number((catMap.get(c.category) || 0).toFixed(1)),
    })),
    regionalPerformance: regions.map((r) => ({
      region: r.region,
      revenue: Math.round(
        currentOrders
          .filter((o) => o.region === r.region)
          .reduce((sum, o) => sum + o.total_revenue, 0)
      ),
      avgDeliveryDays: Number(r.avgDeliveryDays.toFixed(1)),
    })),
    topCities: cities.map((c) => ({
      city: c.city,
      revenue: Math.round(c.revenue),
    })),
    paymentMix: payments.map((p) => ({
      method: p.method,
      sharePercent: Number(p.share.toFixed(1)),
    })),
    rfmSegmentMix: rfm.distribution.map((d) => ({
      segment: d.segment,
      count: d.count,
      revenueShare: Number(
        (
          (d.revenue / (kpis.totalRevenue.value || 1)) *
          100
        ).toFixed(1)
      ),
    })),
    operationalHighlights: {
      deliveredPercent: Number(totalDelivered.toFixed(1)),
      returnPercent: Number(totalReturned.toFixed(1)),
      cancelledPercent: Number(totalCancelled.toFixed(1)),
    },
  };
}
