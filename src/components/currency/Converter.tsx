import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeftRight, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencySelect } from "./CurrencySelect";
import { convert } from "@/lib/currency.functions";
import { addFavorite, removeFavorite } from "@/lib/favorites.functions";
import { flagFor } from "@/lib/currencies";
import { cn } from "@/lib/utils";

type Currency = { code: string; name: string };
type Favorite = { id: string; source_currency: string; target_currency: string };

function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export function Converter({
  source,
  target,
  amount,
  onSourceChange,
  onTargetChange,
  onAmountChange,
  onSwap,
  currencies,
  currenciesLoading,
  favorites,
}: {
  source: string;
  target: string;
  amount: string;
  onSourceChange: (code: string) => void;
  onTargetChange: (code: string) => void;
  onAmountChange: (value: string) => void;
  onSwap: () => void;
  currencies: Currency[];
  currenciesLoading: boolean;
  favorites: Favorite[];
}) {
  const queryClient = useQueryClient();
  const convertFn = useServerFn(convert);
  const addFavoriteFn = useServerFn(addFavorite);
  const removeFavoriteFn = useServerFn(removeFavorite);

  const [debouncedAmount, setDebouncedAmount] = useState(amount);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedAmount(amount), 450);
    return () => clearTimeout(timer);
  }, [amount]);

  const numericAmount = Number(debouncedAmount);
  const validAmount = debouncedAmount.trim() !== "" && Number.isFinite(numericAmount) && numericAmount >= 0;

  const conversion = useQuery({
    queryKey: ["convert", source, target, validAmount ? numericAmount : null],
    queryFn: () => convertFn({ data: { source, target, amount: numericAmount } }),
    enabled: validAmount,
  });

  useEffect(() => {
    if (conversion.isSuccess) queryClient.invalidateQueries({ queryKey: ["history"] });
  }, [conversion.isSuccess, conversion.data, queryClient]);

  useEffect(() => {
    if (conversion.error) toast.error("Couldn't get a live rate. Please try again.");
  }, [conversion.error]);

  const existingFavorite = favorites.find(
    (favorite) => favorite.source_currency === source && favorite.target_currency === target,
  );

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (existingFavorite) {
        await removeFavoriteFn({ data: { id: existingFavorite.id } });
        return "removed" as const;
      }
      await addFavoriteFn({ data: { source_currency: source, target_currency: target } });
      return "added" as const;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success(result === "added" ? "Pair saved to favorites" : "Pair removed from favorites");
    },
    onError: (error: Error) => toast.error(error.message || "Couldn't update favorites"),
  });

  const result = conversion.data;

  return (
    <Card className="border-border/70 bg-card/80">
      <CardContent className="space-y-5 pt-6">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <div className="space-y-2">
            <Label>From</Label>
            <CurrencySelect
              label="Source currency"
              value={source}
              onChange={onSourceChange}
              currencies={currencies}
              loading={currenciesLoading}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Swap currencies"
            onClick={onSwap}
            className="mx-auto size-11 shrink-0"
          >
            <ArrowLeftRight className="size-4" />
          </Button>
          <div className="space-y-2">
            <Label>To</Label>
            <CurrencySelect
              label="Target currency"
              value={target}
              onChange={onTargetChange}
              currencies={currencies}
              loading={currenciesLoading}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              inputMode="decimal"
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              placeholder="100"
              className="h-11 bg-secondary/40 text-lg tabular-nums"
            />
          </div>
          <Button
            type="button"
            variant={existingFavorite ? "default" : "outline"}
            onClick={() => favoriteMutation.mutate()}
            disabled={favoriteMutation.isPending || source === target}
            className="h-11"
          >
            <Star className={cn("mr-2 size-4", existingFavorite && "fill-current")} />
            {existingFavorite ? "Saved" : "Save pair"}
          </Button>
        </div>

        <div className="rounded-xl border border-border/70 bg-secondary/30 p-5">
          {conversion.isPending && validAmount ? (
            <div className="space-y-3">
              <Skeleton className="h-9 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
          ) : result ? (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {flagFor(result.source)} {formatMoney(result.amount, result.source)} equals
              </p>
              <p className="text-3xl font-semibold tracking-tight text-accent-foreground tabular-nums">
                {flagFor(result.target)} {formatMoney(result.converted, result.target)}
              </p>
              <p className="text-sm text-muted-foreground tabular-nums">
                1 {result.source} = {result.rate} {result.target} · 1 {result.target} ={" "}
                {result.inverseRate} {result.source}
              </p>
              <p className="text-xs text-muted-foreground">
                Rates dated {result.rateDate} · updated{" "}
                {new Date(result.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter an amount to see the live converted value.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
