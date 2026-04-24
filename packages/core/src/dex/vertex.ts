import type { FundingRate } from "../types.js";

/**
 * Vertex Protocol — hybrid orderbook perp on Arbitrum + Mantle + Base.
 * Public market-data gateway, no auth.
 *
 * Funding on Vertex is continuous and settled per-second. The `funding_rate_x18`
 * field is a 1e18-scaled hourly funding rate. We multiply by 24*365 to annualize.
 *
 * Endpoint docs: https://docs.vertexprotocol.com/developer-resources/api/gateway/queries
 */
interface VertexMarketData {
  product_id?: number;
  symbol?: string;
  book_info?: { funding_rate_x18?: string };
  funding_rate_x18?: string;
  mark_price?: string;
  index_price?: string;
  oracle_price_x18?: string;
}

export async function getVertexAllFunding(): Promise<FundingRate[]> {
  // Vertex exposes a REST gateway that supports a `all_products` style query via POST.
  const res = await fetch("https://gateway.prod.vertexprotocol.com/v1/query", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ type: "all_products" }),
  });
  if (!res.ok) throw new Error(`Vertex gateway ${res.status}`);
  const data = (await res.json()) as {
    data?: {
      perp_products?: Array<{ product_id: number; state: { symbol?: string } & VertexMarketData }>;
    };
    status?: string;
  };

  const perps = data.data?.perp_products ?? [];
  const out: FundingRate[] = [];
  for (const p of perps) {
    const state = p.state ?? {};
    const rateStr = state.funding_rate_x18 ?? state.book_info?.funding_rate_x18;
    if (!rateStr) continue;
    // funding_rate_x18 is hourly rate scaled by 1e18.
    const ratePerHour = Number(rateStr) / 1e18;
    if (!Number.isFinite(ratePerHour)) continue;
    // Symbol usually "BTC-PERP" or similar.
    const sym = (state.symbol ?? "").replace(/-PERP$/i, "").replace(/USDC$/, "");
    if (!sym) continue;
    out.push({
      venue: "vertex",
      symbol: sym,
      annual_pct: ratePerHour * 24 * 365 * 100,
      raw_rate: ratePerHour,
      period_hours: 1,
      mark_price: state.mark_price ? Number(state.mark_price) : undefined,
    });
  }
  return out;
}
