export type Lang = "en" | "zh";

export interface Venue {
  name: string;
  period: string;
  ready: boolean;
}

export interface Strings {
  nav: { tools: string; install: string };
  hero: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    sub: string;
    cta: string;
    ctaSub: string;
  };
  features: { eyebrow: string; title: string; items: Array<{ title: string; desc: string }> };
  venues: { eyebrow: string; title: string; lead: string; items: Venue[] };
  tools: { eyebrow: string; title: string; items: Array<{ name: string; desc: string }> };
  install: {
    eyebrow: string;
    title: string;
    lead: string;
    claudeDesktop: string;
    cursor: string;
    path: string;
    copy: string;
    copied: string;
  };
  privacy: { eyebrow: string; title: string; body: string };
  footer: { matrix: string; license: string };
}

const venuesEn: Venue[] = [
  { name: "Hyperliquid", period: "1h funding", ready: true },
  { name: "Binance USDT-M", period: "8h funding", ready: true },
  { name: "Bybit linear", period: "8h funding", ready: true },
  { name: "OKX SWAP", period: "8h funding", ready: true },
  { name: "dYdX v4", period: "1h funding", ready: true },
  { name: "Drift", period: "1h funding", ready: true },
  { name: "Vertex", period: "1h funding", ready: true },
  { name: "Paradex", period: "8h funding", ready: true },
  { name: "Aevo", period: "1h funding", ready: true },
  { name: "GMX v2", period: "borrow-style", ready: false },
  { name: "Lighter", period: "1h funding", ready: false },
];
const venuesZh: Venue[] = [
  { name: "Hyperliquid", period: "每小时 funding", ready: true },
  { name: "Binance USDT-M", period: "每 8 小时 funding", ready: true },
  { name: "Bybit 线性合约", period: "每 8 小时 funding", ready: true },
  { name: "OKX SWAP", period: "每 8 小时 funding", ready: true },
  { name: "dYdX v4", period: "每小时 funding", ready: true },
  { name: "Drift", period: "每小时 funding", ready: true },
  { name: "Vertex", period: "每小时 funding", ready: true },
  { name: "Paradex", period: "每 8 小时 funding", ready: true },
  { name: "Aevo", period: "每小时 funding", ready: true },
  { name: "GMX v2", period: "借贷费率", ready: false },
  { name: "Lighter", period: "每小时 funding", ready: false },
];

