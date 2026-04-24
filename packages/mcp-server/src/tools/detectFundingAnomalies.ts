import { getAllFunding } from "funding-arb-scanner-core";
import { z } from "zod";
import type { ToolDef } from "./index.js";

export const detectFundingAnomaliesTool: ToolDef = {
  name: "detect_funding_anomalies",
  description:
    "Scan all 9 venues × all listed symbols for funding extremes. Returns 3 buckets: (1) symbols with |annual funding| > threshold on any venue (single-side extreme — pay or receive crazy carry); (2) symbols with the widest venue-to-venue spread; (3) symbols listed on the most venues (best liquidity for arb). Use when user asks 'what's weird in perp funding right now'.",
  inputSchema: {
    type: "object",
    properties: {
      min_abs_annual_pct: {
        type: "number",
        default: 50,
        description: "Single-side extreme threshold. Default 50%/yr.",
      },
      min_spread_annual_pct: {
        type: "number",
        default: 30,
        description: "Cross-venue spread threshold. Default 30%/yr.",
      },
      limit: { type: "number", default: 20 },
    },
  },
};

const inputSchema = z.object({
  min_abs_annual_pct: z.number().nonnegative().default(50),
  min_spread_annual_pct: z.number().nonnegative().default(30),
  limit: z.number().int().min(1).max(200).default(20),
});

interface ExtremeRow {
  symbol: string;
  venue: string;
  annual_pct: number;
  side: "longs_pay" | "shorts_pay";
}
interface SpreadRow {
  symbol: string;
  long_at: string;
  short_at: string;
  spread_annual_pct: number;
  venue_count: number;
}

export async function handleDetectFundingAnomalies(
  rawArgs: Record<string, unknown>,
): Promise<unknown> {
  const { min_abs_annual_pct, min_spread_annual_pct, limit } = inputSchema.parse(rawArgs);
  const { bySymbol, venueStatus } = await getAllFunding();

  const extremes: ExtremeRow[] = [];
  const spreads: SpreadRow[] = [];
  const coverage: Array<{ symbol: string; venue_count: number; venues: string[] }> = [];

  for (const [symbol, byVenue] of bySymbol) {
    const rows = [...byVenue.values()];

    // Single-side extremes.
    for (const r of rows) {
      if (Math.abs(r.annual_pct) >= min_abs_annual_pct) {
        extremes.push({
          symbol,
          venue: r.venue,
          annual_pct: Number(r.annual_pct.toFixed(4)),
          side: r.annual_pct > 0 ? "longs_pay" : "shorts_pay",
        });
      }
    }

    // Cross-venue spreads.
    if (rows.length >= 2) {
      const sorted = [...rows].sort((a, b) => a.annual_pct - b.annual_pct);
      const lo = sorted[0];
      const hi = sorted[sorted.length - 1];
      const spread = hi.annual_pct - lo.annual_pct;
      if (spread >= min_spread_annual_pct) {
        spreads.push({
          symbol,
          long_at: lo.venue,
          short_at: hi.venue,
          spread_annual_pct: Number(spread.toFixed(4)),
          venue_count: rows.length,
        });
      }
    }

    coverage.push({
      symbol,
      venue_count: byVenue.size,
      venues: [...byVenue.keys()],
    });
  }

  extremes.sort((a, b) => Math.abs(b.annual_pct) - Math.abs(a.annual_pct));
  spreads.sort((a, b) => b.spread_annual_pct - a.spread_annual_pct);
  coverage.sort((a, b) => b.venue_count - a.venue_count);

  const headlines: string[] = [];
  if (extremes[0]) {
    headlines.push(
      `${extremes[0].symbol} @ ${extremes[0].venue}: ${extremes[0].annual_pct >= 0 ? "+" : ""}${extremes[0].annual_pct.toFixed(1)}%/yr`,
    );
  }
  if (spreads[0]) {
    headlines.push(
      `${spreads[0].symbol}: long ${spreads[0].long_at} → short ${spreads[0].short_at} spread ${spreads[0].spread_annual_pct.toFixed(1)}%/yr`,
    );
  }

  return {
    symbols_scanned: bySymbol.size,
    venue_status: venueStatus,
    thresholds: { min_abs_annual_pct, min_spread_annual_pct },
    extremes_count: extremes.length,
    spreads_count: spreads.length,
    headline: headlines.join(" · ") || "No extremes above thresholds. Market is tame.",
    anomalies: {
      single_side_extremes: extremes.slice(0, limit),
      cross_venue_spreads: spreads.slice(0, limit),
      widest_coverage: coverage.slice(0, 10),
    },
  };
}
