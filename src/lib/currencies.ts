/** Client-safe currency metadata: flag emoji lookup and travel-mode targets. */

export const TRAVEL_TARGETS = ["USD", "EUR", "GBP", "JPY", "INR"] as const;

const FLAGS: Record<string, string> = {
  AUD: "🇦🇺",
  BGN: "🇧🇬",
  BRL: "🇧🇷",
  CAD: "🇨🇦",
  CHF: "🇨🇭",
  CNY: "🇨🇳",
  CZK: "🇨🇿",
  DKK: "🇩🇰",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  HKD: "🇭🇰",
  HUF: "🇭🇺",
  IDR: "🇮🇩",
  ILS: "🇮🇱",
  INR: "🇮🇳",
  ISK: "🇮🇸",
  JPY: "🇯🇵",
  KRW: "🇰🇷",
  MXN: "🇲🇽",
  MYR: "🇲🇾",
  NOK: "🇳🇴",
  NZD: "🇳🇿",
  PHP: "🇵🇭",
  PLN: "🇵🇱",
  RON: "🇷🇴",
  SEK: "🇸🇪",
  SGD: "🇸🇬",
  THB: "🇹🇭",
  TRY: "🇹🇷",
  USD: "🇺🇸",
  ZAR: "🇿🇦",
};

export function flagFor(code: string): string {
  return FLAGS[code] ?? "🏳️";
}
