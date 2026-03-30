# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + Recharts + Framer Motion

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── paytm-smartstock/  # Paytm Smart-Stock AI frontend (React/Vite)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Paytm Smart-Stock AI

Full-stack virtual supply chain manager for small shopkeepers. Features:

- **Live Inventory Dashboard**: Cards for Milk, Bread, Biscuits, Tea with stock levels, progress bars, and status badges
- **Transaction Simulation**: POS simulator with product selector, quantity, price auto-fill, and sale logging
- **AI Demand Predictions**: Burn rate + weather/festival multiplier forecasting
- **Weather/Festival Toggles**: Normal / Rainy / Festival day types affecting predictions
- **Smart Alert System**: Low-stock popups with Yes/No reorder flow using Framer Motion animations
- **WhatsApp Reorder Simulation**: WhatsApp-style drafted message popup on reorder confirmation
- **Financing Simulation**: Instant Paytm Inventory Loan popup when wallet balance is insufficient
- **Sales Trend Chart**: Recharts bar/line chart showing daily transaction history

### Database Schema

- `products` — 4 products (milk, bread, biscuits, tea) with stock, threshold, max, price, unit
- `transactions` — Sale log with productId, quantity, price, total, timestamp
- `wallet` — Single wallet row with INR balance

### API Routes (`/api`)

- `GET /inventory` — All 4 products with computed status
- `PATCH /inventory/:productId` — Update stock
- `GET /transactions` — Recent 50 transactions
- `POST /transactions` — Log a sale, returns alert if stock is low
- `GET /predictions?dayType=normal|rainy|festival` — AI demand predictions
- `GET /wallet` — Wallet balance
- `POST /wallet/loan` — Approve inventory loan (adds to balance)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
