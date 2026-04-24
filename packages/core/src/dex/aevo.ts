import type { FundingRate } from "../types.js";

/**
 * Aevo — options + perps DEX (own EVM rollup).
 * Public market-data, no auth.
 *
 * Funding on Aevo is 1-hour. `funding` field on /markets is the per-hour rate.
 *
 * Endpoint: https://api.aevo.xyz/markets
 */
interface AevoMarket {
  instrument_name?: string;
  instrument_type?: string;
  underlying_asset?: string;
  mark_price?: string;
  funding?: string;
  next_funding_epoch?: number;
  is_active?: boolean;
}

export async function getAevoAllFunding(): Promise<FundingRate[]> {
  const res = await fetch("https://api.aevo.xyz/markets?asset_kind=PERPETUAL");
  if (!res.ok) throw new Error(`Aevo markets ${res.status}`);
  const rows = (await res.json()) as AevoMarket[];
  const out: FundingRate[] = [];
  for (const r of rows) {
    if (r.is_active === false) continue;
    if (r.instrument_type && r.instrument_type !== "PERPETUAL") continue;
    if (!r.funding) continue;
    const ratePerHour = Number(r.funding);
    if (!Number.isFinite(ratePerHour)) continue;
    const sym = r.underlying_asset ?? r.instrument_name?.replace(/-PERP$/, "") ?? "";
    if (!sym) continue;
    out.push({
      venue: "aevo",
      symbol: sym,
      annual_pct: ratePerHour * 24 * 365 * 100,
      raw_rate: ratePerHour,
      period_hours: 1,
      mark_price: r.mark_price ? Number(r.mark_price) : undefined,
      next_funding_time: r.next_funding_epoch,
    });
  }
  return out;
}
