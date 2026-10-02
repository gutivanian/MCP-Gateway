export function ConduitDiagram() {
  return (
    <svg
      className="hero__diagram"
      viewBox="0 0 360 260"
      fill="none"
      role="img"
      aria-label="Diagram: a REST API connects through Conduit to an MCP client"
    >
      <defs>
        <linearGradient id="conduit-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <rect x="16" y="110" width="96" height="48" rx="8" fill="#0D1B2A" stroke="#1D3A50" />
      <text x="64" y="138" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono-raw), monospace" fill="#8CA3B5">
        your API
      </text>

      <rect x="132" y="98" width="96" height="72" rx="10" fill="#13263A" stroke="#06B6D4" strokeWidth="1.5" />
      <text x="180" y="130" textAnchor="middle" fontSize="12" fontFamily="var(--font-display-raw), sans-serif" fill="#E6F1F5" fontWeight={600}>
        Conduit
      </text>
      <text x="180" y="148" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono-raw), monospace" fill="#8CA3B5">
        /mcp/your-slug
      </text>

      <rect x="248" y="110" width="96" height="48" rx="8" fill="#0D1B2A" stroke="#1D3A50" />
      <text x="296" y="138" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono-raw), monospace" fill="#8CA3B5">
        MCP client
      </text>

      <path d="M112 134 H132" stroke="url(#conduit-line)" strokeWidth="2" />
      <path d="M228 134 H248" stroke="url(#conduit-line)" strokeWidth="2" />

      <circle cx="122" cy="134" r="3" fill="#06B6D4" />
      <circle cx="238" cy="134" r="3" fill="#14B8A6" />
    </svg>
  )
}
