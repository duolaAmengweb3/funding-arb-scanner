import { type Venue, getAllFunding, roundTripFeeBps } from "funding-arb-scanner-core";
import { z } from "zod";
import type { ToolDef } from "./index.js";

export const estimateFullCostTool: ToolDef = {
  name: "estimate_full_cost",
  description:
    "THE KEY TOOL. For a given symbol + notional size + venue pair, compute NET expected PnL after round-trip taker fees. " +
    "Inputs: symbol, size_usd, optional long_venue + short_venue (defaults to lowest/highest funding pair), optional hold_hours. " +
    "Returns gross spread annual%, fee_bps round-trip, gross_usd over hold_hours, fee_usd, NET_usd, and break-even hold time. " +
    "Use when the user asks 'will I actually make money on this arb after fees' — the answer no other funding-arb tool gives.",
  inputSchema: {
    type: "object",
    properties: {
      symbol: { type: "string", description: "Base symbol e.g. 'BTC'." },
      size_usd: {
        type: "number",
        description:
          "Notional USD per side. You open $X long on one venue and $X short on the other.",
      },
      long_venue: { type: "string", description: "Optional. Omit to auto-pick lowest funding." },
      short_venue: { type: "string", description: "Optional. Omit to auto-pick highest funding." },
      hold_hours: {
        type: "number",
        default: 24,
        description: "How long you plan to hold the trade. Default 24h.",
      },
    },
    required: ["symbol", "size_usd"],
  },
};

const inputSchema = z.object({
  symbol: z.string().min(1),
  size_usd: z.number().positive(),
  long_venue: z.string().optional(),
  short_venue: z.string().optional(),
  hold_hours: z
    .number()
    .positive()
    .max(24 * 365)
    .default(24),
});

export async function handleEstimateFullCost(rawArgs: Record<string, unknown>): Promise<unknown> {
  const { symbol, size_usd, long_venue, short_venue, hold_hours } = inputSchema.parse(rawArgs);

  const { bySymbol } = await getAllFunding();
  const venueMap = bySymbol.get(symbol);
  if (!venueMap || venueMap.size < 2) {
    throw new Error(`Need at least 2 venues reporting ${symbol}; got ${venueMap?.size ?? 0}`);
  }

  const venues = [...venueMap.values()];
  let longSide = long_venue ? venueMap.get(long_venue as Venue) : undefined;
  let shortSide = short_venue ? venueMap.get(short_venue as Venue) : undefined;

  if (!longSide || !shortSide) {
    const sorted = [...venues].sort((a, b) => a.annual_pct - b.annual_pct);
    longSide = sorted[0];
    shortSide = sorted[sorted.length - 1];
  }

  const grossSpreadAnnualPct = shortSide.annual_pct - longSide.annual_pct;

  // Gross PnL over the hold window.
  const grossAnnualUsd = (grossSpreadAnnualPct / 100) * size_usd;
  const grossHoldUsd = (grossAnnualUsd * hold_hours) / (24 * 365);

  // Round-trip fees (2 sides × 2 legs, all taker).
  const feeBpsRoundTrip = roundTripFeeBps(longSide.venue, shortSide.venue);
  const feeUsd = (feeBpsRoundTrip / 10_000) * size_usd;

  const netHoldUsd = grossHoldUsd - feeUsd;
  const netAnnualUsd = netHoldUsd * ((24 * 365) / hold_hours);
  const netAnnualPct = (netAnnualUsd / size_usd) * 100;

  // Break-even hold = fee / (gross annual usd / hours_per_year).
  const grossPerHourUsd = grossAnnualUsd / (24 * 365);
  const breakEvenHours = grossPerHourUsd > 0 ? feeUsd / grossPerHourUsd : Number.POSITIVE_INFINITY;

  const verdict =
    grossPerHourUsd <= 0
      ? "❌ spread direction is inverted; no PnL possible"
      : netHoldUsd < 0
        ? `❌ NET LOSS — break-even needs ${breakEvenHours.toFixed(1)}h hold vs your ${hold_hours}h plan`
        : netAnnualPct < 10
          ? `⚠️  marginal — ${netAnnualPct.toFixed(1)}%/yr net after fees, not worth the operational risk`
          : `✅ viable — ${netAnnualPct.toFixed(1)}%/yr net after fees`;

  return {
    symbol,
    size_usd,
    hold_hours,
    long: { venue: longSide.venue, annual_pct: Number(longSide.annual_pct.toFixed(4)) },
    short: { venue: shortSide.venue, annual_pct: Number(shortSide.annual_pct.toFixed(4)) },
    gross: {
      spread_annual_pct: Number(grossSpreadAnnualPct.toFixed(4)),
      annual_usd: Number(grossAnnualUsd.toFixed(2)),
      hold_window_usd: Number(grossHoldUsd.toFixed(2)),
    },
    fees: {
      round_trip_bps: Number(feeBpsRoundTrip.toFixed(2)),
      round_trip_usd: Number(feeUsd.toFixed(2)),
    },
    net: {
      hold_window_usd: Number(netHoldUsd.toFixed(2)),
      annual_pct: Number(netAnnualPct.toFixed(4)),
      break_even_hours: Number.isFinite(breakEvenHours) ? Number(breakEvenHours.toFixed(2)) : null,
    },
    verdict,
    caveats: [
      "Fees are conservative taker-tier defaults — VIP tier will be lower.",
      "Slippage is NOT included. For thin markets ($BTC-level liquidity aside), a $100k order can eat 20+ bps extra each side.",
      "Borrow interest on CEX cross-margin NOT modelled.",
      "Funding can flip mid-trade. This snapshot assumes current rate persists.",
    ],
  };
}
