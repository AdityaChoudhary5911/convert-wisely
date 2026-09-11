# RateDesk — Live Currency Converter & Travel Budgets

A production-grade currency dashboard built with [Lovable](https://lovable.dev). Convert currencies at live exchange rates, visualize 30-day trends, save favorite pairs, and plan travel budgets across five major currencies — all with calculations handled server-side.

**Live preview:** https://id-preview--8ea99228-c94a-438a-a25b-b5a20ded2d76.lovable.app

---

## What it does

- **Live currency conversion** — Pick a source and target currency, enter an amount, and see the converted value, exchange rate, inverse rate, and last-updated timestamp.
- **30-day trend chart** — Interactive Recharts line graph showing the last 30 days of daily exchange-rate movement for the active pair.
- **Favorites** — Star a currency pair to save it; click saved pairs to load them back into the converter.
- **Recent history** — Last conversions are stored and shown in the sidebar for quick re-use.
- **Travel budgeting mode** — Toggle travel mode to spread one base amount across USD, EUR, GBP, JPY, and INR with current rates and totals.
- **Real-time status indicator** — Header shows whether the rate feed is online and when rates were last refreshed.

## How it works

### Frontend (React + TanStack Start)

- The UI only captures input, calls backend server functions, and renders responses.
- React Query powers caching, loading states, and automatic refetches.
- Tailwind CSS + shadcn/ui components provide the dark fintech dashboard look.
- Lucide icons and Recharts charts complete the experience.

### Backend (Lovable Cloud / Supabase)

All business logic runs on the backend:

- **Conversion** — Validates input, fetches the latest rate from the Frankfurter API, computes the converted amount and inverse rate, logs the result to `conversion_history`, and returns the formatted response.
- **30-day history** — Fetches daily historical rates for the selected pair and returns chronological data points for the chart.
- **Favorites** — `listFavorites`, `addFavorite`, and `removeFavorite` manage saved pairs in the `favorites` table.
- **Travel budget** — Accepts a base currency and amount, then computes equivalent budgets in five major target currencies server-side.

### Database tables

- `favorites` — saved currency pairs (`id`, `source_currency`, `target_currency`, `created_at`)
- `conversion_history` — recent conversions (`id`, `source_currency`, `target_currency`, `source_amount`, `converted_amount`, `rate`, `created_at`)

---

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

The dev server starts at `http://localhost:8080`.

---

## Built with

- TanStack Start
- TypeScript
- React 19
- Tailwind CSS
- Lovable Cloud / Supabase
- Frankfurter API (live exchange rates)
- Recharts (charts)
- Lucide (icons)
