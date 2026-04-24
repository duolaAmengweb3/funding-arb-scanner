import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "funding-arb-scanner — cross-venue funding arb for agents",
  description:
    "Scan Hyperliquid + Binance + Bybit + OKX perp funding rates for arbitrage spreads. Agent-native MCP server, zero backend, MIT open source.",
  openGraph: {
    title: "funding-arb-scanner",
    description: "Cross-venue perp funding arb scanner for AI agents. Part of cexagent.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
