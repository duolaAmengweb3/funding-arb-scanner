import type { FundingRate } from "../types.js";

export async function getBybitAllFunding(): Promise<FundingRate[]> {
  const res = await fetch("https://api.bybit.com/v5/market/tickers?category=linear");
  if (!res.ok) throw new Error(`Bybit tickers ${res.status}`);
  const data = (await res.json()) as {
    result?: {
      list?: Array<{
        symbol: string;
        fundingRate: string;
        nextFundingTime: string;
        markPrice: string;
      }>;
    };
  };
  const list = data.result?.list ?? [];
  return list
    .filter((r) => r.symbol.endsWith("USDT"))
    .map((r) => {
      const ratePer8h = Number(r.fundingRate);
      return {
        venue: "bybit" as const,
        symbol: r.symbol.replace(/USDT$/, ""),
        annual_pct: ratePer8h * 3 * 365 * 100,
        raw_rate: ratePer8h,
        period_hours: 8,
        mark_price: Number(r.markPrice),
        next_funding_time: Number(r.nextFundingTime),
      };
    });
}
