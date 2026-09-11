import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Clock, Star, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { listHistory } from "@/lib/currency.functions";
import { removeFavorite } from "@/lib/favorites.functions";
import { flagFor } from "@/lib/currencies";

type Favorite = { id: string; source_currency: string; target_currency: string };

export function SidePanel({
  favorites,
  favoritesLoading,
  onSelectPair,
}: {
  favorites: Favorite[];
  favoritesLoading: boolean;
  onSelectPair: (source: string, target: string) => void;
}) {
  const queryClient = useQueryClient();
  const removeFavoriteFn = useServerFn(removeFavorite);
  const historyFn = useServerFn(listHistory);

  const history = useQuery({ queryKey: ["history"], queryFn: () => historyFn() });

  const removal = useMutation({
    mutationFn: (id: string) => removeFavoriteFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success("Pair removed from favorites");
    },
    onError: () => toast.error("Couldn't remove that pair"),
  });

  return (
    <div className="space-y-4">
      <Card className="border-border/70 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Star className="size-4 text-primary" />
            Favorite pairs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {favoritesLoading ? (
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-28" />
            </div>
          ) : favorites.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No saved pairs yet. Use “Save pair” to bookmark one.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {favorites.map((favorite) => (
                <li key={favorite.id}>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-secondary/50 pl-3 pr-1 text-sm">
                    <button
                      type="button"
                      onClick={() =>
                        onSelectPair(favorite.source_currency, favorite.target_currency)
                      }
                      className="py-1.5 font-medium tabular-nums transition-colors hover:text-primary"
                    >
                      {flagFor(favorite.source_currency)} {favorite.source_currency} →{" "}
                      {flagFor(favorite.target_currency)} {favorite.target_currency}
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${favorite.source_currency} to ${favorite.target_currency}`}
                      className="size-6 rounded-full"
                      disabled={removal.isPending}
                      onClick={() => removal.mutate(favorite.id)}
                    >
                      <X className="size-3" />
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Clock className="size-4 text-primary" />
            Recent conversions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.isPending ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : history.isError ? (
            <p className="text-sm text-muted-foreground">Couldn't load history.</p>
          ) : history.data && history.data.length > 0 ? (
            <ul className="divide-y divide-border/60">
              {history.data.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => onSelectPair(entry.source_currency, entry.target_currency)}
                    className="text-left"
                  >
                    <span className="block text-sm font-medium tabular-nums">
                      {Number(entry.source_amount)} {entry.source_currency} →{" "}
                      {Number(entry.converted_amount)} {entry.target_currency}
                    </span>
                    <span className="block text-xs text-muted-foreground tabular-nums">
                      rate {Number(entry.rate)} ·{" "}
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Conversions you make will show up here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
