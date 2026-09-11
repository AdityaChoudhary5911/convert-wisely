import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getPublicDb } from "./server-db";

const pair = z.object({
  source_currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/),
  target_currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/),
});

export const listFavorites = createServerFn({ method: "GET" }).handler(async () => {
  const db = getPublicDb();
  const { data, error } = await db
    .from("favorites")
    .select("id, source_currency, target_currency, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const addFavorite = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => pair.parse(input))
  .handler(async ({ data }) => {
    if (data.source_currency === data.target_currency) {
      throw new Error("Pick two different currencies before saving a pair.");
    }
    const db = getPublicDb();
    const { data: row, error } = await db
      .from("favorites")
      .insert(data)
      .select("id, source_currency, target_currency, created_at")
      .single();
    if (error) {
      if (error.code === "23505" || error.code === "23514" || error.code === "23000") {
        throw new Error("That pair is already saved.");
      }
      if (error.code === "23505") throw new Error("That pair is already saved.");
      throw new Error(error.message);
    }
    return row;
  });

export const removeFavorite = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const db = getPublicDb();
    const { error } = await db.from("favorites").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { id: data.id };
  });
