# Paytm Smart-Stock AI

> A full-stack virtual supply chain manager for small Indian shopkeepers — powered by AI demand forecasting, real-time inventory tracking, and instant Paytm financing.

---

## Overview

Paytm Smart-Stock AI helps kirana store owners manage inventory intelligently. It predicts demand based on weather and festival conditions, alerts when stock runs low, simulates WhatsApp reorder flows, and offers instant inventory loans — all in a single fintech-grade dashboard.

Built for the **Paytm Hackathon** as a business intelligence product for Bharat's small shopkeepers.

---

## Features

| Feature | Description |
|---|---|
| **Live Inventory Dashboard** | Real-time stock cards for Milk, Bread, Biscuits, Tea with progress bars and status badges |
| **AI Insight Banner** | Dynamic recommendation strip that updates based on selected weather/festival condition |
| **AI Demand Forecast Chart** | Line chart showing 5-day sales history + AI-predicted tomorrow demand per product |
| **Per-Product Demand Breakdown** | Predicted units, burn rate, confidence level, and weather multiplier per product |
| **Transaction Simulator (POS)** | Log a sale with product selector, quantity slider, and auto price calculation |
| **Smart Alert System** | Low-stock popup with Yes/No reorder flow using Framer Motion animations |
| **WhatsApp Reorder Simulation** | WhatsApp-style drafted message popup on reorder confirmation |
| **Instant Paytm Inventory Loan** | Financing popup when wallet balance is insufficient — adds funds instantly |
| **Sales Trend Chart** | Recharts bar/line chart showing daily transaction history |
| **Wallet & Financing Page** | Live balance, revenue stats, instant loan buttons (₹500 / ₹1K / ₹2K / ₹5K) |
| **Inventory Management Page** | Full editable table with restock-to-max and per-unit threshold control |
| **Alerts Feed** | Live alert log for low stock events, updating every 10 seconds |
| **Settings Page** | Shop profile, per-product reorder thresholds, and notification preferences |

---

## Tech Stack

### Frontend
- **React 19** + **Vite 7** — fast SPA with hot module replacement
- **Tailwind CSS v4** — utility-first styling with custom Paytm theme tokens
- **Recharts** — composable charts (area, line, bar, composed)
- **Framer Motion** — animated modals and alert transitions
- **TanStack Query (React Query)** — data fetching with 10s auto-refresh polling
- **Wouter** — lightweight client-side routing
- **Lucide React** — icon library
- **date-fns** — date formatting

### Backend
- **Express 5** — REST API server
- **Drizzle ORM** + **PostgreSQL** — type-safe database access
- **Zod v4** — input/output validation on all routes
- **Pino** — structured JSON logging

### Tooling
- **pnpm workspaces** — monorepo package management
- **Orval** — OpenAPI-to-TypeScript codegen (React Query hooks + Zod schemas)
- **esbuild** — fast API server bundling
- **TypeScript 5.9** — end-to-end type safety across all packages

---

## Project Structure

```
artifacts-monorepo/
├── artifacts/
│   ├── api-server/             # Express REST API
│   │   └── src/routes/         # inventory, transactions, predictions, wallet
│   └── paytm-smartstock/       # React + Vite frontend
│       └── src/
│           ├── components/
│           │   ├── dashboard/  # InventoryCard, AiDemandChart, AiInsightBanner,
│           │   │               # AiPredictions, TransactionSimulator, SalesChart,
│           │   │               # SmartAlertModal
│           │   └── layout/     # Sidebar, Header
│           ├── pages/          # Dashboard, Inventory, Predictions, Wallet, Alerts, Settings
│           ├── hooks/          # useSmartAlert
│           └── lib/            # utils, formatCurrency
├── lib/
│   ├── api-spec/               # OpenAPI 3.1 spec + Orval codegen config
│   ├── api-client-react/       # Generated React Query hooks
│   ├── api-zod/                # Generated Zod schemas
│   └── db/                     # Drizzle schema + DB connection
└── scripts/                    # Utility scripts
```

---

## Database Schema

