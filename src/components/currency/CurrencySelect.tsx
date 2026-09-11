import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { flagFor } from "@/lib/currencies";

type Currency = { code: string; name: string };

export function CurrencySelect({
  value,
  onChange,
  currencies,
  loading,
  label,
}: {
  value: string;
  onChange: (code: string) => void;
  currencies: Currency[];
  loading: boolean;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = currencies.find((currency) => currency.code === value);

  if (loading) return <Skeleton className="h-11 w-full" />;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-label={label}
          aria-expanded={open}
          className="h-11 w-full justify-between border-border bg-secondary/40 text-left font-medium"
        >
          <span className="flex items-center gap-2 truncate">
            <span aria-hidden className="text-base">
              {flagFor(value)}
            </span>
            <span className="tabular-nums">{value}</span>
            <span className="truncate text-xs text-muted-foreground">{selected?.name}</span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search currency..." />
          <CommandList>
            <CommandEmpty>No currency found.</CommandEmpty>
            <CommandGroup>
              {currencies.map((currency) => (
                <CommandItem
                  key={currency.code}
                  value={`${currency.code} ${currency.name}`}
                  onSelect={() => {
                    onChange(currency.code);
                    setOpen(false);
                  }}
                >
                  <span aria-hidden className="mr-2">
                    {flagFor(currency.code)}
                  </span>
                  <span className="font-medium">{currency.code}</span>
                  <span className="ml-2 truncate text-xs text-muted-foreground">
                    {currency.name}
                  </span>
                  <Check
                    className={cn(
                      "ml-auto size-4",
                      currency.code === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
