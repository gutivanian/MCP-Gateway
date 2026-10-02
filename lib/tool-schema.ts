import { z } from 'zod'
import type { ToolFieldDef, ToolRowShape } from './types'

const TOOL_KEY_RE = /^[a-z][a-z0-9_]*$/
const METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])

export function buildZodSchema(fields: ToolFieldDef[]) {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const f of fields) {
    let schema: z.ZodTypeAny
    switch (f.type) {
      case 'string':
        schema = z.string()
        break
      case 'number':
        schema = z.number()
        break
      case 'boolean':
        schema = z.boolean()
        break
      case 'enum':
        if (!f.enumValues || f.enumValues.length === 0) {
          throw new Error(`Field "${f.key}": type enum butuh enumValues`)
        }
        schema = z.enum(f.enumValues as [string, ...string[]])
        break
      default:
        throw new Error(`Field "${f.key}": tipe tidak dikenal`)
    }
    if (f.description) schema = schema.describe(f.description)
    shape[f.key] = f.required ? schema : schema.optional()
  }
  return z.object(shape)
}

function assertFieldDef(f: unknown, toolKey: string): ToolFieldDef {
  if (typeof f !== 'object' || f === null) throw new Error(`Tool "${toolKey}": field harus berupa object`)
  const o = f as Record<string, unknown>
  if (typeof o.key !== 'string' || !o.key) throw new Error(`Tool "${toolKey}": field.key wajib diisi`)
  if (!['string', 'number', 'boolean', 'enum'].includes(o.type as string)) {
    throw new Error(`Tool "${toolKey}", field "${o.key}": type harus string/number/boolean/enum`)
  }
  if (o.type === 'enum' && (!Array.isArray(o.enumValues) || o.enumValues.length === 0)) {
    throw new Error(`Tool "${toolKey}", field "${o.key}": enum butuh enumValues (array of string, minimal 1)`)
  }
  if (!['path', 'query', 'body'].includes(o.in as string)) {
    throw new Error(`Tool "${toolKey}", field "${o.key}": in harus path/query/body`)
  }
  return {
    key: o.key,
    type: o.type as ToolFieldDef['type'],
    required: Boolean(o.required),
    description: typeof o.description === 'string' ? o.description : undefined,
    enumValues: Array.isArray(o.enumValues) ? (o.enumValues as string[]) : undefined,
    default: o.default as ToolFieldDef['default'],
    in: o.in as ToolFieldDef['in'],
    bodyPath: typeof o.bodyPath === 'string' ? o.bodyPath : undefined,
  }
}

function assertToolRow(t: unknown): ToolRowShape {
  if (typeof t !== 'object' || t === null) throw new Error('Tiap tool harus berupa object')
  const o = t as Record<string, unknown>
  if (typeof o.tool_key !== 'string' || !TOOL_KEY_RE.test(o.tool_key)) {
    throw new Error(`tool_key tidak valid: "${String(o.tool_key)}" (harus huruf kecil/angka/underscore, awali huruf)`)
  }
  if (typeof o.title !== 'string' || !o.title) throw new Error(`Tool "${o.tool_key}": title wajib diisi`)
  if (typeof o.description !== 'string' || !o.description) throw new Error(`Tool "${o.tool_key}": description wajib diisi`)
  if (typeof o.http_method !== 'string' || !METHODS.has(o.http_method.toUpperCase())) {
    throw new Error(`Tool "${o.tool_key}": http_method harus salah satu dari ${[...METHODS].join(', ')}`)
  }
  if (typeof o.path_template !== 'string' || !o.path_template.startsWith('/')) {
    throw new Error(`Tool "${o.tool_key}": path_template wajib diawali "/"`)
  }
  const fields = Array.isArray(o.input_fields) ? o.input_fields.map((f) => assertFieldDef(f, o.tool_key as string)) : []
  return {
    tool_key: o.tool_key,
    title: o.title,
    description: o.description,
    input_fields: fields,
    http_method: o.http_method.toUpperCase(),
    path_template: o.path_template,
    response_path: typeof o.response_path === 'string' && o.response_path ? o.response_path : null,
    sort_order: typeof o.sort_order === 'number' ? o.sort_order : 0,
  }
}

export function validateToolListJson(raw: string): { ok: true; tools: ToolRowShape[] } | { ok: false; error: string } {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (e) {
    return { ok: false, error: `JSON tidak valid: ${e instanceof Error ? e.message : String(e)}` }
  }
  if (!Array.isArray(parsed)) return { ok: false, error: 'Harus berupa array of tool' }
  try {
    const tools = parsed.map(assertToolRow)
    const keys = new Set<string>()
    for (const t of tools) {
      if (keys.has(t.tool_key)) return { ok: false, error: `tool_key duplikat: "${t.tool_key}"` } as const
      keys.add(t.tool_key)
    }
    return { ok: true, tools }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
