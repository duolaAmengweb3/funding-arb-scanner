import type { FundingRate } from "../types.js";

/**
 * Paradex — Starknet-native orderbook perp DEX.
 * Public market-data REST, no auth.
 *
 * Funding is continuous. `funding_rate` returned by /v1/markets/summary is
 * the 8-hour funding (per Paradex docs), so we annualize with * 3 * 365.
 *
 * Endpoint docs: https://docs.paradex.trade/api/prod/public/getmarketssummary
 */
interface ParadexMarket {
  symbol?: string;
  funding_rate?: string;
  mark_price?: string;
  price_change_rate_24h?: string;
  created_at?: number;
}

export async function getParadexAllFunding(): Promise<FundingRate[]> {
  const res = await fetch("https://api.prod.paradex.trade/v1/markets/summary?market=ALL");
  if (!res.ok) throw new Error(`Paradex summary ${res.status}`);
  const data = (await res.json()) as { results?: ParadexMarket[] };
  const rows = data.results ?? [];
  const out: FundingRate[] = [];
  for (const r of rows) {
    if (!r.symbol || r.funding_rate === undefined) continue;
    const ratePer8h = Number(r.funding_rate);
    if (!Number.isFinite(ratePer8h)) continue;
    // "BTC-USD-PERP" → "BTC"
    const sym = r.symbol
      .replace(/-USD-PERP$/, "")
      .replace(/-USDC-PERP$/, "")
      .replace(/-PERP$/, "");
    if (!sym) continue;
    out.push({
      venue: "paradex",
      symbol: sym,
      annual_pct: ratePer8h * 3 * 365 * 100,
      raw_rate: ratePer8h,
      period_hours: 8,
      mark_price: r.mark_price ? Number(r.mark_price) : undefined,
    });
  }
  return out;
}
