# mcp-gateway

Satu repo, dua server MCP terpisah — masing-masing untuk satu proyek pribadi yang sudah punya API publik.

- `/enki/mcp` — **enkimcp**, tools untuk [igscheduler](https://enki.gutivanian.id)
- `/hive/mcp` — **hivemcp**, tools untuk [wa-gateway-go](https://hive.gutivanian.id)

Keduanya berjalan lewat `mcp-handler` (stateless, Streamable HTTP) dan di-deploy di Vercel. Tiap endpoint dilindungi token bearer sendiri (`ENKI_MCP_TOKEN` / `HIVE_MCP_TOKEN`) — client MCP (Claude Desktop/Code, dll) harus kirim header `Authorization: Bearer <token>` saat connect. Token ini terpisah dari API key backend (`ENKI_API_KEY` / `HIVE_API_KEY`), yang hanya dipakai gateway ini secara internal dan tidak pernah diteruskan ke client.

## Setup

```bash
npm install
cp .env.example .env.local
# isi .env.local dengan nilai asli
npm run dev
```

Generate token gateway (`ENKI_MCP_TOKEN`, `HIVE_MCP_TOKEN`):

```bash
openssl rand -hex 32
```

## Env vars

| Var | Keterangan |
| --- | --- |
| `ENKI_API_KEY` | API key global igscheduler (`igsk_...`), dibuat dari dashboard igscheduler. |
| `ENKI_BASE_URL` | Default `https://enki.gutivanian.id`. |
| `ENKI_MCP_TOKEN` | Bearer token yang harus dikirim client saat connect ke `/enki/mcp`. |
| `HIVE_API_KEY` | API key wa-gateway-go, dibuat dari dashboard-nya dengan scope `sessions:read`, `messages:send`, `messages:read`. |
| `HIVE_BASE_URL` | Default `https://hive.gutivanian.id`. |
| `HIVE_MCP_TOKEN` | Bearer token yang harus dikirim client saat connect ke `/hive/mcp`. |

## Deploy

```bash
vercel --prod
```

Set semua env var di atas lewat Vercel dashboard atau `vercel env add` sebelum deploy pertama.
