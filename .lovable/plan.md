# Currency Converter — Build Plan

A fintech-style currency dashboard where every calculation happens on the server. The screen only collects input and shows what the server sends back.

## What you'll get

**Header** — app title, live status dot showing whether rates are reachable, and a toggle between Standard Converter and Travel Budget mode.

**Converter**
- Searchable source and target currency pickers with flag emojis
- Amount field that converts automatically a moment after you stop typing
- Swap button to flip the pair
- Star button to save the pair
- Result card: converted amount, the rate line (`1 USD = 0.92 EUR`), and last-updated time

**30-day trend chart** — line chart of the active pair's daily rate for the past 30 days, with hover tooltips.

**Favorites & history panel** — saved pairs as clickable chips that load into the converter, plus a recent-conversions list with timestamps.

**Travel budget mode** — enter one amount in a base currency, get a table of USD, EUR, GBP, JPY, INR with flag, current rate, and converted total.

Loading skeletons, empty states, and toast messages for errors and saved/removed actions throughout.

## Data saved

- Saved currency pairs
- Conversion history (amounts, rate, timestamp)

Both live in Lovable Cloud, which I'll turn on as the first step.

## Technical section

Backend: Lovable Cloud (Supabase) + TanStack server functions in `src/lib/*.functions.ts`. Rates come from the Frankfurter API, fetched only inside handlers — never from the browser.

Migration:
- `favorites(id uuid pk, source_currency text, target_currency text, created_at timestamptz, unique(source_currency,target_currency))`
- `conversion_history(id uuid pk, source_currency, target_currency, source_amount numeric, converted_amount numeric, rate numeric, created_at timestamptz)`
- Grants for `anon`, `authenticated`, `service_role`; RLS enabled with permissive public policies (no auth in this app).

Server functions (`src/lib/currency.functions.ts`, `favorites.functions.ts`):
- `convert` — Zod-validated `{ source, target, amount }`; fetches `latest?from=&to=`; computes `amount * rate`; inserts into `conversion_history`; returns `{ converted, rate, timestamp }`
- `getThirtyDayHistory` — `time_series?start_date=...`; returns chronological `{ date, rate }[]`
- `getTravelBudget` — one `latest` call for USD/EUR/GBP/JPY/INR; returns per-currency `{ rate, total }`
- `listFavorites` / `addFavorite` / `removeFavorite`
- `listHistory` — recent 20 rows
- `getRatesStatus` — health probe for the header indicator
- `listCurrencies` — currency codes + names from Frankfurter, mapped to flag emojis client-side from a static table

Frontend: single route `src/routes/index.tsx` (replacing the placeholder) with its own head metadata; components under `src/components/currency/`. Reads use TanStack Query (`useQuery` + `useServerFn`), mutations invalidate favorites/history. Recharts for the chart, `sonner` toast mounted in `__root.tsx`, shadcn skeleton/table/switch/command primitives added as needed. Design tokens: dark slate fintech palette with a teal accent, defined in `src/styles.css` — no hardcoded colors in components.
