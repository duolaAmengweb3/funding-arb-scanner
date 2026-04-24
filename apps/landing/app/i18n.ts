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
  { name: "GMX v2", period: "borrow-style", ready: false },
  { name: "Drift", period: "1h funding", ready: true },
  { name: "Lighter", period: "1h funding", ready: false },
];
const venuesZh: Venue[] = [
  { name: "Hyperliquid", period: "每小时 funding", ready: true },
  { name: "Binance USDT-M", period: "每 8 小时 funding", ready: true },
  { name: "Bybit 线性合约", period: "每 8 小时 funding", ready: true },
  { name: "OKX SWAP", period: "每 8 小时 funding", ready: true },
  { name: "dYdX v4", period: "每小时 funding", ready: true },
  { name: "GMX v2", period: "借贷费率", ready: false },
  { name: "Drift", period: "每小时 funding", ready: true },
  { name: "Lighter", period: "每小时 funding", ready: false },
];

export const strings: Record<Lang, Strings> = {
  en: {
    nav: { tools: "Tools", install: "Install" },
    hero: {
      eyebrow: "Part of cexagent · MIT open source",
      title: "Funding arb,",
      titleAccent: "on autopilot.",
      sub: "Your agent sweeps Hyperliquid + Binance + Bybit + OKX perp funding rates every time you ask, flags the widest spreads, and tells you which venue to long vs short — in plain language. No dashboards. No accounts.",
      cta: "Install in 30 seconds",
      ctaSub: "stdio MCP · Node 20+ · zero user data",
    },
    features: {
      eyebrow: "Why it exists",
      title: "The only scanner that covers HL.",
      items: [
        {
          title: "kukapay stops at CEX",
          desc: "Existing funding tools aggregate Binance / Bybit / OKX only. None integrate Hyperliquid — the largest perp DEX. We start there.",
        },
        {
          title: "Coinglass costs $29/mo",
          desc: "They charge for a dashboard. We're a free MCP call inside your existing agent. No login, no subscription, no tracking.",
        },
        {
          title: "Annualized, not raw",
          desc: "HL funding is hourly, CEX is 8-hourly. We normalize everything to annual % so you can compare apples to apples.",
        },
      ],
    },
    venues: {
      eyebrow: "Venue coverage",
      title: "6 live, 2 coming.",
      lead: "Each venue hits its own rate limit with its own auth story. We wrap all of that. When HL has BTC funding at +40%/yr and Binance at +8%/yr, you see it in one answer.",
      items: venuesEn,
    },
    tools: {
      eyebrow: "Tools",
      title: "Three ways to ask.",
      items: [
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
          desc: "For a symbol + size, estimate expected PnL at 8h / 24h / 7d / 30d / annual horizons.",
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
      eyebrow: "cexagent 矩阵 · MIT 开源",
      title: "Funding 套利",
      titleAccent: "自动扫。",
      sub: "让你的 agent 每次都扫一遍 Hyperliquid + Binance + Bybit + OKX 的 perp funding,找出最大价差,告诉你在哪家做多、在哪家做空。不用开网页,不用注册。",
      cta: "30 秒装好",
      ctaSub: "stdio MCP · Node 20+ · 零用户数据",
    },
    features: {
      eyebrow: "为什么做它",
      title: "唯一覆盖 HL 的扫描器。",
      items: [
        {
          title: "kukapay 只管 CEX",
          desc: "现有的 funding 工具只整合 Binance / Bybit / OKX,没人接 Hyperliquid —— 最大的 perp DEX。我们从这里开始。",
        },
        {
          title: "Coinglass 要 $29/月",
          desc: "他们卖仪表盘,我们是 agent 里一次免费的工具调用。不注册、不订阅、不追踪。",
        },
        {
          title: "年化,不是原始值",
          desc: "HL 是每小时 funding,CEX 是 8 小时。我们全部归一化到年化 %,你才能直接对比。",
        },
      ],
    },
    venues: {
      eyebrow: "覆盖的交易所",
      title: "6 家上线 · 2 家在途。",
      lead: "每家交易所各有限速和签名要求,我们全封装。HL BTC funding +40%/年,Binance +8%/年 —— 你一次看全。",
      items: venuesZh,
    },
    tools: {
      eyebrow: "工具",
      title: "三种问法。",
      items: [
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
          desc: "给定 symbol + 名义 size,估算 8h / 24h / 7d / 30d / 年化的预期 PnL。",
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
