/**
 * FRED (Federal Reserve Economic Data) fetcher.
 * Uses the public fredgraph.csv endpoint — no API key required.
 */

export type Observation = { date: string; value: number };

const FETCH_TIMEOUT_MS = 20000;

/** Fetch all observations for a single FRED series. Returns [] on failure. */
export async function fetchFredSeries(seriesId: string): Promise<Observation[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(
      `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${encodeURIComponent(seriesId)}`,
      {
        signal: controller.signal,
        headers: { "user-agent": "Mozilla/5.0 (compatible; OSKInsightsBot/1.0)" },
      }
    );
    clearTimeout(timer);
    if (!res.ok) return [];
    const text = await res.text();
    const lines = text.trim().split("\n");
    const out: Observation[] = [];
    for (let i = 1; i < lines.length; i++) {
      const [date, raw] = lines[i].split(",");
      const value = parseFloat(raw);
      if (date && !isNaN(value)) out.push({ date: date.trim(), value });
    }
    return out;
  } catch {
    return [];
  }
}

export type SeriesSnapshot = {
  latest: Observation;
  /** Change vs the previous observation (absolute). */
  prevChange: number;
  /** % change vs ~1 month earlier (previous obs for monthly series). */
  momPct: number | null;
  /** % change vs ~12 months earlier. */
  yoyPct: number | null;
};

/**
 * Summarize a series: latest value plus MoM/YoY style changes.
 * `obsPerYear` lets weekly series (52) compute YoY correctly.
 */
export function snapshot(obs: Observation[], obsPerYear = 12): SeriesSnapshot | null {
  if (obs.length === 0) return null;
  const latest = obs[obs.length - 1];
  const prev = obs[obs.length - 2];
  const monthBack = obs[obs.length - 1 - Math.max(1, Math.round(obsPerYear / 12))];
  const yearBack = obs[obs.length - 1 - obsPerYear];
  const pct = (cur: number, base?: number) =>
    base && base !== 0 ? ((cur - base) / base) * 100 : null;
  return {
    latest,
    prevChange: prev ? latest.value - prev.value : 0,
    momPct: pct(latest.value, monthBack?.value),
    yoyPct: pct(latest.value, yearBack?.value),
  };
}

/** Format helpers matching the existing seed-data style. */
export const fmt = {
  num: (v: number, decimals = 0): string =>
    v.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
  pct: (v: number | null): string =>
    v === null ? "n/a" : `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`,
  signed: (v: number, decimals = 2): string =>
    `${v >= 0 ? "+" : ""}${v.toFixed(decimals)}`,
};
