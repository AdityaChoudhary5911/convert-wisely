# Currency Companion

Build a production-grade, full-stack Currency Converter web app adhering strictly to these requirements:

1. Zero Client-Side Business Logic:
- All currency calculations, conversions, rate inversions, 5-currency travel budget calculations, and database operations must run on backend API edge functions (Lovable Cloud / Supabase backend).
- The React UI only captures input, triggers backend APIs, and renders server responses.

2. Backend & Data Architecture (Lovable Cloud / Supabase):
- Database tables:
  - `favorites` (id, source_currency, target_currency, created_at)
  - `conversion_history` (id, source_currency, target_currency, source_amount, converted_amount, rate, created_at)
- External Exchange Rate Integration (handled strictly server-side):
  - Integrate Frankfurter API or open ExchangeRate-API for live rates and past 30 days historical data.
- Backend edge functions / API endpoints:
  - POST `/api/convert` (or edge function `convert`): validates source, target, amount; fetches rate server-side; computes conversion; logs to `conversion_history`; returns converted value + rate + timestamp.
  - GET `/api/history/30-day`: accepts source & target; fetches past 30 days daily rates server-side; returns chronological data points for charts.
  - Favorites API: endpoints to list, add, and delete favorite currency pairs in the database.
  - POST `/api/travel-budget`: accepts base_currency and amount; computes equivalent amounts in 5 major target currencies (USD, EUR, GBP, JPY, CAD/INR) server-side; returns unit rates and calculated budgets.

3. Frontend UI & UX (Tailwind, Lucide icons, Recharts):
- Top Header: Clean fintech dashboard theme with real-time status indicator.
- Dual Converter Component:
  - Source and Target currency selectors with search and flag emojis/icons.
  - Numeric input field with debounced conversion or convert trigger.
  - Swap button flipping source and target.
  - Star favorite button to bookmark the current pair into the database.
  - Result card with formatted output, conversion formula (e.g., 1 USD = 0.92 EUR), and last updated time.
- 30-Day Historical Trend Visualizer:
  - Recharts line graph rendering the last 30 days of exchange rate movement for the active pair with interactive tooltips.
- Favorites & History Drawer / Sidebar:
  - Quick-access chips for saved pairs (clicking loads pair into converter).
  - Recent conversion history list with timestamps.
- Travel Budgeting Mode:
  - Toggle switch between Standard Converter and Travel Budgeting Mode.
  - Single base currency input computing 5 major currencies simultaneously via the backend endpoint, rendered in a responsive comparison table (Currency, Flag, Current Rate, Total Converted Budget).
- Polished loading skeletons during server requests, empty states, and toast notifications for errors/actions.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8ea99228-c94a-438a-a25b-b5a20ded2d76).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
