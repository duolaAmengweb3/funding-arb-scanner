import { getAllFunding } from "funding-arb-scanner-core";
import { z } from "zod";
import type { ToolDef } from "./index.js";

export const fundingScheduleTool: ToolDef = {
  name: "funding_schedule",
  description:
    "For a symbol, list the next funding time on each venue and how many minutes away it is. Useful for timing arb entries: HL pays hourly, CEX pays every 8h — entering right before a big CEX funding charge on the side that RECEIVES means you capture a lump-sum payment almost immediately.",
  inputSchema: {
    type: "object",
    properties: {
      symbol: { type: "string", description: "Base symbol e.g. 'BTC'." },
    },
    required: ["symbol"],
  },
};

const inputSchema = z.object({ symbol: z.string().min(1) });

export async function handleFundingSchedule(rawArgs: Record<string, unknown>): Promise<unknown> {
  const { symbol } = inputSchema.parse(rawArgs);
  const { bySymbol } = await getAllFunding();
  const venueMap = bySymbol.get(symbol);
  if (!venueMap) {
    return { symbol, note: "No venue reports this symbol.", venues: [] };
  }

  const now = Date.now();
  const rows = [...venueMap.values()].map((r) => {
    const minutes_to_funding = r.next_funding_time
      ? Math.max(0, Math.round((r.next_funding_time - now) / 60_000))
      : null;
    return {
      venue: r.venue,
      period_hours: r.period_hours,
      current_annual_pct: Number(r.annual_pct.toFixed(4)),
      // Single-period take if you hold across the funding stamp.
      next_period_take_pct: Number((r.raw_rate * 100).toFixed(6)),
      next_funding_at: r.next_funding_time ? new Date(r.next_funding_time).toISOString() : null,
      minutes_to_funding,
    };
  });

  // Sort: soonest funding first.
  rows.sort((a, b) => {
    const am = a.minutes_to_funding ?? 1e9;
    const bm = b.minutes_to_funding ?? 1e9;
    return am - bm;
  });

  const soonest = rows.find((r) => r.minutes_to_funding !== null);
  const note = soonest
    ? `Next funding across all venues: ${soonest.venue} in ${soonest.minutes_to_funding} min (take ${soonest.next_period_take_pct}%)`
    : "No venue exposes next_funding_time for this symbol.";

  return { symbol, note, venues: rows };
}
