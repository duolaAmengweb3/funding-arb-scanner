import { buildSpreads, getAllFunding } from "funding-arb-scanner-core";
import { z } from "zod";
import type { ToolDef } from "./index.js";

export const scanFundingDiffTool: ToolDef = {
  name: "scan_funding_diff",
  description:
    "Scan funding rates across Hyperliquid + Binance + Bybit + OKX and return all long/short arbitrage opportunities sorted by annualized spread. Each row says 'long at venue X, short at venue Y, spread Z%/year'. Use for 'find me the best funding arb right now'.",
  inputSchema: {
    type: "object",
    properties: {
      min_spread_annual_pct: {
        type: "number",
        default: 5,
        description: "Only return spreads wider than this (in annual %).",
      },
      limit: { type: "number", default: 30, description: "Max rows to return." },
    },
  },
};

const inputSchema = z.object({
  min_spread_annual_pct: z.number().min(0).max(10_000).default(5),
  limit: z.number().int().min(1).max(200).default(30),
});

export async function handleScanFundingDiff(rawArgs: Record<string, unknown>): Promise<unknown> {
  const { min_spread_annual_pct, limit } = inputSchema.parse(rawArgs);
  const { bySymbol, venueStatus } = await getAllFunding();
  const spreads = buildSpreads(bySymbol, {
    minSpreadAnnualPct: min_spread_annual_pct,
    minVenuesPerSymbol: 2,
  });

  return {
    symbols_covered: bySymbol.size,
    venue_status: venueStatus,
    spread_threshold_annual_pct: min_spread_annual_pct,
    opportunities_found: spreads.length,
    opportunities: spreads.slice(0, limit),
    disclaimer:
      "Spreads are gross of fees, borrow interest, slippage, and margin drift. A +20%/yr spread can easily be consumed by taker fees on frequent rebalances. Model your real costs before executing.",
  };
}
