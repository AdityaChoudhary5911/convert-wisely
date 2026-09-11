import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Coins } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Converter } from "@/components/currency/Converter";
import { TrendChart } from "@/components/currency/TrendChart";
import { SidePanel } from "@/components/currency/SidePanel";
import { TravelBudget } from "@/components/currency/TravelBudget";
import { getRatesStatus, listCurrencies } from "@/lib/currency.functions";
import { listFavorites } from "@/lib/favorites.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RateDesk — Live Currency Converter & Travel Budgets" },
      {
        name: "description",
        content:
          "Convert currencies at live rates, chart 30-day trends, save favorite pairs, and plan travel budgets across five major currencies.",
      },
      { property: "og:title", content: "RateDesk — Live Currency Converter & Travel Budgets" },
      {
        property: "og:description",
        content:
          "Live exchange rates, 30-day trend charts, saved currency pairs, and instant multi-currency travel budgets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const currenciesFn = useServerFn(listCurrencies);
  const statusFn = useServerFn(getRatesStatus);
  const favoritesFn = useServerFn(listFavorites);

  const [travelMode, setTravelMode] = useState(false);
  const [source, setSource] = useState("USD");
  const [target, setTarget] = useState("EUR");
  const [amount, setAmount] = useState("100");

  const currencies = useQuery({
    queryKey: ["currencies"],
    queryFn: () => currenciesFn(),
    staleTime: 60 * 60 * 1000,
  });

  const status = useQuery({
    queryKey: ["rates-status"],
    queryFn: () => statusFn(),
    refetchInterval: 60_000,
  });

  const favorites = useQuery({ queryKey: ["favorites"], queryFn: () => favoritesFn() });

  const online = status.data?.online ?? false;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70 bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Coins className="size-5" />
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">RateDesk</h1>
              <p className="text-xs text-muted-foreground">
                Live currency conversion &amp; travel budgeting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span
                aria-hidden
                className={cn(
                  "size-2 rounded-full",
                  status.isPending
                    ? "bg-muted-foreground"
                    : online
                      ? "animate-pulse bg-primary"
                      : "bg-destructive",
                )}
              />
              {status.isPending
                ? "Checking rates…"
                : online
                  ? `Live rates · ${status.data?.asOf}`
                  : "Rate feed offline"}
            </span>
            <div className="flex items-center gap-2">
              <Label htmlFor="travel-mode" className="text-xs text-muted-foreground">
                Travel mode
              </Label>
              <Switch
                id="travel-mode"
                checked={travelMode}
                onCheckedChange={setTravelMode}
                aria-label="Toggle travel budgeting mode"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            {travelMode ? (
              <TravelBudget
                currencies={currencies.data ?? []}
                currenciesLoading={currencies.isPending}
              />
            ) : (
              <>
                <Converter
                  source={source}
                  target={target}
                  amount={amount}
                  onSourceChange={setSource}
                  onTargetChange={setTarget}
                  onAmountChange={setAmount}
                  onSwap={() => {
                    setSource(target);
                    setTarget(source);
                  }}
                  currencies={currencies.data ?? []}
                  currenciesLoading={currencies.isPending}
                  favorites={favorites.data ?? []}
                />
                <TrendChart source={source} target={target} />
              </>
            )}
          </div>

          <SidePanel
            favorites={favorites.data ?? []}
            favoritesLoading={favorites.isPending}
            onSelectPair={(nextSource, nextTarget) => {
              setSource(nextSource);
              setTarget(nextTarget);
              setTravelMode(false);
            }}
          />
        </div>
      </main>
    </div>
  );
}
