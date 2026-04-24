import { describe, expect, it } from "vitest";
import { buildSpreads } from "./scan.js";
import type { FundingRate, Venue } from "./types.js";

describe("buildSpreads", () => {
  it("finds the widest long/short pair", () => {
    const bySymbol = new Map<string, Map<Venue, FundingRate>>();
    bySymbol.set(
      "BTC",
      new Map<Venue, FundingRate>([
        [
          "hyperliquid",
          {
            venue: "hyperliquid",
            symbol: "BTC",
            annual_pct: 5,
            raw_rate: 0.00001,
            period_hours: 1,
          },
        ],
        [
          "binance",
          {
            venue: "binance",
            symbol: "BTC",
            annual_pct: 20,
            raw_rate: 0.0001,
            period_hours: 8,
          },
        ],
        [
          "bybit",
          { venue: "bybit", symbol: "BTC", annual_pct: 12, raw_rate: 0.00005, period_hours: 8 },
        ],
      ]),
    );

    const spreads = buildSpreads(bySymbol);
    expect(spreads).toHaveLength(1);
    expect(spreads[0].long_at).toBe("hyperliquid");
    expect(spreads[0].short_at).toBe("binance");
    expect(spreads[0].spread_annual_pct).toBe(15);
  });

  it("filters out symbols with only one venue", () => {
    const bySymbol = new Map<string, Map<Venue, FundingRate>>();
    bySymbol.set(
      "WEIRD",
      new Map([
        [
          "hyperliquid",
          {
            venue: "hyperliquid" as const,
            symbol: "WEIRD",
            annual_pct: 99,
            raw_rate: 0,
            period_hours: 1,
          },
        ],
      ]),
    );
    expect(buildSpreads(bySymbol)).toHaveLength(0);
  });
});
