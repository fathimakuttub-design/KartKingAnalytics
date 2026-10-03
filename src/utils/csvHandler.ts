import Papa from 'papaparse';
import { Order, Region, Category, PaymentMethod, OrderStatus } from '../types';

export interface ParseResult {
  orders: Order[];
  errors: string[];
  warnings: string[];
  totalRows: number;
}

const REQUIRED_FIELDS = [
  'order_id',
  'order_date',
  'customer_id',
  'customer_name',
  'city',
  'state',
  'region',
  'category',
  'product_name',
  'quantity',
  'unit_price',
];

const COLUMN_ALIASES: Record<string, string> = {
  // order_id
  orderid: 'order_id',
  'order id': 'order_id',
  id: 'order_id',
  // order_date
  orderdate: 'order_date',
  'order date': 'order_date',
  date: 'order_date',
  // customer_id
  customerid: 'customer_id',
  'customer id': 'customer_id',
  cust_id: 'customer_id',
  // customer_name
  customername: 'customer_name',
  'customer name': 'customer_name',
  customer: 'customer_name',
  name: 'customer_name',
  // city
  city: 'city',
  // state
  state: 'state',
  // region
  region: 'region',
  zone: 'region',
  // category
  category: 'category',
  segment: 'category',
  // product_name
  productname: 'product_name',
  'product name': 'product_name',
  product: 'product_name',
  item: 'product_name',
  // quantity
  quantity: 'quantity',
  qty: 'quantity',
  units: 'quantity',
  // unit_price
  unitprice: 'unit_price',
  'unit price': 'unit_price',
  price: 'unit_price',
  'unit_price (inr)': 'unit_price',
  'price_inr': 'unit_price',
  // discount_percent
  discountpercent: 'discount_percent',
  'discount percent': 'discount_percent',
  discount: 'discount_percent',
  'discount%': 'discount_percent',
  'discount_pct': 'discount_percent',
  // payment_method
  paymentmethod: 'payment_method',
  'payment method': 'payment_method',
  payment: 'payment_method',
  mode: 'payment_method',
  // order_status
  orderstatus: 'order_status',
  'order status': 'order_status',
  status: 'order_status',
  // delivery_days
  deliverydays: 'delivery_days',
  'delivery days': 'delivery_days',
  delivery_time: 'delivery_days',
  days: 'delivery_days',
  // customer_rating
  customerrating: 'customer_rating',
  'customer rating': 'customer_rating',
  rating: 'customer_rating',
  stars: 'customer_rating',
};

function normalizeHeader(header: string): string {
  const clean = header.trim().toLowerCase().replace(/[\t\r\n]/g, '');
  return COLUMN_ALIASES[clean] || clean.replace(/\s+/g, '_');
}

/**
 * Parse an uploaded CSV file using PapaParse
 */
