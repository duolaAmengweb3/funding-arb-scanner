import type { FundingRate } from "../types.js";

/**
 * dYdX v4 indexer — public, no auth.
 * GET /v4/perpetualMarkets returns a map keyed by ticker (e.g. "BTC-USD").
 * nextFundingRate is expressed as a proportion per 1-hour interval.
 */
interface DydxMarket {
  ticker: string;
  nextFundingRate?: string;
  oraclePrice?: string;
  openInterest?: string;
  volume24H?: string;
  status?: string;
}

export async function getDydxAllFunding(): Promise<FundingRate[]> {
  const res = await fetch("https://indexer.dydx.trade/v4/perpetualMarkets");
  if (!res.ok) throw new Error(`dYdX perpetualMarkets ${res.status}`);
  const data = (await res.json()) as { markets?: Record<string, DydxMarket> };
  const markets = data.markets ?? {};
  const out: FundingRate[] = [];
  for (const [ticker, m] of Object.entries(markets)) {
    if (m.status && m.status !== "ACTIVE") continue;
    const rateHour = Number(m.nextFundingRate ?? 0);
    if (!Number.isFinite(rateHour)) continue;
    // dYdX ticker format is "BASE-USD"; extract base symbol.
    const symbol = ticker.replace(/-USD(C)?$/, "");
    out.push({
      venue: "dydx",
      symbol,
      annual_pct: rateHour * 24 * 365 * 100,
      raw_rate: rateHour,
      period_hours: 1,
      mark_price: m.oraclePrice ? Number(m.oraclePrice) : undefined,
    });
  }
  return out;
}
