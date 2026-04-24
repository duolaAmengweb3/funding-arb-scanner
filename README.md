# funding-arb-scanner

Scan Hyperliquid + CEX (Binance / Bybit / OKX) + DEX perp funding rates for
arbitrage opportunities. Agent-native, zero backend, MIT open source.

**Status**: scaffold — 3/6 tools ready. See [PRD.md](./PRD.md) once written.

## Why

kukapay/funding-rates only covers CEX. Coinglass charges $29/mo. Nobody integrates
HL / dYdX / GMX / Drift / Lighter funding in one agent-callable tool. This does.

## Tools (v0.1)

- `scan_funding_diff(min_bps?)` — sweep HL + Binance + Bybit + OKX on all overlapping symbols, return pairs sorted by spread (net of fees/slippage where possible)
- `get_pair_funding(symbol)` — all venues' current funding for one symbol, annualized
- `estimate_arb_pnl(symbol, size_usdc)` — expected 8h / 24h / annual PnL for a spread trade of the given notional

## Install

### Claude Desktop (stdio, after npm publish)

```json
{
  "mcpServers": {
    "funding-arb-scanner": {
      "command": "npx",
      "args": ["@cexagent/funding-arb-scanner"]
    }
  }
}
```

## Development

```bash
pnpm install
pnpm build
pnpm test
```

Part of [cexagent](https://github.com/duolaAmengweb3/hyperliquid-radar) matrix.

MIT.
