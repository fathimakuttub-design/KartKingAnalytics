import { Order, Region, Category, PaymentMethod, OrderStatus } from '../types';

/**
 * Deterministic pseudo-random number generator (Mulberry32)
 * Ensures reproducible, rich dataset across reloads.
 */
function createPrng(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface CityInfo {
  city: string;
  state: string;
  region: Region;
  weight: number;
}

const INDIAN_CITIES: CityInfo[] = [
  // Metros (High weight)
  { city: 'Bengaluru', state: 'Karnataka', region: 'South', weight: 19 },
  { city: 'Mumbai', state: 'Maharashtra', region: 'West', weight: 18 },
  { city: 'Delhi', state: 'Delhi', region: 'North', weight: 17 },
  { city: 'Hyderabad', state: 'Telangana', region: 'South', weight: 12 },
  { city: 'Chennai', state: 'Tamil Nadu', region: 'South', weight: 10 },
  { city: 'Pune', state: 'Maharashtra', region: 'West', weight: 9 },
  // Tier 1 & Tier 2 Cities
  { city: 'Kolkata', state: 'West Bengal', region: 'East', weight: 7 },
  { city: 'Ahmedabad', state: 'Gujarat', region: 'West', weight: 6 },
  { city: 'Jaipur', state: 'Rajasthan', region: 'North', weight: 5 },
  { city: 'Gurugram', state: 'Haryana', region: 'North', weight: 5 },
  { city: 'Noida', state: 'Uttar Pradesh', region: 'North', weight: 4 },
  { city: 'Chandigarh', state: 'Punjab', region: 'North', weight: 3 },
  { city: 'Kochi', state: 'Kerala', region: 'South', weight: 3 },
  { city: 'Lucknow', state: 'Uttar Pradesh', region: 'North', weight: 3 },
  { city: 'Indore', state: 'Madhya Pradesh', region: 'West', weight: 2 },
  { city: 'Bhubaneswar', state: 'Odisha', region: 'East', weight: 2 },
  { city: 'Patna', state: 'Bihar', region: 'East', weight: 2 },
  { city: 'Guwahati', state: 'Assam', region: 'East', weight: 1 },
];

const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Advait', 'Ananya', 'Aryan', 'Diya', 'Ishaan', 'Kavya',
  'Rohan', 'Pooja', 'Rahul', 'Neha', 'Vikram', 'Priya', 'Kunal', 'Sneha',
  'Arjun', 'Meera', 'Dev', 'Shreya', 'Siddharth', 'Tanvi', 'Varun', 'Rhea',
  'Gautam', 'Anika', 'Manish', 'Divya', 'Suresh', 'Deepika', 'Karthik', 'Swati',
  'Nikhil', 'Sunita', 'Amit', 'Preeti', 'Rajesh', 'Shruti', 'Alok', 'Rashmi'
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Iyer', 'Verma', 'Singh', 'Reddy', 'Nair', 'Chatterjee',
  'Gupta', 'Deshmukh', 'Mehta', 'Bose', 'Kumar', 'Choudhury', 'Joshi', 'Menon',
  'Rao', 'Agarwal', 'Pillai', 'Malhotra', 'Bhat', 'Saxena', 'Mukherjee', 'Shetty'
];

interface ProductSpec {
  name: string;
  category: Category;
  minPrice: number;
  maxPrice: number;
  returnRisk: number; // 0 - 1
}

