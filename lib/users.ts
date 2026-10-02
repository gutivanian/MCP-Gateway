import { query, queryOne } from './db'
import type { UserRow } from './types'

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  return queryOne<UserRow>('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()])
}

export async function findUserById(id: number): Promise<UserRow | null> {
  return queryOne<UserRow>('SELECT * FROM users WHERE id = $1', [id])
}

export async function createUser(email: string, passwordHash: string, name?: string): Promise<UserRow> {
  const rows = await query<UserRow>(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *',
    [email.toLowerCase().trim(), passwordHash, name ?? null]
  )
  return rows[0]
}
