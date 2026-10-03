export type Region = 'North' | 'South' | 'East' | 'West';

export type Category =
  | 'Electronics'
  | 'Fashion'
  | 'Home & Kitchen'
  | 'Beauty'
  | 'Books'
  | 'Grocery';

export type PaymentMethod =
  | 'UPI'
  | 'Credit Card'
  | 'Debit Card'
  | 'COD'
  | 'Net Banking';

export type OrderStatus = 'Delivered' | 'Returned' | 'Cancelled';

export interface Order {
  order_id: string;
  order_date: string; // YYYY-MM-DD
  customer_id: string;
  customer_name: string;
  city: string;
  state: string;
  region: Region;
  category: Category;
  product_name: string;
  quantity: number;
  unit_price: number; // in INR
  discount_percent: number; // e.g., 10 for 10%
  payment_method: PaymentMethod;
  order_status: OrderStatus;
  delivery_days: number;
  customer_rating: number; // 1-5
  // Calculated convenience properties:
  total_revenue: number; // quantity * unit_price * (1 - discount_percent/100)
}

export type DatePreset = 'last_30_days' | 'last_quarter' | 'this_year' | 'all_time' | 'custom';

export interface FilterState {
  datePreset: DatePreset;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  regions: Region[];
  states: string[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  orderStatuses: OrderStatus[];
  searchQuery: string;
}

export interface KpiMetric {
  value: number;
  previousValue: number;
  percentChange: number;
  formattedValue: string;
  isPositiveGood?: boolean;
}

export interface OverviewKpis {
  totalRevenue: KpiMetric;
  totalOrders: KpiMetric;
  averageOrderValue: KpiMetric;
  uniqueCustomers: KpiMetric;
  returnRate: KpiMetric;
  averageRating: KpiMetric;
}

export interface RevenueTimeSeriesPoint {
  date: string;
  revenue: number;
  orders: number;
  deliveredRevenue: number;
}

export interface CategoryBreakdown {
  category: Category;
  revenue: number;
  orders: number;
  share: number;
}

export interface RegionBreakdown {
  region: Region;
  revenue: number;
  orders: number;
  share: number;
}

export interface TopProduct {
  product_name: string;
  category: Category;
  units_sold: number;
  revenue: number;
  avg_discount: number;
  return_count: number;
  return_rate: number;
}

export type RfmSegmentName = 'Champions' | 'Loyal' | 'At Risk' | 'Lost';

export interface CustomerRfm {
  customerId: string;
  customerName: string;
  city: string;
  state: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderDate: string;
  recencyDays: number;
  rScore: number;
  fScore: number;
  mScore: number;
  segment: RfmSegmentName;
  avgOrderValue: number;
}

export interface RfmSegmentDistribution {
  segment: RfmSegmentName;
  count: number;
  revenue: number;
  avgSpend: number;
  color: string;
}

export interface CityRevenue {
  city: string;
  state: string;
  region: Region;
  revenue: number;
  orders: number;
}

export interface CustomerTrendPoint {
  period: string;
  newCustomers: number;
  returningCustomers: number;
}

export interface OrderStatusBreakdown {
  status: OrderStatus;
  count: number;
  revenue: number;
  percentage: number;
}

export interface ReturnRateByCategory {
  category: Category;
  totalOrders: number;
  returnedOrders: number;
  returnRate: number;
  avgDeliveryDays: number;
}

export interface RegionalDeliveryStats {
  region: Region;
  avgDeliveryDays: number;
  onTimePercent: number;
  totalDelivered: number;
}

export interface DeliveryVsRatingPoint {
  deliveryDays: number;
  avgRating: number;
  orderCount: number;
}

export interface PaymentShare {
  method: PaymentMethod;
  orders: number;
  revenue: number;
  share: number;
}

export interface AiInsight {
  title: string;
  metric: string;
  observation: string;
  severity: 'positive' | 'warning' | 'neutral';
}

export interface AiRecommendation {
  priority: 'High' | 'Medium' | 'Low';
  action: string;
  impact: string;
  timeline: string;
}

export interface AiInsightsResponse {
  insights: AiInsight[];
  recommendations: AiRecommendation[];
  executiveSummary: string;
}

export interface AnalyticsSummary {
  period: {
    start: string;
    end: string;
    label: string;
  };
  kpis: {
    revenue: number;
    orders: number;
    aov: number;
    customers: number;
    returnRate: number;
    avgRating: number;
  };
  categoryPerformance: Array<{ category: string; revenue: number; returnRate: number }>;
  regionalPerformance: Array<{ region: string; revenue: number; avgDeliveryDays: number }>;
  topCities: Array<{ city: string; revenue: number }>;
  paymentMix: Array<{ method: string; sharePercent: number }>;
  rfmSegmentMix: Array<{ segment: string; count: number; revenueShare: number }>;
  operationalHighlights: {
    deliveredPercent: number;
    returnPercent: number;
    cancelledPercent: number;
  };
}
