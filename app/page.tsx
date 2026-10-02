export default function Home() {
  return (
    <main style={{ padding: '3rem', maxWidth: 640 }}>
      <h1>mcp-gateway</h1>
      <p>MCP server untuk proyek-proyek pribadi, satu endpoint MCP terpisah per proyek.</p>
      <ul>
        <li>
          <code>/enki/mcp</code> — igscheduler
        </li>
        <li>
          <code>/hive/mcp</code> — wa-gateway-go
        </li>
      </ul>
      <p>Tiap endpoint butuh header <code>Authorization: Bearer &lt;token&gt;</code> (lihat env var masing-masing).</p>
    </main>
  )
}
