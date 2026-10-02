/**
 * lib/igscheduler.ts
 *
 * Client tipis ke API publik igscheduler ("enki") — /api/v1/*. API key asli
 * (igsk_...) disimpan di env server (ENKI_API_KEY), tak pernah terlihat
 * client MCP. Base URL bisa di-override via ENKI_BASE_URL (default domain
 * publik lewat tunnel Cloudflare).
 */

const BASE_URL = (process.env.ENKI_BASE_URL || 'https://enki.gutivanian.id').replace(/\/$/, '')

class EnkiError extends Error {
  constructor(public status: number, body: unknown) {
    super(`Enki API ${status}: ${JSON.stringify(body)}`)
  }
}

async function call<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const apiKey = process.env.ENKI_API_KEY
  if (!apiKey) throw new Error('ENKI_API_KEY belum diset di env server')
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  const data = await res.json().catch(() => null)
  if (!res.ok || data?.success === false) throw new EnkiError(res.status, data ?? {})
  return data?.data as T
}

const qs = (params: Record<string, string | number | boolean | undefined>) => {
  const u = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') u.set(k, String(v))
  const s = u.toString()
  return s ? `?${s}` : ''
}

export interface ListScheduledParams {
  status?: string
  accountId?: string
  from?: string
  to?: string
  limit?: number
  offset?: number
  order?: 'asc' | 'desc'
}

export const enki = {
  listScheduled: (params: ListScheduledParams = {}) =>
    call(`/api/v1/posts/scheduled${qs({ ...params })}`),

  getPost: (id: string) => call(`/api/v1/posts/${encodeURIComponent(id)}`),

  getApprovalStatus: (id: string) => call(`/api/v1/posts/${encodeURIComponent(id)}/approval`),

  listApprovals: (accountId?: string) => call(`/api/v1/approvals${qs({ accountId })}`),

  listFailed: (accountId?: string) => call(`/api/v1/posts/failed${qs({ accountId })}`),

  retryPost: (id: string, mode: 'current' | 'local' = 'current') =>
    call(`/api/v1/posts/${encodeURIComponent(id)}/retry`, {
      method: 'POST',
      body: JSON.stringify({ mode }),
    }),

  reschedulePost: (id: string, scheduledAt: string) =>
    call(`/api/v1/posts/${encodeURIComponent(id)}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduledAt }),
    }),

  createInstagramXml: (xmlContent: string, accountId?: string) =>
    call('/api/v1/posts/instagram/xml', {
      method: 'POST',
      body: JSON.stringify({ xmlContent, accountId }),
    }),

  createThreadsXml: (threadXml: string, accountId?: string) =>
    call('/api/v1/posts/threads/xml', {
      method: 'POST',
      body: JSON.stringify({ threadXml, accountId }),
    }),

  checkSimilar: (text: string) =>
    call('/api/v1/similar', { method: 'POST', body: JSON.stringify({ text }) }),
}