const PRODUCT_CATALOG: ProductSpec[] = [
  // Electronics
  { name: 'boAt Rockerz Bluetooth Headphones', category: 'Electronics', minPrice: 1299, maxPrice: 1999, returnRisk: 0.08 },
  { name: 'OnePlus Nord CE 5G Smartphone', category: 'Electronics', minPrice: 18999, maxPrice: 24999, returnRisk: 0.06 },
  { name: 'Noise ColorFit Pulse Smartwatch', category: 'Electronics', minPrice: 1499, maxPrice: 2999, returnRisk: 0.10 },
  { name: 'Mi 10000mAh Fast Power Bank', category: 'Electronics', minPrice: 999, maxPrice: 1499, returnRisk: 0.04 },
  { name: 'Sony Bravia 43" 4K Smart TV', category: 'Electronics', minPrice: 38990, maxPrice: 46990, returnRisk: 0.05 },
  { name: 'Apple iPad 10th Gen 64GB', category: 'Electronics', minPrice: 32900, maxPrice: 37900, returnRisk: 0.03 },

  // Fashion
  { name: 'FabIndia Pure Cotton Kurta', category: 'Fashion', minPrice: 1499, maxPrice: 3499, returnRisk: 0.24 },
  { name: 'Levis 511 Slim Fit Denim', category: 'Fashion', minPrice: 2199, maxPrice: 3999, returnRisk: 0.22 },
  { name: 'Biba Embroidered Anarkali Suit', category: 'Fashion', minPrice: 2899, maxPrice: 6599, returnRisk: 0.25 },
  { name: 'Puma Men Running Shoes', category: 'Fashion', minPrice: 1999, maxPrice: 4499, returnRisk: 0.18 },
  { name: 'W for Woman Printed Straight Kurti', category: 'Fashion', minPrice: 899, maxPrice: 1899, returnRisk: 0.20 },
  { name: 'Allen Solly Oxford Formal Shirt', category: 'Fashion', minPrice: 1299, maxPrice: 2499, returnRisk: 0.16 },

  // Home & Kitchen
  { name: 'Prestige Iris 750W Mixer Grinder', category: 'Home & Kitchen', minPrice: 2799, maxPrice: 3899, returnRisk: 0.09 },
  { name: 'Hawkins 5L Hard Anodised Pressure Cooker', category: 'Home & Kitchen', minPrice: 1899, maxPrice: 2799, returnRisk: 0.06 },
  { name: 'Milton Thermosteel Flip Lid Flask 1L', category: 'Home & Kitchen', minPrice: 899, maxPrice: 1299, returnRisk: 0.04 },
  { name: 'Wakefit Orthopedic Memory Foam Mattress', category: 'Home & Kitchen', minPrice: 7999, maxPrice: 14999, returnRisk: 0.07 },
  { name: 'Philips 1400W Dry Iron', category: 'Home & Kitchen', minPrice: 799, maxPrice: 1199, returnRisk: 0.05 },

  // Beauty
  { name: 'Mamaearth Onion Hair Oil 250ml', category: 'Beauty', minPrice: 399, maxPrice: 599, returnRisk: 0.05 },
  { name: 'Forest Essentials Facial Tonic Mist', category: 'Beauty', minPrice: 1250, maxPrice: 2450, returnRisk: 0.04 },
  { name: 'Maybelline New York Matte Lipstick', category: 'Beauty', minPrice: 299, maxPrice: 699, returnRisk: 0.08 },
  { name: 'The Derma Co 10% Niacinamide Serum', category: 'Beauty', minPrice: 499, maxPrice: 649, returnRisk: 0.06 },
  { name: 'Biotique Bio Kelp Protein Shampoo', category: 'Beauty', minPrice: 210, maxPrice: 380, returnRisk: 0.03 },

  // Books
  { name: 'The Psychology of Money - Morgan Housel', category: 'Books', minPrice: 280, maxPrice: 399, returnRisk: 0.03 },
  { name: 'Atomic Habits - James Clear', category: 'Books', minPrice: 450, maxPrice: 650, returnRisk: 0.02 },
  { name: 'Ikigai: Japanese Secret to Long Life', category: 'Books', minPrice: 299, maxPrice: 499, returnRisk: 0.02 },
  { name: 'India That Is Bharat - J Sai Deepak', category: 'Books', minPrice: 520, maxPrice: 750, returnRisk: 0.03 },

  // Grocery
  { name: 'Tata Tea Gold Leaf Pouch 1kg', category: 'Grocery', minPrice: 450, maxPrice: 620, returnRisk: 0.02 },
  { name: 'Fortune Sunlite Refined Sunflower Oil 5L', category: 'Grocery', minPrice: 680, maxPrice: 890, returnRisk: 0.03 },
  { name: 'Aashirvaad Shudh Chakki Atta 10kg', category: 'Grocery', minPrice: 410, maxPrice: 520, returnRisk: 0.02 },
  { name: 'Happilo California Premium Almonds 500g', category: 'Grocery', minPrice: 420, maxPrice: 650, returnRisk: 0.04 },
  { name: 'Dabur Honey 100% Pure 1kg', category: 'Grocery', minPrice: 375, maxPrice: 499, returnRisk: 0.02 },
];