export const strings: Record<Lang, Strings> = {
  en: {
    nav: { tools: "Tools", install: "Install" },
    hero: {
      eyebrow: "v0.4.0 · cexagent · MIT open source",
      title: "Gross spread is a lie.",
      titleAccent: "We show you the NET.",
      sub: "Every other funding scanner hands you a gross spread and calls it done. Reality: $10k on BTC between HL (10.9%/yr) and Paradex (6.3%/yr) held 24h shows +$1.26 gross but costs $19 in fees — NET loss $18. We model round-trip taker fees across 9 venues and tell you the break-even hold time. No one else does.",
      cta: "Install in 30 seconds",
      ctaSub: "stdio MCP · Node 20+ · zero user data",
    },
    features: {
      eyebrow: "Why it exists",
      title: "The first funding scanner with a judgment layer.",
      items: [
        {
          title: "NET, not gross",
          desc: "estimate_full_cost(symbol, size, hold_hours) → gross, round-trip taker fees per venue, NET USD, break-even hours. A 4.6%/yr spread can be a NET loss — and you need to see that BEFORE opening the trade.",
        },
        {
          title: "9 venues, one call",
          desc: "HL + Binance + Bybit + OKX + dYdX + Drift + Vertex + Paradex + Aevo. kukapay covers CEX only. Coinglass is a web dashboard at $29/mo. We're a free MCP call inside your agent.",
        },
        {
          title: "Historical percentile",
          desc: "Is this spread extreme or just normal? historical_spread_context ranks the current spread against 30 days of history (p90, p99). A 5%/yr 99th-percentile spread beats a 20%/yr spread that's been there for weeks.",
        },
      ],
    },
    venues: {
      eyebrow: "Venue coverage",
      title: "9 live, 2 on deck.",
      lead: "Each venue wraps its own rate limit and auth story. We normalize all funding periods to annual %, so 'HL 1h vs Binance 8h' is no longer a trap.",
      items: venuesEn,
    },
    tools: {
      eyebrow: "Tools",
      title: "7 tools, 4 of them judgment-layer.",
      items: [
        {
          name: "estimate_full_cost",
          desc: "THE KEY ONE. Input symbol + size + hold window, get NET PnL after round-trip taker fees per venue. Returns gross, fees, NET USD, and break-even hours. Answers 'will I actually make money on this arb'.",
        },
        {
          name: "detect_funding_anomalies",
          desc: "Scan 9 venues × 600+ symbols for extremes. Returns single-side extremes (crazy carry on one venue), widest cross-venue spreads, and widest coverage symbols (best arb liquidity).",
        },
        {
          name: "historical_spread_context",
          desc: "Pull 30d of HL + Binance funding history, percentile-rank the current spread. Tells you if 'today's 4.6%' is 50th or 99th percentile.",
        },
        {
          name: "funding_schedule",
          desc: "Next funding time on each venue for a symbol. Enter right before a CEX 8h stamp on the receiving side = lump-sum payout in 8h.",
        },
        {
          name: "scan_funding_diff",
          desc: "Sweep every venue, return every opportunity above a spread threshold. Sorted by annual %.",
        },
        {
          name: "get_pair_funding",
          desc: "Show all venues' current funding for one symbol. Quick sanity check before you trade.",
        },
        {
          name: "estimate_arb_pnl",
          desc: "For a symbol + size, estimate GROSS expected PnL at 8h / 24h / 7d / 30d / annual horizons (no fees). Use estimate_full_cost instead for the real answer.",
        },
      ],
    },
    install: {
      eyebrow: "Install",
      title: "Paste one line. Restart. Done.",
      lead: "Runs locally as a subprocess of your agent. Your requests hit exchange APIs directly — nothing routes through our servers.",
      claudeDesktop: "Claude Desktop",
      cursor: "Cursor",
      path: "~/Library/Application Support/Claude/claude_desktop_config.json",
      copy: "Copy",
      copied: "Copied",
    },
    privacy: {
      eyebrow: "Privacy",
      title: "Zero backend. Zero data.",
      body: "The MCP server is a subprocess of your agent. We don't run a backend. We see zero requests. No accounts, no login, no telemetry, nothing to leak. Source on GitHub, MIT.",
    },
    footer: {
      matrix: "Part of cexagent — a matrix of agent-native crypto tools.",
      license: "MIT License.",
    },
  },
  zh: {
    nav: { tools: "工具", install: "安装" },
    hero: {
      eyebrow: "v0.4.0 · cexagent 矩阵 · MIT 开源",
      title: "毛 spread 是骗人的。",
      titleAccent: "我们算净值给你看。",
      sub: "所有其他 funding 扫描器给你一个毛 spread 就结束。现实:BTC 在 HL(10.9%/年)和 Paradex(6.3%/年)之间,$10k 持 24h 毛收 $1.26,手续费 $19,净亏 $18。我们给 9 家交易所的 taker fee 建模,告诉你 break-even 需要持多久。没第二个做到这件事。",
      cta: "30 秒装好",
      ctaSub: "stdio MCP · Node 20+ · 零用户数据",
    },
    features: {
      eyebrow: "为什么做它",
      title: "第一个带判断层的 funding 扫描器。",
      items: [
        {
          title: "算净值,不是毛值",
          desc: "estimate_full_cost(symbol, size, hold_hours) 返回毛值、各家 taker fee 往返、NET 美元净值、break-even 小时数。4.6%/年的毛 spread 可能是净亏 —— 下单前就得看到这个。",
        },
        {
          title: "9 家交易所,一次调用",
          desc: "HL + Binance + Bybit + OKX + dYdX + Drift + Vertex + Paradex + Aevo。kukapay 只管 CEX,Coinglass 仪表盘 $29/月,我们是 agent 里一次免费的工具调用。",
        },
        {
          title: "历史百分位",
          desc: "当前 spread 是极端还是平常?historical_spread_context 用 30 天 HL + Binance 数据给你算百分位(p90 / p99)。5%/年的 99 分位 spread 比 20%/年放了几周的 spread 好做。",
        },
      ],
    },
    venues: {
      eyebrow: "覆盖的交易所",
      title: "9 家上线 · 2 家在途。",
      lead: "每家的限速和签名规则都不同,我们全封装。所有 funding period 都归一化到年化 %,HL 每小时 vs Binance 8 小时不再是陷阱。",
      items: venuesZh,
    },
    tools: {
      eyebrow: "工具",
      title: "7 个工具,4 个是判断层。",
      items: [
        {
          name: "estimate_full_cost",
          desc: "核心工具。输入 symbol + 名义 size + 持仓时长,返回扣完 taker fee 后的 NET 美元净值 + break-even 小时数。回答「这单做下去到底赚不赚」。",
        },
        {
          name: "detect_funding_anomalies",
          desc: "扫 9 家 × 600+ 合约找异常。返回单边极值(某家 funding 爆表)、最大跨家价差、覆盖最广的 symbol(套利流动性最好)。",
        },
        {
          name: "historical_spread_context",
          desc: "拉 30 天 HL + Binance funding 历史,给当前 spread 打百分位。告诉你「今天这 4.6%」是 50 分位还是 99 分位。",
        },
        {
          name: "funding_schedule",
          desc: "某 symbol 在各家的下次 funding 时间。进场前如果正好收 funding 的一边马上到点,可以立刻拿一笔。",
        },
        {
          name: "scan_funding_diff",
          desc: "扫所有交易所所有标的,返回 spread 超过阈值的机会,按年化 % 排序。",
        },
        {
          name: "get_pair_funding",
          desc: "给定一个 symbol,显示所有交易所的当前 funding。下单前快速校验。",
        },
        {
          name: "estimate_arb_pnl",
          desc: "给定 symbol + 名义 size,估算 8h / 24h / 7d / 30d / 年化的毛 PnL(不扣手续费)。看真实赚不赚用 estimate_full_cost。",
        },
      ],
    },
    install: {
      eyebrow: "安装",
      title: "粘一行。重启。完事。",
      lead: "MCP server 作为你 agent 的子进程在本地跑,请求直接打交易所公开 API,不经过我们任何服务器。",
      claudeDesktop: "Claude Desktop",
      cursor: "Cursor",
      path: "~/Library/Application Support/Claude/claude_desktop_config.json",
      copy: "复制",
      copied: "已复制",
    },
    privacy: {
      eyebrow: "隐私",
      title: "零后端。零数据。",
      body: "MCP server 跑在你 agent 的子进程里。我们没有后端、看不到任何请求、不注册不登录不埋点,没有任何数据可被泄露。代码 MIT,GitHub 可查。",
    },
    footer: {
      matrix: "cexagent 矩阵成员 —— 一组 agent-native 的加密工具。",
      license: "MIT License.",
    },
  },
};
