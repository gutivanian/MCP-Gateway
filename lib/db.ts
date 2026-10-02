import { Pool, type QueryResultRow } from 'pg'

let pool: Pool | null = null

function buildSsl() {
  if (process.env.DB_SSL === 'false') return undefined
  const ca = process.env.DB_CA_CERT
  if (!ca) throw new Error('DB_CA_CERT belum diset di env')
  return { rejectUnauthorized: true, ca: ca.replace(/\\n/g, '\n') }
}

export function getPool(): Pool {
  if (pool) return pool
  const rawConnectionString = process.env.DATABASE_URL
  if (!rawConnectionString) throw new Error('DATABASE_URL belum diset di env')
  // sslmode di query string dibaca pg-connection-string sebagai verify-full dan menimpa
  // opsi `ssl` eksplisit di bawah (termasuk `ca`-nya) — buang supaya ssl kita yang dipakai.
  const connectionString = rawConnectionString.replace(/([?&])sslmode=[^&]*&?/, '$1').replace(/[?&]$/, '')
  pool = new Pool({
    connectionString,
    ssl: buildSsl(),
    max: Number(process.env.DB_POOL_MAX ?? 5),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
    statement_timeout: 600000,
  })
  return pool
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) {
  const res = await getPool().query<T>(text, params)
  return res.rows
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) {
  const rows = await query<T>(text, params)
  return rows[0] ?? null
}

export async function withTransaction<T>(fn: (client: import('pg').PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
