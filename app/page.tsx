import { ConduitDiagram } from '@/components/ConduitDiagram'
import { MarketingNav } from '@/components/MarketingNav'

export default function Home() {
  return (
    <>
      <MarketingNav />

      <header className="hero container">
        <div className="hero__grid">
          <div>
            <span className="hero__eyebrow">self-hosted · open endpoints</span>
            <h1>
              Turn any API into an <span className="accent">MCP server</span>.
            </h1>
            <p className="hero__sub">
              Point Conduit at your REST API, describe the tools, and get a live MCP endpoint —
              no new backend, no redeploys when the tool list changes.
            </p>
          </div>
          <ConduitDiagram />
        </div>
      </header>

      <div className="container">
        <div className="hero-cta">
          <a className="btn btn-primary" href="/register">Get started free</a>
          <a className="btn btn-outline" href="#how-it-works">See how it works</a>
          <span className="hero-cta__note">Postgres-backed · token-gated · deploys on Vercel</span>
        </div>
      </div>

      <section className="section container" id="how-it-works">
        <div className="section-head">
          <span className="section-head__kicker">how it works</span>
          <h2>Three steps, no deploy.</h2>
          <p>Define tools once, clone an existing connector, or build one from scratch.</p>
        </div>
        <div className="steps">
          <div className="step">
            <h3>Define your tools</h3>
            <p>
              Name each tool, describe its inputs, and point it at an HTTP endpoint — path, query,
              and body parameters included.
            </p>
          </div>
          <div className="step">
            <h3>Conduit hosts it</h3>
            <p>
              Your gateway lives at its own slug, backed by Postgres. Credentials stay encrypted,
              server-side only.
            </p>
          </div>
          <div className="step">
            <h3>Connect your client</h3>
            <p>
              Paste the MCP URL and bearer token into Claude, or any MCP-compatible client, and
              start calling tools.
            </p>
          </div>
        </div>
      </section>

      <section className="section container" id="features">
        <div className="section-head">
          <span className="section-head__kicker">features</span>
          <h2>Built for APIs you already run.</h2>
        </div>
        <div className="bento">
          <div className="bento-tile bento-tile--wide">
            <h3>No-code tool builder</h3>
            <p>
              Every tool is a name, an input schema, and an HTTP call spec — path, query, and body
              parameters mapped from a plain field list. No redeploy to add or change a tool.
            </p>
          </div>
          <div className="bento-tile">
            <h3>Clone a template</h3>
            <p>Start from a public connector with your own credentials, or build one from scratch.</p>
          </div>
          <div className="bento-tile">
            <h3>Encrypted credentials</h3>
            <p>Backend API keys are encrypted at rest and decrypted only server-side, per call.</p>
          </div>
          <div className="bento-tile">
            <h3>Per-gateway tokens</h3>
            <p>Each MCP endpoint has its own bearer token — revoke and regenerate independently.</p>
          </div>
          <div className="bento-tile">
            <h3>Multi-tenant by design</h3>
            <p>Every account gets its own gateways. Nothing is shared unless you clone it.</p>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="cta-strip">
          <h2>Your API is already an MCP server. It just doesn&apos;t know it yet.</h2>
          <a className="btn btn-primary" href="/register">Create your first gateway</a>
        </div>
      </section>

      <footer className="footer container">
        <div className="footer__row">
          <span>Conduit · built on Next.js</span>
          <div className="footer__links">
            <a href="/login">Sign in</a>
            <a href="https://github.com/gutivanian/MCP-Gateway" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}
