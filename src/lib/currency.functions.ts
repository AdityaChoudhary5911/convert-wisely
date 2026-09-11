import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { fetchCurrencyList, fetchLatestRates, fetchTimeSeries } from "./frankfurter";
import { getPublicDb } from "./server-db";
import { TRAVEL_TARGETS } from "./currencies";

const currencyCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "Currency must be a 3-letter code");

const convertInput = z.object({
  source: currencyCode,
  target: currencyCode,
  amount: z.number().finite().nonnegative().max(1_000_000_000_000),
});

function round(value: number, digits = 6): number {
  return Number(value.toFixed(digits));
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Resolves the unit rate between two currencies, handling identical pairs. */
async function resolveRate(source: string, target: string): Promise<{ rate: number; date: string }> {
  if (source === target) {
    return { rate: 1, date: isoDate(new Date()) };
  }
  const latest = await fetchLatestRates(source, [target]);
  const rate = latest.rates[target];
  if (typeof rate !== "number") {
    throw new Error(`No exchange rate available for ${source} → ${target}`);
  }
  return { rate, date: latest.date };
}

export const listCurrencies = createServerFn({ method: "GET" }).handler(async () => {
  const currencies = await fetchCurrencyList();
  return Object.entries(currencies)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.code.localeCompare(b.code));
});

export const getRatesStatus = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const latest = await fetchLatestRates("EUR", ["USD"]);
    return { online: true as const, asOf: latest.date, checkedAt: new Date().toISOString() };
  } catch {
    return { online: false as const, asOf: null, checkedAt: new Date().toISOString() };
  }
});

export const convert = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => convertInput.parse(input))
  .handler(async ({ data }) => {
    const { source, target, amount } = data;
    const { rate, date } = await resolveRate(source, target);

    const converted = round(amount * rate, 4);
    const inverseRate = round(1 / rate);
    const timestamp = new Date().toISOString();

    if (amount > 0) {
      const db = getPublicDb();
      const { error } = await db.from("conversion_history").insert({
        source_currency: source,
        target_currency: target,
        source_amount: amount,
        converted_amount: converted,
        rate: round(rate),
      });
      if (error) console.error("Failed to log conversion:", error.message);
    }

    return {
      source,
      target,
      amount,
      converted,
      rate: round(rate),
      inverseRate,
      rateDate: date,
      timestamp,
    };
  });

export const getThirtyDayHistory = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ source: currencyCode, target: currencyCode }).parse(input),
  )
  .handler(async ({ data }) => {
    const { source, target } = data;
    const end = new Date();
    const start = new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);

    if (source === target) {
      const points = Array.from({ length: 30 }, (_, index) => ({
        date: isoDate(new Date(start.getTime() + index * 24 * 60 * 60 * 1000)),
        rate: 1,
      }));
      return { source, target, points };
    }

    const series = await fetchTimeSeries(source, target, isoDate(start), isoDate(end));
    const points = Object.entries(series.rates)
      .map(([date, rates]) => ({ date, rate: rates[target] ?? null }))
      .filter((point): point is { date: string; rate: number } => point.rate !== null)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((point) => ({ date: point.date, rate: round(point.rate) }));

    return { source, target, points };
  });

export const getTravelBudget = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        base_currency: currencyCode,
        amount: z.number().finite().nonnegative().max(1_000_000_000_000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const base = data.base_currency;
    const targets = TRAVEL_TARGETS.filter((code) => code !== base);
    const latest = await fetchLatestRates(base, [...targets]);

    const rows = TRAVEL_TARGETS.map((code) => {
      const rate = code === base ? 1 : latest.rates[code];
      if (typeof rate !== "number") return null;
      return { currency: code, rate: round(rate), total: round(data.amount * rate, 2) };
    }).filter((row): row is { currency: string; rate: number; total: number } => row !== null);

    return {
      base,
      amount: data.amount,
      rateDate: latest.date,
      timestamp: new Date().toISOString(),
      rows,
    };
  });

export const listHistory = createServerFn({ method: "GET" }).handler(async () => {
  const db = getPublicDb();
  const { data, error } = await db
    .from("conversion_history")
    .select("id, source_currency, target_currency, source_amount, converted_amount, rate, created_at")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw new Error(error.message);
  return data ?? [];
});
