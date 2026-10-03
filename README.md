# E-Commerce Analytics & RFM Intelligence Platform

[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gen%20AI-3.8%20Flash-4285F4.svg?logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)

A high-performance, full-stack E-Commerce Analytics and Business Intelligence (BI) suite tailored for modern retail marketplaces. Features live KPI tracking, RFM customer segmentation, fulfillment SLA monitoring, custom CSV ingestion, and server-side **Google Gemini 3.8 Flash** executive insights.

---

## 🚀 Key Features

### 1. Executive Performance Dashboard
- **Core Marketplace KPIs**: Gross Revenue (INR ₹ Lakhs & Crores), Total Order Volume, Average Order Value (AOV), Return Rate, Customer Satisfaction Rating (CSAT), and Repeat Purchase Rate.
- **Interactive Trajectory**: Multi-scale timeline with **Daily**, **Weekly**, and **Monthly** time aggregation.
- **Category & Regional Share**: Revenue share donut charts and regional delivery heatmaps.
- **Top 10 Products Ledger**: Column-sorted performance table with live revenue and return metrics.

### 2. RFM Customer Segmentation & Loyalty Hub
- **Recency, Frequency, Monetary (RFM) Scoring**: Automated clustering into **Champions**, **Loyal Customers**, **At Risk**, and **Lost Shoppers**.
- **Customer Retention Curve**: Tracking cohort retention drop-offs over time.
- **Top Cities by Revenue**: Metro vs. Tier 1/2 performance rankings.

### 3. Operations & Logistics Intelligence
- **Order Status Distribution**: Delivered, Returned, and Cancelled volumes.
- **Reverse Logistics Analysis**: Category-level return risk modeling (identifying return spikes in sizing-sensitive apparel vs. electronics).
- **Delivery SLAs vs. CSAT**: Correlating fulfillment duration (days) with customer ratings.
- **Payment Method Share**: Tracking UPI dominance (~56%), credit cards, debit cards, net banking, and Cash on Delivery (COD).

### 4. AI Strategic Insights (Gemini 3.8 Flash)
- **Automated Executive Briefing**: Generates 5 prioritized business observations and 3 strategic recommendations grounded in current filter selections.
- **Interactive Analyst Q&A**: Real-time conversational queries against your live aggregated data.

### 5. Multi-User Authentication & Security
- **Email & Password Authentication**: Protected routes with session persistence and 30-second brute-force rate-limiting.
- **Customizable Workspace Branding**: Change your company name and platform title anytime with real-time UI synchronization.
- **Instant Demo Mode**: One-click preview for recruiters and reviewers.

### 6. Data Ingestion & Portability
- **Custom CSV Upload**: Ingest your own store datasets via drag-and-drop (`PapaParse` with auto-column aliasing).
- **Sample Template**: Downloadable starter CSV schema.
- **One-Click Reset**: Instant rollback to the 3,000-record synthetic benchmark.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts
- **Backend / API**: Node.js, Express, tsx
- **AI Intelligence**: `@google/genai` (Gemini 3.8 Flash)
- **Data Engine**: PapaParse, deterministic Mulberry32 PRNG
- **Build Tool**: Vite

---

## 🏁 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) or `pnpm`
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey) (free)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/<your-repo-name>.git
   cd <your-repo-name>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and add your Gemini API key:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## 📦 Project Structure

```text
├── api/                  # Express server entry point & proxy routes
├── src/
│   ├── components/       # Modular UI components
│   │   ├── ai/           # Gemini AI Insights & Q&A components
│   │   ├── auth/         # Login, Signup, ProtectedRoute components
│   │   ├── common/       # Header, Sidebar, FilterBar, Modals, Cards
│   │   ├── customers/    # RFM loyalty & retention analytics
│   │   ├── explorer/     # Searchable data table with CSV export
│   │   ├── operations/   # Fulfillment, delivery SLAs, payment mix
│   │   ├── overview/     # Executive KPIs & time-series trajectory
│   │   └── upload/       # CSV drag-and-drop modal & schema validator
│   ├── context/          # React Context (AuthContext & Workspace Settings)
│   ├── data/             # Synthetic data generator (Mulberry32 PRNG)
│   ├── services/         # Firebase integration & auth services
│   ├── types/            # TypeScript interfaces & domain models
│   ├── utils/            # Analytics math, RFM scoring, CSV parser
│   ├── App.tsx           # App root & routing layout
│   └── main.tsx          # React DOM entry point
├── server.ts             # Express + Vite dev server & Gemini API endpoints
├── index.html            # HTML entry point
├── package.json          # Dependencies & scripts
└── tsconfig.json         # TypeScript configuration
```

---

## 🚀 How to Upload to GitHub

If you want to push this project to your GitHub account:

### Step 1: Create a New Repository on GitHub
1. Log into your GitHub account at [github.com](https://github.com).
2. Click the **`+`** icon in the top right and select **New repository**.
3. Name your repository (e.g., `ecommerce-analytics-bi`).
4. Keep it **Public** (or **Private**) and leave "Initialize with README" **unchecked** (we already have one).
5. Click **Create repository**.

### Step 2: Push Your Local Code to GitHub
Run the following commands in your project terminal:

```bash
# 1. Initialize git
git init

# 2. Stage all project files
git add .

# 3. Create your first commit
git commit -m "feat: Initial commit of E-Commerce Analytics Platform"

# 4. Set main branch
git branch -M main

# 5. Link your remote GitHub repository (replace with your actual URL)
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 6. Push code to GitHub
git push -u origin main
```

---

## 📄 License
This project is licensed under the Apache 2.0 License.
