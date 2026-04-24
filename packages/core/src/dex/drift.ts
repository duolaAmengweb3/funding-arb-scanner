import type { FundingRate } from "../types.js";

/**
 * Drift Protocol — Solana perp DEX.
 * Public data DLOB: https://dlob.drift.trade/
 * Returns "lastFundingRatePct" per market, expressed per 1-hour period.
 * Reference: https://drift-labs.github.io/v2-teacher/
 */
interface DriftMarket {
  marketName?: string;
  marketIndex?: number;
  fundingRateApr?: number;
  lastFundingRatePct?: number;
  oraclePrice?: string;
  openInterest?: string;
  status?: string;
}

export async function getDriftAllFunding(): Promise<FundingRate[]> {
  const res = await fetch("https://data.api.drift.trade/stats/markets/perp");
  if (!res.ok) throw new Error(`Drift markets ${res.status}`);
  const data = (await res.json()) as { markets?: DriftMarket[] };
  const markets = data.markets ?? [];
  return markets
    .filter((m) => m.status !== "Paused" && typeof m.marketName === "string")
    .map((m) => {
      // Drift returns fundingRateApr (annualized %) directly on most endpoints.
      const annualPct =
        typeof m.fundingRateApr === "number"
          ? m.fundingRateApr
          : typeof m.lastFundingRatePct === "number"
            ? m.lastFundingRatePct * 24 * 365
            : 0;
      const ratePerHour = annualPct / (24 * 365 * 100);
      // marketName like "SOL-PERP" → base symbol
      const symbol = (m.marketName ?? "").replace(/-PERP$/, "");
      return {
        venue: "drift",
        symbol,
        annual_pct: annualPct,
        raw_rate: ratePerHour,
        period_hours: 1,
        mark_price: m.oraclePrice ? Number(m.oraclePrice) : undefined,
      } satisfies FundingRate;
    });
}
