import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getThirtyDayHistory } from "@/lib/currency.functions";

export function TrendChart({ source, target }: { source: string; target: string }) {
  const historyFn = useServerFn(getThirtyDayHistory);
  const trend = useQuery({
    queryKey: ["trend", source, target],
    queryFn: () => historyFn({ data: { source, target } }),
  });

  const points = trend.data?.points ?? [];

  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <TrendingUp className="size-4 text-primary" />
          30-day trend · {source} → {target}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trend.isPending ? (
          <Skeleton className="h-64 w-full" />
        ) : trend.isError ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Trend data isn't available for this pair right now.
          </p>
        ) : points.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No rate history for this pair.
          </p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickFormatter={(value: string) => value.slice(5)}
                  interval="preserveStartEnd"
                  minTickGap={24}
                  stroke="var(--color-border)"
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  width={64}
                  stroke="var(--color-border)"
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                    color: "var(--color-popover-foreground)",
                    fontSize: "0.8rem",
                  }}
                  formatter={(value: number) => [`${value} ${target}`, `1 ${source}`]}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
