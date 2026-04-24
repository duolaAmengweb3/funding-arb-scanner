"use client";
import { useCallback, useState } from "react";
import { type Lang, strings } from "./i18n";

const REPO_URL = "https://github.com/duolaAmengweb3/funding-arb-scanner";

const CLAUDE_DESKTOP_CONFIG = `{
  "mcpServers": {
    "funding-arb-scanner": {
      "command": "npx",
      "args": ["@cexagent/funding-arb-scanner"]
    }
  }
}`;

const CURSOR_CONFIG = "mcp add @cexagent/funding-arb-scanner";

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [installTab, setInstallTab] = useState<"claude" | "cursor">("claude");
  const t = strings[lang];

  return (
    <main className="page">
      <nav className="nav">
        <div className="container nav-inner">
          <div className="logo">
            <span className="logo-dot" />
            <span>funding-arb-scanner</span>
          </div>
          <div className="nav-links">
            <a href="#tools">{t.nav.tools}</a>
            <a href="#install">{t.nav.install}</a>
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <button
              type="button"
              className="lang-toggle"
              onClick={() => setLang(lang === "en" ? "zh" : "en")}
              aria-label="Toggle language"
            >
              {lang === "en" ? "中文" : "EN"}
            </button>
          </div>
        </div>
      </nav>

      <header className="hero container">
        <div className="eyebrow">
          <span className="eyebrow-dot" />
          <span>{t.hero.eyebrow}</span>
        </div>
        <h1 className="hero-title">
          {t.hero.title}
          <br />
          {t.hero.titleAccent}
        </h1>
        <p className="hero-sub">{t.hero.sub}</p>
        <a href="#install" className="hero-cta">
          {t.hero.cta} →
        </a>
        <div className="hero-cta-sub">{t.hero.ctaSub}</div>
      </header>

      <section className="section container">
        <div className="section-eyebrow">{t.features.eyebrow}</div>
        <h2 className="section-title">{t.features.title}</h2>
        <div className="features">
          {t.features.items.map((f, i) => (
            <div key={f.title} className="feature">
              <div className="feature-num">0{i + 1}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-eyebrow">{t.venues.eyebrow}</div>
        <h2 className="section-title">{t.venues.title}</h2>
        <p className="section-lead">{t.venues.lead}</p>
        <div className="modules">
          {t.venues.items.map((v) => (
            <div key={v.name} className="module">
              <div className="module-header">
                <span className="module-name">{v.name}</span>
                <span className="module-count">{v.ready ? "live" : "soon"}</span>
              </div>
              <ul className="module-tools">
                <li className={v.ready ? "ready" : "pending"}>{v.period}</li>
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="tools" className="section container">
        <div className="section-eyebrow">{t.tools.eyebrow}</div>
        <h2 className="section-title">{t.tools.title}</h2>
        <div className="examples">
          {t.tools.items.map((tool) => (
            <div key={tool.name} className="example">
              <div className="example-avatar">T</div>
              <div>
                <div className="example-q">
                  <code>{tool.name}()</code>
                </div>
                <span className="example-tool">{tool.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="install" className="section container">
        <div className="section-eyebrow">{t.install.eyebrow}</div>
        <h2 className="section-title">{t.install.title}</h2>
        <p className="section-lead">{t.install.lead}</p>

        <div className="install-tabs">
          <button
            type="button"
            className={`install-tab ${installTab === "claude" ? "active" : ""}`}
            onClick={() => setInstallTab("claude")}
          >
            {t.install.claudeDesktop}
          </button>
          <button
            type="button"
            className={`install-tab ${installTab === "cursor" ? "active" : ""}`}
            onClick={() => setInstallTab("cursor")}
          >
            {t.install.cursor}
          </button>
        </div>

        {installTab === "claude" ? (
          <>
            <div className="install-path">
              <span className="mono">{t.install.path}</span>
            </div>
            <CodeBlock
              code={CLAUDE_DESKTOP_CONFIG}
              copyLabel={t.install.copy}
              copiedLabel={t.install.copied}
            />
          </>
        ) : (
          <CodeBlock
            code={CURSOR_CONFIG}
            copyLabel={t.install.copy}
            copiedLabel={t.install.copied}
          />
        )}
      </section>

      <section className="section container">
        <div className="section-eyebrow">{t.privacy.eyebrow}</div>
        <h2 className="section-title">{t.privacy.title}</h2>
        <div className="privacy">
          <strong>privacy_policy.txt</strong>
          <br />
          <br />
          {t.privacy.body}
        </div>
      </section>

      <footer className="footer container">
        <div className="footer-inner">
          <div className="footer-left">
            {t.footer.matrix} · {t.footer.license}
          </div>
          <div className="footer-right">
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="https://hyperliquid-radar.vercel.app" target="_blank" rel="noreferrer">
              hyperliquid-radar
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function CodeBlock({
  code,
  copyLabel,
  copiedLabel,
}: {
  code: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  }, [code]);

  return (
    <div className="code-block">
      <pre>
        <code>{code}</code>
      </pre>
      <button type="button" className={`copy-btn ${copied ? "copied" : ""}`} onClick={copy}>
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}
