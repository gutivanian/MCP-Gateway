/**
 * lib/wagateway.ts
 *
 * Client tipis ke API publik wa-gateway-go ("hive") — /api/v1/*. API key asli
 * (wag_...) disimpan di env server (HIVE_API_KEY). Base URL override via
 * HIVE_BASE_URL (default domain publik lewat tunnel Cloudflare).
 */

const BASE_URL = (process.env.HIVE_BASE_URL || 'https://hive.gutivanian.id').replace(/\/$/, '')

class HiveError extends Error {
  constructor(public status: number, body: unknown) {
    super(`Hive API ${status}: ${JSON.stringify(body)}`)
  }
}

async function call<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const apiKey = process.env.HIVE_API_KEY
  if (!apiKey) throw new Error('HIVE_API_KEY belum diset di env server')
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new HiveError(res.status, data ?? {})
  return data as T
}

export interface SendMessageInput {
  sessionId?: string
  to: string
  text?: string
  quotedId?: string
  media?: { url: string; kind: 'image' | 'video' | 'audio' | 'document'; caption?: string; fileName?: string; mimeType?: string }
}

export const hive = {
  me: () => call('/api/v1/me'),

  listSessions: () => call('/api/v1/sessions'),

  sendMessage: (input: SendMessageInput) =>
    call('/api/v1/messages', { method: 'POST', body: JSON.stringify(input) }),
}