export function parseUploadedCsv(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: (results) => {
        const rows = results.data as Record<string, any>[];
        const errors: string[] = [];
        const warnings: string[] = [];
        const parsedOrders: Order[] = [];

        if (rows.length === 0) {
          return resolve({
            orders: [],
            errors: ['The uploaded CSV file is empty.'],
            warnings: [],
            totalRows: 0,
          });
        }

        const presentHeaders = Object.keys(rows[0]);
        const missingFields = REQUIRED_FIELDS.filter((f) => !presentHeaders.includes(f));

        if (missingFields.length > 0) {
          return resolve({
            orders: [],
            errors: [
              `Missing required column(s): ${missingFields.join(', ')}. Please check your CSV header names or download our sample template.`,
            ],
            warnings: [],
            totalRows: rows.length,
          });
        }

        rows.forEach((row, idx) => {
          const rowNum = idx + 2; // account for header line + 1-indexed

          const orderId = String(row.order_id || `ORD-${idx + 1}`).trim();
          let orderDate = String(row.order_date || '').trim();

          // Validate date format, normalize if needed
          const dateTest = new Date(orderDate);
          if (isNaN(dateTest.getTime())) {
            // Default to today if invalid
            orderDate = new Date().toISOString().split('T')[0];
            if (warnings.length < 5) {
              warnings.push(`Row ${rowNum}: Invalid date "${row.order_date}". Defaulted to current date.`);
            }
          } else {
            orderDate = dateTest.toISOString().split('T')[0];
          }

          const customerId = String(row.customer_id || `CUST-${idx + 1}`).trim();
          const customerName = String(row.customer_name || 'Guest Customer').trim();
          const city = String(row.city || 'Bengaluru').trim();
          const state = String(row.state || 'Karnataka').trim();

          // Region normalization
          let region: Region = 'South';
          const regRaw = String(row.region || '').trim().toLowerCase();
          if (regRaw.includes('north')) region = 'North';
          else if (regRaw.includes('west')) region = 'West';
          else if (regRaw.includes('east')) region = 'East';
          else region = 'South';

          // Category normalization
          let category: Category = 'Electronics';
          const catRaw = String(row.category || '').trim().toLowerCase();
          if (catRaw.includes('fashion') || catRaw.includes('apparel') || catRaw.includes('clothing')) {
            category = 'Fashion';
          } else if (catRaw.includes('home') || catRaw.includes('kitchen')) {
            category = 'Home & Kitchen';
          } else if (catRaw.includes('beauty') || catRaw.includes('cosmetics')) {
            category = 'Beauty';
          } else if (catRaw.includes('book')) {
            category = 'Books';
          } else if (catRaw.includes('groc') || catRaw.includes('food')) {
            category = 'Grocery';
          } else {
            category = 'Electronics';
          }

          const productName = String(row.product_name || 'Standard Product').trim();
          const quantity = Math.max(1, parseInt(row.quantity, 10) || 1);
          const unitPrice = Math.max(0, parseFloat(row.unit_price) || 999);
          const discountPercent = Math.min(90, Math.max(0, parseFloat(row.discount_percent) || 0));

          // Payment method normalization
          let paymentMethod: PaymentMethod = 'UPI';
          const payRaw = String(row.payment_method || '').trim().toLowerCase();
          if (payRaw.includes('credit')) paymentMethod = 'Credit Card';
          else if (payRaw.includes('debit')) paymentMethod = 'Debit Card';
          else if (payRaw.includes('cod') || payRaw.includes('cash')) paymentMethod = 'COD';
          else if (payRaw.includes('net') || payRaw.includes('bank')) paymentMethod = 'Net Banking';
          else paymentMethod = 'UPI';

          // Order status normalization
          let orderStatus: OrderStatus = 'Delivered';
          const statRaw = String(row.order_status || '').trim().toLowerCase();
          if (statRaw.includes('return')) orderStatus = 'Returned';
          else if (statRaw.includes('cancel')) orderStatus = 'Cancelled';
          else orderStatus = 'Delivered';

          const deliveryDays = Math.max(0, parseInt(row.delivery_days, 10) || 3);
          const customerRating = Math.min(5, Math.max(1, parseInt(row.customer_rating, 10) || 4));

          const discountedUnit = unitPrice * (1 - discountPercent / 100);
          const totalRev = orderStatus === 'Cancelled' ? 0 : Math.round(discountedUnit * quantity);

          parsedOrders.push({
            order_id: orderId,
            order_date: orderDate,
            customer_id: customerId,
            customer_name: customerName,
            city,
            state,
            region,
            category,
            product_name: productName,
            quantity,
            unit_price: unitPrice,
            discount_percent: discountPercent,
            payment_method: paymentMethod,
            order_status: orderStatus,
            delivery_days: orderStatus === 'Cancelled' ? 0 : deliveryDays,
            customer_rating: customerRating,
            total_revenue: totalRev,
          });
        });

        // Chronological sort
        parsedOrders.sort((a, b) => a.order_date.localeCompare(b.order_date));

        resolve({
          orders: parsedOrders,
          errors,
          warnings,
          totalRows: parsedOrders.length,
        });
      },
      error: (err) => {
        resolve({
          orders: [],
          errors: [`Failed to parse CSV: ${err.message}`],
          warnings: [],
          totalRows: 0,
        });
      },
    });
  });
}

