export type Venue =
  | "hyperliquid"
  | "binance"
  | "bybit"
  | "okx"
  | "dydx"
  | "gmx"
  | "drift"
  | "vertex"
  | "paradex"
  | "aevo"
  | "lighter";

export interface FundingRate {
  venue: Venue;
  symbol: string;
  /** Annualized percentage (e.g. 12.5 = 12.5% / year). */
  annual_pct: number;
  /** Raw per-period rate as returned by venue (hourly on HL, 8h on most CEX). */
  raw_rate: number;
  /** Period in hours the raw_rate covers. */
  period_hours: number;
  /** Reference mark price when fetched, if available. */
  mark_price?: number;
  /** Next scheduled funding time (ms epoch), if available. */
  next_funding_time?: number;
}

export interface FundingSpread {
  symbol: string;
  long_at: Venue;
  long_annual_pct: number;
  short_at: Venue;
  short_annual_pct: number;
  spread_annual_pct: number;
  /** Rough annual USD PnL for 1000 USD notional, ignoring fees. */
  annual_pnl_per_1k_usd: number;
}
