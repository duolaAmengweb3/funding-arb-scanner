import { z } from "zod";
import type { ToolDef } from "./index.js";

export const historicalSpreadContextTool: ToolDef = {
  name: "historical_spread_context",
  description:
    "Pull the last 30 days of funding rates for a symbol on HL and Binance (where public funding history endpoints exist) and report the current spread's percentile rank vs history. Answers 'is this spread exceptional or just normal?' Critical context — a 20%/yr spread might look good but be the 30-day mean, while a 5% spread might be 99th-percentile rare.",
  inputSchema: {
    type: "object",
    properties: {
      symbol: { type: "string", description: "Base symbol e.g. 'BTC'." },
      days: { type: "number", default: 30, description: "History window, default 30 days." },
    },
    required: ["symbol"],
  },
};

const inputSchema = z.object({
  symbol: z.string().min(1),
  days: z.number().int().min(1).max(90).default(30),
});

interface RateSample {
  time: number;
  rate: number;
}

async function fetchHlHistory(symbol: string, startMs: number): Promise<RateSample[]> {
  const res = await fetch("https://api.hyperliquid.xyz/info", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      type: "fundingHistory",
      coin: symbol,
      startTime: startMs,
    }),
  });
  if (!res.ok) throw new Error(`HL fundingHistory ${res.status}`);
  const rows = (await res.json()) as Array<{ time: number; fundingRate: string }>;
  return rows.map((r) => ({ time: r.time, rate: Number(r.fundingRate) }));
}

async function fetchBinanceHistory(symbol: string, startMs: number): Promise<RateSample[]> {
  const url = `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${encodeURIComponent(symbol)}USDT&startTime=${startMs}&limit=1000`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Binance fundingRate ${res.status}`);
  const rows = (await res.json()) as Array<{ fundingTime: number; fundingRate: string }>;
  return rows.map((r) => ({ time: r.fundingTime, rate: Number(r.fundingRate) }));
}

function stats(values: number[]): {
  n: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  p90: number;
  p99: number;
} {
  if (values.length === 0) {
    return { n: 0, min: 0, max: 0, mean: 0, median: 0, p90: 0, p99: 0 };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const pct = (p: number) =>
    sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return {
    n: values.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean,
    median: pct(50),
    p90: pct(90),
    p99: pct(99),
  };
}

function percentileRank(values: number[], x: number): number {
  if (values.length === 0) return 0;
  let below = 0;
  for (const v of values) if (v <= x) below += 1;
  return (below / values.length) * 100;
}

export async function handleHistoricalSpreadContext(
  rawArgs: Record<string, unknown>,
): Promise<unknown> {
  const { symbol, days } = inputSchema.parse(rawArgs);
  const startMs = Date.now() - days * 24 * 60 * 60 * 1000;

  const [hlRes, binRes] = await Promise.allSettled([
    fetchHlHistory(symbol, startMs),
    fetchBinanceHistory(symbol, startMs),
  ]);

  const hl = hlRes.status === "fulfilled" ? hlRes.value : [];
  const bin = binRes.status === "fulfilled" ? binRes.value : [];

  // HL is hourly (scale to annual %), Binance is 8-hourly (scale to annual %).
  const hlAnnual = hl.map((s) => s.rate * 24 * 365 * 100);
  const binAnnual = bin.map((s) => s.rate * 3 * 365 * 100);

  const hlStats = stats(hlAnnual);
  const binStats = stats(binAnnual);

  const current = {
    hl: hlAnnual[hlAnnual.length - 1] ?? null,
    binance: binAnnual[binAnnual.length - 1] ?? null,
  };

  const spread_series: number[] = [];
  // Join: for each HL sample, find closest Binance sample within ±4h and compute spread.
  for (const hlS of hl) {
    const b = bin.find((x) => Math.abs(x.time - hlS.time) < 4 * 60 * 60 * 1000);
    if (b) spread_series.push((hlS.rate * 24 * 365 - b.rate * 3 * 365) * 100);
  }

  const spreadStats = stats(spread_series);
  const currentSpread =
    current.hl !== null && current.binance !== null ? current.hl - current.binance : null;

  const currentSpreadRank =
    currentSpread !== null && spread_series.length > 0
      ? percentileRank(spread_series.map(Math.abs), Math.abs(currentSpread))
      : null;

  const interpretation =
    currentSpreadRank === null
      ? "Not enough historical data to rank."
      : currentSpreadRank >= 95
        ? `⚡ Current spread is in the top 5% of the last ${days}d — genuinely extreme.`
        : currentSpreadRank >= 80
          ? "📈 Current spread is above the 80th percentile — above average but not peak."
          : currentSpreadRank >= 50
            ? `😐 Current spread is around median of the last ${days}d — nothing special.`
            : "📉 Current spread is below median — smaller than usual.";

  return {
    symbol,
    days,
    current: {
      hl_annual_pct: current.hl === null ? null : Number(current.hl.toFixed(4)),
      binance_annual_pct: current.binance === null ? null : Number(current.binance.toFixed(4)),
      spread_annual_pct: currentSpread === null ? null : Number(currentSpread.toFixed(4)),
      spread_percentile: currentSpreadRank === null ? null : Number(currentSpreadRank.toFixed(2)),
    },
    hl_history: {
      samples: hlStats.n,
      mean_annual_pct: Number(hlStats.mean.toFixed(4)),
      median_annual_pct: Number(hlStats.median.toFixed(4)),
      min_annual_pct: Number(hlStats.min.toFixed(4)),
      max_annual_pct: Number(hlStats.max.toFixed(4)),
    },
    binance_history: {
      samples: binStats.n,
      mean_annual_pct: Number(binStats.mean.toFixed(4)),
      median_annual_pct: Number(binStats.median.toFixed(4)),
      min_annual_pct: Number(binStats.min.toFixed(4)),
      max_annual_pct: Number(binStats.max.toFixed(4)),
    },
    spread_history: {
      samples: spreadStats.n,
      mean_annual_pct: Number(spreadStats.mean.toFixed(4)),
      median_annual_pct: Number(spreadStats.median.toFixed(4)),
      p90_annual_pct: Number(spreadStats.p90.toFixed(4)),
      p99_annual_pct: Number(spreadStats.p99.toFixed(4)),
    },
    interpretation,
    note: "Only HL + Binance have reliable public funding-history APIs. Bybit/OKX/Drift/dYdX history fetchers will land in v0.5.",
  };
}
