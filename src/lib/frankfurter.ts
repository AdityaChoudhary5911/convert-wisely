const BASE_URL = "https://api.frankfurter.dev/v1";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Exchange rate service returned ${response.status}`);
  }
  return (await response.json()) as T;
}

export type LatestResponse = {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
};

export type TimeSeriesResponse = {
  base: string;
  start_date: string;
  end_date: string;
  rates: Record<string, Record<string, number>>;
};

/** Fetches unit rates from one base to one or more target currencies. */
export async function fetchLatestRates(base: string, targets: string[]): Promise<LatestResponse> {
  const symbols = targets.filter((code) => code !== base);
  if (symbols.length === 0) {
    return { amount: 1, base, date: new Date().toISOString().slice(0, 10), rates: {} };
  }
  return getJson<LatestResponse>(`/latest?base=${base}&symbols=${symbols.join(",")}`);
}

/** Fetches the daily rate series between two dates (inclusive). */
export async function fetchTimeSeries(
  base: string,
  target: string,
  startDate: string,
  endDate: string,
): Promise<TimeSeriesResponse> {
  return getJson<TimeSeriesResponse>(
    `/${startDate}..${endDate}?base=${base}&symbols=${target}`,
  );
}

export async function fetchCurrencyList(): Promise<Record<string, string>> {
  return getJson<Record<string, string>>("/currencies");
}
