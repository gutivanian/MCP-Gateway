import { createHash, randomBytes } from 'crypto'

const PREFIX = 'cndt_'

export function generateGatewayToken(): { raw: string; prefix: string; hash: string } {
  const raw = PREFIX + randomBytes(24).toString('hex')
  return { raw, prefix: raw.slice(0, 13), hash: hashToken(raw) }
}

export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}

export function extractBearerToken(req: Request): string | null {
  const header = req.headers.get('authorization') ?? ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : null
}
