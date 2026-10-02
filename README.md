# Conduit

Turn any REST API into an MCP server — no code, no redeploy. Define tools from a dashboard (name, input schema, HTTP call spec), and Conduit serves them at `/mcp/<slug>`, backed by Postgres.

- Multi-user: email/password accounts, each with their own gateways.
- **Templates**: public, reusable tool-set blueprints (e.g. `enki` for igscheduler, `hive` for wa-gateway-go). Anyone can clone one into their own gateway with their own credentials.
- **Custom gateways**: build a tool list from scratch via a JSON editor in the dashboard.
- Each gateway has its own bearer token (`cndt_...`) for MCP clients, independent of the backend API key it calls.
- Backend credentials are encrypted at rest (AES-256-GCM) and decrypted only server-side, per call.

## Setup

```bash
npm install
cp .env.example .env.local
# fill in .env.local
```

Apply the schema to your Postgres database:

```bash
# psql, or any Postgres client, against DATABASE_URL
psql "$DATABASE_URL" -f db/schema.sql
```

Seed the `enki`/`hive` templates and the first owner account:

```bash
CONDUIT_SEED_ADMIN_PASSWORD=... CONDUIT_SEED_ENKI_KEY=igsk_... npm run db:seed
```

This prints the MCP bearer tokens for the seeded `enki` and `hive` gateways once — save them. `hive`'s credential defaults to a placeholder until `CONDUIT_SEED_HIVE_KEY` is set (or edited later via the dashboard).

```bash
npm run dev
```

## Env vars

See `.env.example`. `DATABASE_URL` + `DB_CA_CERT` for Postgres (CA as a literal PEM string, not a file), `CONDUIT_JWT_SECRET` for user sessions, `CONDUIT_ENCRYPTION_KEY` for credential encryption at rest.

## Deploy

```bash
vercel --prod
```

Set the env vars above in the Vercel project before the first deploy. Run the seed script once against the production database (locally, pointed at the prod `DATABASE_URL`, or via a one-off script run).

## How an MCP call is handled

`app/mcp/[slug]/route.ts` looks up the gateway by slug, checks the bearer token (`sha256` against the stored hash), loads its `gateway_tools` rows, and registers each as an MCP tool with a zod schema built from the stored field list (`lib/tool-schema.ts`). Calling a tool runs `lib/connector.ts`: substitutes `{{input.X}}` / `{{credentials.X}}` into the tool's path template, builds query/body from the field list, applies the gateway's auth header, and calls the backend.
