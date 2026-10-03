import { decryptCredentials } from './crypto'
import type { GatewayRow, GatewayToolRow, ToolRowShape } from './types'

export class ConnectorError extends Error {
  constructor(public status: number, public body: unknown) {
    super(`Backend error ${status}: ${JSON.stringify(body)}`)
  }
}

function getDotPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined || typeof acc !== 'object') return undefined
    return (acc as Record<string, unknown>)[key]
  }, obj)
}

function setDotPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]
    if (typeof cur[key] !== 'object' || cur[key] === null) cur[key] = {}
    cur = cur[key] as Record<string, unknown>
  }
  cur[parts[parts.length - 1]] = value
}

const TOKEN_RE = /\{\{\s*(input|credentials)\.([\w]+)\s*\}\}/g

function substitute(template: string, input: Record<string, unknown>, credentials: Record<string, string>, encode: boolean): string {
  return template.replace(TOKEN_RE, (_match, ns: string, key: string) => {
    const raw = ns === 'input' ? input[key] : credentials[key]
    const value = raw === undefined || raw === null ? '' : String(raw)
    return encode ? encodeURIComponent(value) : value
  })
}

export async function executeTool(
  gateway: Pick<GatewayRow, 'base_url' | 'credentials' | 'auth_header_name' | 'auth_header_value_template' | 'success_path'>,
  tool: Pick<GatewayToolRow | ToolRowShape, 'path_template' | 'input_fields' | 'http_method' | 'response_path'>,
  args: Record<string, unknown>
): Promise<unknown> {
  const credentials = decryptCredentials(gateway.credentials)

  for (const f of tool.input_fields) {
    if (args[f.key] === undefined && f.default !== undefined) args = { ...args, [f.key]: f.default }
  }

  const path = substitute(tool.path_template, args, credentials, true)

  const query = new URLSearchParams()
  for (const f of tool.input_fields.filter((f) => f.in === 'query')) {
    const v = args[f.key]
    if (v !== undefined && v !== '') query.set(f.key, String(v))
  }
  const qs = query.toString()

  const bodyFields = tool.input_fields.filter((f) => f.in === 'body')
  let body: string | undefined
  if (bodyFields.length) {
    const obj: Record<string, unknown> = {}
    for (const f of bodyFields) {
      const v = args[f.key]
      if (v !== undefined) setDotPath(obj, f.bodyPath || f.key, v)
    }
    body = JSON.stringify(obj)
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (gateway.auth_header_value_template) {
    headers[gateway.auth_header_name] = substitute(gateway.auth_header_value_template, {}, credentials, false)
  }

  const url = `${gateway.base_url.replace(/\/$/, '')}${path}${qs ? `?${qs}` : ''}`
  const res = await fetch(url, { method: tool.http_method, headers, body })
  const json = await res.json().catch(() => null)

  if (!res.ok) throw new ConnectorError(res.status, json ?? {})
  if (gateway.success_path && getDotPath(json, gateway.success_path) === false) {
    throw new ConnectorError(res.status, json ?? {})
  }
  return tool.response_path ? getDotPath(json, tool.response_path) : json
}
