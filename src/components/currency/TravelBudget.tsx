import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plane } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CurrencySelect } from "./CurrencySelect";
import { getTravelBudget } from "@/lib/currency.functions";
import { flagFor } from "@/lib/currencies";

type Currency = { code: string; name: string };

export function TravelBudget({
  currencies,
  currenciesLoading,
}: {
  currencies: Currency[];
  currenciesLoading: boolean;
}) {
  const budgetFn = useServerFn(getTravelBudget);
  const [base, setBase] = useState("USD");
  const [amount, setAmount] = useState("1000");
  const [debounced, setDebounced] = useState(amount);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(amount), 450);
    return () => clearTimeout(timer);
  }, [amount]);

  const numeric = Number(debounced);
  const valid = debounced.trim() !== "" && Number.isFinite(numeric) && numeric >= 0;

  const budget = useQuery({
    queryKey: ["travel-budget", base, valid ? numeric : null],
    queryFn: () => budgetFn({ data: { base_currency: base, amount: numeric } }),
    enabled: valid,
  });

  useEffect(() => {
    if (budget.error) toast.error("Couldn't build your travel budget. Please try again.");
  }, [budget.error]);

  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Plane className="size-4 text-primary" />
          Travel budget across 5 major currencies
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Base currency</Label>
            <CurrencySelect
              label="Base currency"
              value={base}
              onChange={setBase}
              currencies={currencies}
              loading={currenciesLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget-amount">Total budget</Label>
            <Input
              id="budget-amount"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="1000"
              className="h-11 bg-secondary/40 text-lg tabular-nums"
            />
          </div>
        </div>

        {budget.isPending && valid ? (
          <Skeleton className="h-56 w-full" />
        ) : budget.data ? (
          <div className="overflow-hidden rounded-xl border border-border/70">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency</TableHead>
                  <TableHead>Flag</TableHead>
                  <TableHead className="text-right">Current rate</TableHead>
                  <TableHead className="text-right">Converted budget</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budget.data.rows.map((row) => (
                  <TableRow key={row.currency}>
                    <TableCell className="font-medium">{row.currency}</TableCell>
                    <TableCell aria-hidden className="text-base">
                      {flagFor(row.currency)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      1 {budget.data.base} = {row.rate}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {row.total.toLocaleString("en-US", { maximumFractionDigits: 2 })}{" "}
                      {row.currency}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="border-t border-border/70 bg-secondary/30 px-4 py-2 text-xs text-muted-foreground">
              Rates dated {budget.data.rateDate} · calculated{" "}
              {new Date(budget.data.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter a budget amount to compare it across major currencies.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