/**
 * Generates and triggers download for the sample CSV template
 */
export function downloadSampleCsv(): void {
  const sampleData = [
    {
      order_id: 'KK-2025-10001',
      order_date: '2025-10-15',
      customer_id: 'CUST-1042',
      customer_name: 'Aarav Sharma',
      city: 'Bengaluru',
      state: 'Karnataka',
      region: 'South',
      category: 'Electronics',
      product_name: 'boAt Rockerz Bluetooth Headphones',
      quantity: 1,
      unit_price: 1499,
      discount_percent: 20,
      payment_method: 'UPI',
      order_status: 'Delivered',
      delivery_days: 2,
      customer_rating: 5,
    },
    {
      order_id: 'KK-2025-10002',
      order_date: '2025-10-16',
      customer_id: 'CUST-1088',
      customer_name: 'Pooja Patel',
      city: 'Mumbai',
      state: 'Maharashtra',
      region: 'West',
      category: 'Fashion',
      product_name: 'FabIndia Pure Cotton Kurta',
      quantity: 2,
      unit_price: 2499,
      discount_percent: 15,
      payment_method: 'Credit Card',
      order_status: 'Delivered',
      delivery_days: 3,
      customer_rating: 4,
    },
    {
      order_id: 'KK-2025-10003',
      order_date: '2025-10-18',
      customer_id: 'CUST-1120',
      customer_name: 'Rohan Iyer',
      city: 'Chennai',
      state: 'Tamil Nadu',
      region: 'South',
      category: 'Fashion',
      product_name: 'Biba Embroidered Anarkali Suit',
      quantity: 1,
      unit_price: 3999,
      discount_percent: 10,
      payment_method: 'COD',
      order_status: 'Returned',
      delivery_days: 4,
      customer_rating: 2,
    },
    {
      order_id: 'KK-2025-10004',
      order_date: '2025-10-20',
      customer_id: 'CUST-1050',
      customer_name: 'Neha Verma',
      city: 'Delhi',
      state: 'Delhi',
      region: 'North',
      category: 'Home & Kitchen',
      product_name: 'Prestige Iris 750W Mixer Grinder',
      quantity: 1,
      unit_price: 3299,
      discount_percent: 25,
      payment_method: 'UPI',
      order_status: 'Delivered',
      delivery_days: 3,
      customer_rating: 5,
    },
    {
      order_id: 'KK-2025-10005',
      order_date: '2025-10-21',
      customer_id: 'CUST-1310',
      customer_name: 'Vikram Singh',
      city: 'Kolkata',
      state: 'West Bengal',
      region: 'East',
      category: 'Books',
      product_name: 'The Psychology of Money - Morgan Housel',
      quantity: 1,
      unit_price: 350,
      discount_percent: 0,
      payment_method: 'UPI',
      order_status: 'Delivered',
      delivery_days: 5,
      customer_rating: 5,
    },
  ];

  const csv = Papa.unparse(sampleData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'kartking_orders_sample.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download currently filtered orders as CSV
 */
export function downloadFilteredCsv(orders: Order[], filename: string = 'kartking_filtered_orders.csv'): void {
  const exportRows = orders.map((o) => ({
    order_id: o.order_id,
    order_date: o.order_date,
    customer_id: o.customer_id,
    customer_name: o.customer_name,
    city: o.city,
    state: o.state,
    region: o.region,
    category: o.category,
    product_name: o.product_name,
    quantity: o.quantity,
    unit_price_inr: o.unit_price,
    discount_percent: o.discount_percent,
    total_revenue_inr: o.total_revenue,
    payment_method: o.payment_method,
    order_status: o.order_status,
    delivery_days: o.delivery_days,
    customer_rating: o.customer_rating,
  }));

  const csv = Papa.unparse(exportRows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
