import { getAllFunding } from "funding-arb-scanner-core";
import { z } from "zod";
import type { ToolDef } from "./index.js";

export const estimateArbPnlTool: ToolDef = {
  name: "estimate_arb_pnl",
  description:
    "For a given symbol + notional size + venue pair, estimate expected PnL from the funding spread at 8h / 24h / annualized horizons. Accounts for the different funding periods of each venue. Does NOT model taker fees, borrow interest, or slippage.",
  inputSchema: {
    type: "object",
    properties: {
      symbol: { type: "string", description: "Base symbol (e.g. 'BTC')." },
      size_usd: { type: "number", description: "Notional per side (you open $X long + $X short)." },
      long_venue: { type: "string", description: "e.g. 'hyperliquid'" },
      short_venue: { type: "string", description: "e.g. 'binance'" },
    },
    required: ["symbol", "size_usd"],
  },
};

const inputSchema = z.object({
  symbol: z.string().min(1),
  size_usd: z.number().positive(),
  long_venue: z.string().optional(),
  short_venue: z.string().optional(),
});

export async function handleEstimateArbPnl(rawArgs: Record<string, unknown>): Promise<unknown> {
  const { symbol, size_usd, long_venue, short_venue } = inputSchema.parse(rawArgs);
  const { bySymbol } = await getAllFunding();
  const venueMap = bySymbol.get(symbol);
  if (!venueMap || venueMap.size < 2) {
    throw new Error(`Not enough venues reporting ${symbol} (need ≥ 2)`);
  }

  const venues = [...venueMap.values()];
  let longSide = long_venue ? venueMap.get(long_venue as never) : null;
  let shortSide = short_venue ? venueMap.get(short_venue as never) : null;

  if (!longSide || !shortSide) {
    const sorted = [...venues].sort((a, b) => a.annual_pct - b.annual_pct);
    longSide = sorted[0];
    shortSide = sorted[sorted.length - 1];
  }

  const spreadAnnualPct = shortSide.annual_pct - longSide.annual_pct;
  const annualPnl = (spreadAnnualPct / 100) * size_usd;
  const hourlyPnl = annualPnl / (24 * 365);

  return {
    symbol,
    size_usd,
    long: { venue: longSide.venue, annual_pct: Number(longSide.annual_pct.toFixed(4)) },
    short: { venue: shortSide.venue, annual_pct: Number(shortSide.annual_pct.toFixed(4)) },
    spread_annual_pct: Number(spreadAnnualPct.toFixed(4)),
    expected_pnl_usd: {
      "8h": Number((hourlyPnl * 8).toFixed(2)),
      "24h": Number((hourlyPnl * 24).toFixed(2)),
      "7d": Number((hourlyPnl * 24 * 7).toFixed(2)),
      "30d": Number((hourlyPnl * 24 * 30).toFixed(2)),
      annual: Number(annualPnl.toFixed(2)),
    },
    disclaimer:
      "Gross spread only. Real PnL = gross − (taker fees × rebalances + slippage + borrow interest if applicable). On CEX, fees are commonly 2-5 bps taker; doing this trade requires margin on both sides.",
  };
}
