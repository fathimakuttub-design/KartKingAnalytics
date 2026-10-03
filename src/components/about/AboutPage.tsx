import React from 'react';
import {
  BookOpen,
  Code,
  Database,
  BarChart3,
  Layers,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* 1. Project Introduction */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5 mb-2">
          <BookOpen className="h-5 w-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            About KartKing Analytics Suite
          </h2>
        </div>
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          KartKing Analytics is a production-grade data analyst portfolio project designed to model, explore, and diagnose commercial transactions for an Indian e-commerce marketplace. The system showcases end-to-end data engineering in the browser, statistical modeling, RFM customer segmentation, operational unit economics, and Gemini AI-powered reasoning.
        </p>
      </div>

      {/* 2. Metrics Definitions */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Core Business Metric Definitions
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-850">
            <span className="font-bold text-slate-900 dark:text-white">
              Average Order Value (AOV)
            </span>
            <p className="mt-1 font-mono text-[11px] text-amber-700 dark:text-amber-300">
              AOV = Total Net Revenue / (Delivered + Returned Orders)
            </p>
            <p className="mt-2 text-slate-500">
              Measures the average rupee value generated per successful transaction after catalog discounts, excluding cancelled checkouts.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-850">
            <span className="font-bold text-slate-900 dark:text-white">
              Return Rate % (Reverse Logistics)
            </span>
            <p className="mt-1 font-mono text-[11px] text-amber-700 dark:text-amber-300">
              Return Rate = [Returned Orders / (Delivered + Returned Orders)] × 100
            </p>
            <p className="mt-2 text-slate-500">
              Represents reverse logistics volume. In the Indian market, Fashion typically bears a high return rate (~20-25%) due to trial/fit sizing, while Books and Grocery remain below 4%.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-850 md:col-span-2">
            <span className="font-bold text-slate-900 dark:text-white">
              RFM Customer Segmentation Methodology
            </span>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Computes behavioral scores on a 1–5 scale based on three fundamental pillars:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-slate-500">
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Recency (R):</strong> Days since the customer's most recent order. Recent buyers (≤30 days) receive higher scores.
              </li>
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Frequency (F):</strong> Total orders placed over the customer's lifetime with the marketplace.
              </li>
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Monetary (M):</strong> Cumulative gross spending in INR.
              </li>
            </ul>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <div>
                <span className="font-semibold text-emerald-600">Champions:</span>
                <p className="text-[11px] text-slate-500">High R, high F, high M. VIP patrons driving disproportionate revenue.</p>
              </div>
              <div>
                <span className="font-semibold text-blue-600">Loyal:</span>
                <p className="text-[11px] text-slate-500">Frequent repeat buyers with consistent order velocity.</p>
              </div>
              <div>
                <span className="font-semibold text-amber-600">At Risk:</span>
                <p className="text-[11px] text-slate-500">High previous spenders who have not ordered in &gt;180 days.</p>
              </div>
              <div>
                <span className="font-semibold text-rose-600">Lost:</span>
                <p className="text-[11px] text-slate-500">Dormant single-order shoppers with very low lifetime engagement.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Dataset Characteristics */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Synthetic Dataset & Indian Market Modeling
          </h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          The embedded dataset contains 3,000 realistic orders spanning January 1, 2024 through December 31, 2025. It reflects real Indian retail trends:
        </p>
        <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
          <li>
            <strong>Festive Spikes:</strong> Sharp 2.5x volume surges in October–November coinciding with Diwali, Dussehra, and Dhanteras sales; a smaller spike during the January Republic Day sales.
          </li>
          <li>
            <strong>Metro Dominance:</strong> High order concentrations from Bengaluru, Mumbai, Delhi-NCR, Hyderabad, Chennai, and Pune (~65% volume).
          </li>
          <li>
            <strong>Payment Modes:</strong> UPI accounts for over 55% of all orders, followed by Credit/Debit cards and Cash on Delivery (COD). High-value electronic shipments rarely use COD.
          </li>
          <li>
            <strong>Deliberate Outliers:</strong> B2B bulk festive gift orders (quantity 8+) and occasional logistic delays (&gt;14 days) during severe weather or holiday warehouse bottlenecks.
          </li>
        </ul>
      </div>

      {/* 4. Tech Stack */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Technology Stack
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-850">
            <p className="font-semibold text-slate-900 dark:text-white">React 19 & TS</p>
            <p className="text-slate-500 text-[11px] mt-0.5">Functional components, custom hooks, and useMemo caching</p>
          </div>
          <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-850">
            <p className="font-semibold text-slate-900 dark:text-white">Recharts</p>
            <p className="text-slate-500 text-[11px] mt-0.5">Interactive line, bar, pie, and composed analytical charts</p>
          </div>
          <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-850">
            <p className="font-semibold text-slate-900 dark:text-white">PapaParse</p>
            <p className="text-slate-500 text-[11px] mt-0.5">Client-side streaming CSV parser with schema validation</p>
          </div>
          <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-850">
            <p className="font-semibold text-slate-900 dark:text-white">Gemini 3.8 Flash</p>
            <p className="text-slate-500 text-[11px] mt-0.5">Server-side LLM via @google/genai for grounded insights</p>
          </div>
        </div>
      </div>
    </div>
  );
};