/**
 * Generate 3,000 realistic orders spanning Jan 1, 2024 to Dec 31, 2025.
 */
export function generateSyntheticOrders(targetCount: number = 3000): Order[] {
  const rand = createPrng(428190);
  const orders: Order[] = [];

  // Generate ~720 realistic customers
  const customerCount = 720;
  const customers = Array.from({ length: customerCount }, (_, idx) => {
    const fn = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    // Assign preferred city
    let cityTotalWeight = INDIAN_CITIES.reduce((sum, c) => sum + c.weight, 0);
    let r = rand() * cityTotalWeight;
    let chosenCity = INDIAN_CITIES[0];
    for (const city of INDIAN_CITIES) {
      if (r < city.weight) {
        chosenCity = city;
        break;
      }
      r -= city.weight;
    }
    return {
      id: `CUST-${1000 + idx}`,
      name: `${fn} ${ln}`,
      city: chosenCity.city,
      state: chosenCity.state,
      region: chosenCity.region,
      // Affinity for repeat purchase (frequency bias)
      repeatPropensity: rand(), // 0 to 1
    };
  });

  const startDate = new Date('2024-01-01T00:00:00Z');
  const endDate = new Date('2025-12-31T23:59:59Z');
  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  for (let i = 1; i <= targetCount; i++) {
    // 1. Pick a date with seasonality weight
    // Festival spikes in Oct & Nov (months 9 & 10 in 0-indexed), Jan (month 0)
    let selectedDate: Date;
    while (true) {
      const dayOffset = Math.floor(rand() * totalDays);
      const candDate = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      const month = candDate.getMonth(); // 0 = Jan, 9 = Oct, 10 = Nov

      let seasonalWeight = 1.0;
      if (month === 9 || month === 10) {
        seasonalWeight = 2.7; // Major Diwali / Dussehra festive season
      } else if (month === 0) {
        seasonalWeight = 1.4; // Republic Day & New Year sale
      } else if (month === 7) {
        seasonalWeight = 1.25; // Independence Day / Rakhi sale
      } else if (month === 5 || month === 6) {
        seasonalWeight = 0.8; // Monsoon slowdown
      }

      if (rand() * 3.0 < seasonalWeight) {
        selectedDate = candDate;
        break;
      }
    }

    // 2. Select customer: weighted so repeat customers appear more
    let custIndex: number;
    if (rand() < 0.65) {
      // Pick among top 40% repeat buyers
      custIndex = Math.floor(rand() * (customerCount * 0.4));
    } else {
      custIndex = Math.floor(rand() * customerCount);
    }
    const customer = customers[custIndex];

    // 3. Select product & category
    const product = PRODUCT_CATALOG[Math.floor(rand() * PRODUCT_CATALOG.length)];

    // 4. Quantity and Pricing
    let quantity = 1;
    const qRoll = rand();
    if (product.category === 'Grocery') {
      quantity = qRoll < 0.5 ? 1 : qRoll < 0.85 ? 2 : 3;
    } else if (product.category === 'Books') {
      quantity = qRoll < 0.8 ? 1 : 2;
    } else if (qRoll < 0.75) {
      quantity = 1;
    } else if (qRoll < 0.94) {
      quantity = 2;
    } else {
      quantity = 3;
    }

    // Outlier: deliberate corporate gifting outlier
    let isCorporateOutlier = false;
    if (i === 412 || i === 1845 || i === 2680) {
      isCorporateOutlier = true;
      quantity = 8;
    }

    const priceSpan = product.maxPrice - product.minPrice;
    const baseUnitPrice = Math.round(product.minPrice + rand() * priceSpan);

    // Discounts: festive periods get higher discounts
    const isFestive = selectedDate.getMonth() === 9 || selectedDate.getMonth() === 10;
    let discount = 0;
    const discRoll = rand();
    if (isFestive) {
      discount = discRoll < 0.2 ? 10 : discRoll < 0.6 ? 20 : discRoll < 0.9 ? 30 : 40;
    } else {
      discount = discRoll < 0.45 ? 0 : discRoll < 0.75 ? 10 : discRoll < 0.93 ? 15 : 25;
    }

    const discountedUnit = baseUnitPrice * (1 - discount / 100);
    const totalRev = Math.round(discountedUnit * quantity);

    // 5. Payment method: UPI dominant in India
    let paymentMethod: PaymentMethod;
    const payRoll = rand();
    if (payRoll < 0.56) {
      paymentMethod = 'UPI';
    } else if (payRoll < 0.76) {
      paymentMethod = 'Credit Card';
    } else if (payRoll < 0.86) {
      paymentMethod = 'Debit Card';
    } else if (payRoll < 0.94) {
      paymentMethod = 'COD';
    } else {
      paymentMethod = 'Net Banking';
    }

    // High value items (> ₹20,000) are rarely COD
    if (totalRev > 15000 && paymentMethod === 'COD') {
      paymentMethod = rand() < 0.7 ? 'Credit Card' : 'UPI';
    }

    // 6. Delivery days: Metros are faster (2-4 days), East/remote slower (4-8 days)
    let baseDelivery = customer.region === 'East' ? 5 : customer.region === 'North' ? 4 : 3;
    if (['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad'].includes(customer.city)) {
      baseDelivery = 2;
    }
    // Monsoon or festive rush delay
    if (selectedDate.getMonth() === 9 || selectedDate.getMonth() === 10) {
      baseDelivery += 1;
    }
    const noise = Math.floor(rand() * 4);
    let deliveryDays = Math.max(1, baseDelivery + noise);

    // Deliberate extreme delivery outlier
    if (i === 128 || i === 943 || i === 2205) {
      deliveryDays = 13 + Math.floor(rand() * 4); // 13-16 days
    }

    // 7. Order status: Delivered (~84%), Returned (~11%), Cancelled (~5%)
    let orderStatus: OrderStatus = 'Delivered';
    const returnChance = product.returnRisk * (paymentMethod === 'COD' ? 1.5 : 1.0);
    const cancelChance = 0.045;

    const statusRoll = rand();
    if (statusRoll < cancelChance) {
      orderStatus = 'Cancelled';
    } else if (statusRoll < cancelChance + returnChance) {
      orderStatus = 'Returned';
    } else {
      orderStatus = 'Delivered';
    }

    // 8. Customer Rating (1 to 5)
    // Correlates with delivery days, cancellations, returns, and product satisfaction
    let rating = 5;
    if (orderStatus === 'Cancelled') {
      rating = rand() < 0.7 ? 1 : 2;
    } else if (orderStatus === 'Returned') {
      rating = rand() < 0.5 ? 2 : rand() < 0.8 ? 1 : 3;
    } else if (deliveryDays > 8) {
      // Severe delay
      rating = rand() < 0.6 ? 1 : rand() < 0.9 ? 2 : 3;
    } else if (deliveryDays >= 5) {
      rating = rand() < 0.3 ? 3 : rand() < 0.7 ? 4 : 5;
    } else {
      // Fast delivery
      const happyRoll = rand();
      rating = happyRoll < 0.05 ? 3 : happyRoll < 0.35 ? 4 : 5;
    }

    const orderId = `KK-${selectedDate.getFullYear()}-${10000 + i}`;
    const dateStr = selectedDate.toISOString().split('T')[0];

    orders.push({
      order_id: orderId,
      order_date: dateStr,
      customer_id: customer.id,
      customer_name: customer.name,
      city: customer.city,
      state: customer.state,
      region: customer.region,
      category: product.category,
      product_name: product.name,
      quantity,
      unit_price: baseUnitPrice,
      discount_percent: discount,
      payment_method: paymentMethod,
      order_status: orderStatus,
      delivery_days: orderStatus === 'Cancelled' ? 0 : deliveryDays,
      customer_rating: rating,
      total_revenue: orderStatus === 'Cancelled' ? 0 : totalRev,
    });
  }

  // Sort orders chronologically
  orders.sort((a, b) => a.order_date.localeCompare(b.order_date));
  return orders;
}
