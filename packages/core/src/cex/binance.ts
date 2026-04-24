import type { FundingRate } from "../types.js";

export async function getBinanceAllFunding(): Promise<FundingRate[]> {
  const res = await fetch("https://fapi.binance.com/fapi/v1/premiumIndex");
  if (!res.ok) throw new Error(`Binance premiumIndex ${res.status}`);
  const data = (await res.json()) as Array<{
    symbol: string;
    lastFundingRate: string;
    nextFundingTime: number;
    markPrice: string;
  }>;
  return data
    .filter((d) => d.symbol.endsWith("USDT"))
    .map((d) => {
      const ratePer8h = Number(d.lastFundingRate);
      return {
        venue: "binance" as const,
        symbol: d.symbol.replace(/USDT$/, ""),
        annual_pct: ratePer8h * 3 * 365 * 100,
        raw_rate: ratePer8h,
        period_hours: 8,
        mark_price: Number(d.markPrice),
        next_funding_time: d.nextFundingTime,
      };
    });
}
