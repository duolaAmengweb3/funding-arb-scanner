import { getAllFunding } from "funding-arb-scanner-core";
import { z } from "zod";
import type { ToolDef } from "./index.js";

export const getPairFundingTool: ToolDef = {
  name: "get_pair_funding",
  description:
    "Show current funding rates for a single symbol across every supported venue (HL + Binance + Bybit + OKX). Returns venue, annualized %, raw rate, period hours, and mark price where available.",
  inputSchema: {
    type: "object",
    properties: {
      symbol: {
        type: "string",
        description: "Base symbol like 'BTC', 'ETH', 'HYPE' — we match across venues.",
      },
    },
    required: ["symbol"],
  },
};

const inputSchema = z.object({ symbol: z.string().min(1) });

export async function handleGetPairFunding(rawArgs: Record<string, unknown>): Promise<unknown> {
  const { symbol } = inputSchema.parse(rawArgs);
  const { bySymbol } = await getAllFunding();
  const venueMap = bySymbol.get(symbol);
  if (!venueMap) {
    return {
      symbol,
      venues: [],
      note: "No venue reports this symbol. Check casing (HL uses 'BTC', not 'btc').",
    };
  }

  const venues = [...venueMap.values()].sort((a, b) => a.annual_pct - b.annual_pct);
  const spread =
    venues.length > 1 ? venues[venues.length - 1].annual_pct - venues[0].annual_pct : 0;

  return {
    symbol,
    venue_count: venues.length,
    spread_annual_pct: Number(spread.toFixed(4)),
    long_side: venues[0]?.venue,
    short_side: venues[venues.length - 1]?.venue,
    venues: venues.map((v) => ({
      venue: v.venue,
      annual_pct: Number(v.annual_pct.toFixed(4)),
      raw_rate: v.raw_rate,
      period_hours: v.period_hours,
      mark_price: v.mark_price,
      next_funding_time: v.next_funding_time,
    })),
  };
}
