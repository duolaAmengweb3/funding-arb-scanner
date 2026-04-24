import type { FundingRate } from "../types.js";

export async function getOkxAllFunding(): Promise<FundingRate[]> {
  const instRes = await fetch("https://www.okx.com/api/v5/public/instruments?instType=SWAP");
  if (!instRes.ok) throw new Error(`OKX instruments ${instRes.status}`);
  const instJson = (await instRes.json()) as {
    data?: Array<{ instId: string; settleCcy: string }>;
  };
  const usdtSwaps = (instJson.data ?? []).filter(
    (i) => i.settleCcy === "USDT" && i.instId.endsWith("-USDT-SWAP"),
  );

  const out: FundingRate[] = [];
  const concurrency = 20;
  for (let i = 0; i < usdtSwaps.length; i += concurrency) {
    const chunk = usdtSwaps.slice(i, i + concurrency);
    const rs = await Promise.allSettled(
      chunk.map(async (d) => {
        const r = await fetch(
          `https://www.okx.com/api/v5/public/funding-rate?instId=${encodeURIComponent(d.instId)}`,
        );
        if (!r.ok) throw new Error(`OKX ${r.status}`);
        const j = (await r.json()) as {
          data?: Array<{ fundingRate: string; nextFundingTime: string }>;
        };
        const row = j.data?.[0];
        if (!row) return null;
        const rate = Number(row.fundingRate);
        return {
          venue: "okx" as const,
          symbol: d.instId.replace(/-USDT-SWAP$/, ""),
          annual_pct: rate * 3 * 365 * 100,
          raw_rate: rate,
          period_hours: 8,
          next_funding_time: Number(row.nextFundingTime),
        } satisfies FundingRate;
      }),
    );
    for (const r of rs) {
      if (r.status === "fulfilled" && r.value) out.push(r.value);
    }
  }
  return out;
}