| Table | Columns |
|---|---|
| `products` | `id` (text PK), `name`, `currentStock`, `reorderThreshold`, `maxStock`, `price`, `unit` |
| `transactions` | `id`, `productId`, `productName`, `quantity`, `price`, `total`, `timestamp` |
| `wallet` | `id`, `balance` |

**Seed data:** 4 products (Milk, Bread, Biscuits, Tea) + ₹5,000 wallet balance.

---

## API Routes

All routes are served under `/api`.

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/inventory` | All 4 products with computed status (safe / low / critical) |
| `PATCH` | `/api/inventory/:productId` | Update stock level for a product |
| `GET` | `/api/transactions` | Recent 50 transactions |
| `POST` | `/api/transactions` | Log a sale; returns low-stock alert if triggered |
| `GET` | `/api/predictions?dayType=normal\|rainy\|festival` | AI demand predictions with weather multipliers |
| `GET` | `/api/wallet` | Current wallet balance |
| `POST` | `/api/wallet/loan` | Approve inventory loan — adds amount to balance |

---

## AI Demand Model

Predictions are calculated server-side using:

```
predictedDemand = burnRate × weatherMultiplier
```

**Burn rate** = average units sold per transaction (computed from transaction history).

**Weather multipliers:**

| Condition | Milk | Bread | Biscuits | Tea |
|---|---|---|---|---|
| Normal | ×1.0 | ×1.0 | ×1.0 | ×1.0 |
| Rainy | ×1.4 | ×1.1 | ×1.1 | ×1.5 |
| Festival | ×1.2 | ×1.6 | ×1.7 | ×1.2 |

---

## Running Locally

### Prerequisites
- Node.js 24+
- pnpm 9+
- PostgreSQL database (set `DATABASE_URL` env var)

### Setup

```bash
# Install all dependencies
pnpm install

# Run database migrations and seed
pnpm --filter @workspace/db run migrate
pnpm --filter @workspace/db run seed

# Start the API server
pnpm --filter @workspace/api-server run dev

# Start the frontend (in a separate terminal)
pnpm --filter @workspace/paytm-smartstock run dev
```

### Codegen (after OpenAPI spec changes)

```bash
pnpm --filter @workspace/api-spec run codegen
pnpm run typecheck:libs
```

### Typecheck

```bash
pnpm run typecheck
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Secret key for session signing |
| `PORT` | Port for the API server (default: 8080) |

---

## Screenshots

### Dashboard — Live Inventory + AI Insight Banner
The main dashboard shows real-time stock for all 4 products. The AI Insight Banner at the top dynamically changes text based on the selected weather/festival condition (Normal / Rainy / Festival).

### AI Demand Forecast Chart
A Recharts ComposedChart showing 5 days of historical sales (solid blue area) plus tomorrow's AI-predicted demand (dotted purple line) per product. Switching tabs (Milk / Bread / Biscuits / Tea) updates the chart instantly.

### Smart Alert Modal
When a sale drops stock below the reorder threshold, a Framer Motion animated modal appears offering to reorder. Confirming opens a WhatsApp-style drafted message popup. If the wallet balance is insufficient, a Paytm Inventory Loan popup is shown instead.

---

## Design System

The UI follows **Paytm's fintech branding**:

- **Primary gradient:** `#002970` → `#0057b8` → `#00baf2` (deep navy to electric blue)
- **Font:** Plus Jakarta Sans (headings) + Inter (body)
- **Active elements:** Blue gradient with soft drop shadow
- **AI sections:** Subtle blue border glow + tinted background (`ai-forecast-card`)
- **Status colors:** Emerald (Healthy) · Amber (Low Stock) · Rose (Critical)

---

## Hackathon Context

This project demonstrates how **Paytm's fintech ecosystem** (wallet, instant loans, payments) can be combined with **AI-driven inventory intelligence** to help India's 60 million+ small retailers manage their businesses smarter — without needing accounting software or technical expertise.

**Demo flow:**
1. View live inventory → spot low stock alerts
2. Read the AI insight banner → understand today's demand drivers
3. Check the forecast chart → see which products need restocking
4. Log a sale via POS simulator → watch stock update in real time
5. Trigger a low-stock alert → reorder via simulated WhatsApp
6. Apply for an instant Paytm Inventory Loan → funds added to wallet instantly
