import { getBinanceAllFunding } from "./cex/binance.js";
import { getBybitAllFunding } from "./cex/bybit.js";
import { getOkxAllFunding } from "./cex/okx.js";
import { getHlAllFunding } from "./hl.js";
import type { FundingRate, FundingSpread, Venue } from "./types.js";

export interface ScanResult {
  bySymbol: Map<string, Map<Venue, FundingRate>>;
  venueStatus: Record<Venue, { ok: boolean; count: number; error?: string }>;
}

/**
 * Pull funding from every supported venue in parallel, tolerating individual
 * failures. Returns per-venue success status so callers can surface partial results.
 */
export async function getAllFunding(): Promise<ScanResult> {
  const targets: Array<[Venue, () => Promise<FundingRate[]>]> = [
    ["hyperliquid", getHlAllFunding],
    ["binance", getBinanceAllFunding],
    ["bybit", getBybitAllFunding],
    ["okx", getOkxAllFunding],
  ];

  const results = await Promise.allSettled(targets.map(([, fn]) => fn()));

  const bySymbol = new Map<string, Map<Venue, FundingRate>>();
  const venueStatus = {} as ScanResult["venueStatus"];

  for (let i = 0; i < targets.length; i += 1) {
    const [venue] = targets[i];
    const r = results[i];
    if (r.status === "fulfilled") {
      venueStatus[venue] = { ok: true, count: r.value.length };
      for (const fr of r.value) {
        const byVenue = bySymbol.get(fr.symbol) ?? new Map<Venue, FundingRate>();
        byVenue.set(fr.venue, fr);
        bySymbol.set(fr.symbol, byVenue);
      }
    } else {
      venueStatus[venue] = {
        ok: false,
        count: 0,
        error: (r.reason as Error).message,
      };
    }
  }

  return { bySymbol, venueStatus };
}

/** Build every long/short spread pair from the multi-venue map. */
export function buildSpreads(
  bySymbol: Map<string, Map<Venue, FundingRate>>,
  opts: { minVenuesPerSymbol?: number; minSpreadAnnualPct?: number } = {},
): FundingSpread[] {
  const minVenues = opts.minVenuesPerSymbol ?? 2;
  const minSpread = opts.minSpreadAnnualPct ?? 0;
  const spreads: FundingSpread[] = [];

  for (const [symbol, byVenue] of bySymbol) {
    if (byVenue.size < minVenues) continue;
    const venues = [...byVenue.values()];
    const sorted = [...venues].sort((a, b) => a.annual_pct - b.annual_pct);
    const lowest = sorted[0];
    const highest = sorted[sorted.length - 1];
    const spread = highest.annual_pct - lowest.annual_pct;
    if (spread < minSpread) continue;
    spreads.push({
      symbol,
      long_at: lowest.venue,
      long_annual_pct: Number(lowest.annual_pct.toFixed(4)),
      short_at: highest.venue,
      short_annual_pct: Number(highest.annual_pct.toFixed(4)),
      spread_annual_pct: Number(spread.toFixed(4)),
      annual_pnl_per_1k_usd: Number(((spread / 100) * 1000).toFixed(2)),
    });
  }

  spreads.sort((a, b) => b.spread_annual_pct - a.spread_annual_pct);
  return spreads;
}
