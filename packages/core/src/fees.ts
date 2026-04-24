import type { Venue } from "./types.js";

/**
 * Taker fees (one-way) in basis points (1 bps = 0.01%) for each venue,
 * at the default retail tier. Real fees can be lower for VIP / market-maker
 * status, but for conservative net-PnL estimation we use the default tier.
 *
 * Sources checked 2026-04-25:
 * - Binance USDT-M perp: 0.04% taker / 0.02% maker → 4 bps
 * - Bybit linear: 0.055% taker / 0.02% maker → 5.5 bps
 * - OKX USDT-M swap: 0.05% taker / 0.02% maker → 5 bps
 * - Hyperliquid: 0.045% taker / 0.015% maker → 4.5 bps
 * - dYdX v4: 0.05% taker / 0.02% maker → 5 bps
 * - Drift: 0.10% taker / 0.02% maker → 10 bps
 * - Vertex: 0.02% taker → 2 bps
 * - Paradex: 0.05% taker / 0.01% maker → 5 bps
 * - Aevo: 0.05% taker / 0.03% maker → 5 bps
 * - GMX: 0.05-0.07% position fee → 6 bps avg
 * - Lighter: 0 bps taker → 0 bps
 *
 * NOTE: these are snapshot values — the user should override via the
 * `overrideFees` parameter in estimate_full_cost if their VIP tier differs.
 */
export interface VenueFees {
  /** Taker fee in basis points (entry OR exit, one-way). */
  taker_bps: number;
  /** Maker fee in basis points, one-way. */
  maker_bps: number;
}

export const TAKER_FEES: Record<Venue, VenueFees> = {
  hyperliquid: { taker_bps: 4.5, maker_bps: 1.5 },
  binance: { taker_bps: 4, maker_bps: 2 },
  bybit: { taker_bps: 5.5, maker_bps: 2 },
  okx: { taker_bps: 5, maker_bps: 2 },
  dydx: { taker_bps: 5, maker_bps: 2 },
  drift: { taker_bps: 10, maker_bps: 2 },
  vertex: { taker_bps: 2, maker_bps: 0 },
  paradex: { taker_bps: 5, maker_bps: 1 },
  aevo: { taker_bps: 5, maker_bps: 3 },
  gmx: { taker_bps: 6, maker_bps: 6 },
  lighter: { taker_bps: 0, maker_bps: 0 },
};

export function getVenueFees(venue: Venue): VenueFees {
  return TAKER_FEES[venue];
}

/**
 * Round-trip cost estimate for a delta-neutral funding-arb trade:
 * entry at venue_a + entry at venue_b + exit at venue_a + exit at venue_b.
 * All 4 legs are conservatively assumed to be taker fills.
 *
 * Returns total fee cost in basis points of the notional.
 */
export function roundTripFeeBps(venueA: Venue, venueB: Venue): number {
  const a = TAKER_FEES[venueA];
  const b = TAKER_FEES[venueB];
  // 2 sides × 2 legs (entry + exit) = 4 taker legs total.
  return 2 * a.taker_bps + 2 * b.taker_bps;
}
