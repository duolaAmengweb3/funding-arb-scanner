import type { FundingRate } from "./types.js";

export async function getHlAllFunding(): Promise<FundingRate[]> {
  const res = await fetch("https://api.hyperliquid.xyz/info", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ type: "metaAndAssetCtxs" }),
  });
  if (!res.ok) throw new Error(`HL info ${res.status}`);
  const [meta, ctxs] = (await res.json()) as [
    { universe: Array<{ name: string }> },
    Array<{ funding: string; markPx: string }>,
  ];
  return meta.universe.map((u, i) => {
    const rate = Number(ctxs[i].funding);
    return {
      venue: "hyperliquid" as const,
      symbol: u.name,
      annual_pct: rate * 24 * 365 * 100,
      raw_rate: rate,
      period_hours: 1,
      mark_price: Number(ctxs[i].markPx),
    } satisfies FundingRate;
  });
}
