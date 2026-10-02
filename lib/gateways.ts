import { query, queryOne, withTransaction } from './db'
import { encryptCredentials } from './crypto'
import { generateGatewayToken, hashToken } from './tokens'
import type { GatewayRow, GatewayToolRow, TemplateRow, TemplateToolRow, ToolRowShape } from './types'

export async function findGatewayBySlug(slug: string): Promise<GatewayRow | null> {
  return queryOne<GatewayRow>('SELECT * FROM gateways WHERE slug = $1', [slug])
}

export async function findGatewayById(id: number): Promise<GatewayRow | null> {
  return queryOne<GatewayRow>('SELECT * FROM gateways WHERE id = $1', [id])
}

export async function listGatewaysByOwner(ownerUserId: number): Promise<GatewayRow[]> {
  return query<GatewayRow>('SELECT * FROM gateways WHERE owner_user_id = $1 ORDER BY created_at DESC', [ownerUserId])
}

export async function listGatewayTools(gatewayId: number): Promise<GatewayToolRow[]> {
  return query<GatewayToolRow>(
    'SELECT * FROM gateway_tools WHERE gateway_id = $1 ORDER BY sort_order, id',
    [gatewayId]
  )
}

export function isGatewayTokenValid(gateway: GatewayRow, rawToken: string): boolean {
  if (!gateway.is_active || gateway.token_revoked_at) return false
  return hashToken(rawToken) === gateway.token_hash
}

interface NewGatewayCommon {
  ownerUserId: number
  slug: string
  name: string
  description?: string
  baseUrl: string
  authHeaderName?: string
  authHeaderValueTemplate?: string | null
  successPath?: string | null
  credentials: Record<string, string>
}

async function insertGateway(client: import('pg').PoolClient, common: NewGatewayCommon, templateId: number | null) {
  const { raw, prefix, hash } = generateGatewayToken()
  const res = await client.query<GatewayRow>(
    `INSERT INTO gateways
       (owner_user_id, template_id, slug, name, description, base_url, auth_header_name, auth_header_value_template, success_path, credentials, token_prefix, token_hash)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      common.ownerUserId,
      templateId,
      common.slug,
      common.name,
      common.description ?? null,
      common.baseUrl,
      common.authHeaderName ?? 'Authorization',
      common.authHeaderValueTemplate ?? null,
      common.successPath ?? null,
      JSON.stringify(encryptCredentials(common.credentials)),
      prefix,
      hash,
    ]
  )
  return { gateway: res.rows[0], rawToken: raw }
}

async function insertGatewayTools(client: import('pg').PoolClient, gatewayId: number, tools: ToolRowShape[]) {
  for (const t of tools) {
    await client.query(
      `INSERT INTO gateway_tools (gateway_id, tool_key, title, description, input_fields, http_method, path_template, response_path, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        gatewayId,
        t.tool_key,
        t.title,
        t.description,
        JSON.stringify(t.input_fields),
        t.http_method,
        t.path_template,
        t.response_path,
        t.sort_order ?? 0,
      ]
    )
  }
}

export async function createCustomGateway(common: NewGatewayCommon, tools: ToolRowShape[]) {
  return withTransaction(async (client) => {
    const { gateway, rawToken } = await insertGateway(client, common, null)
    await insertGatewayTools(client, gateway.id, tools)
    return { gateway, rawToken }
  })
}

export async function cloneTemplateGateway(
  template: TemplateRow,
  templateTools: TemplateToolRow[],
  common: Omit<NewGatewayCommon, 'authHeaderName' | 'authHeaderValueTemplate' | 'successPath'>
) {
  return withTransaction(async (client) => {
    const { gateway, rawToken } = await insertGateway(
      client,
      {
        ...common,
        authHeaderName: template.auth_header_name,
        authHeaderValueTemplate: template.auth_header_value_template,
        successPath: template.success_path,
      },
      template.id
    )
    await insertGatewayTools(client, gateway.id, templateTools)
    return { gateway, rawToken }
  })
}

export async function replaceGatewayTools(gatewayId: number, tools: ToolRowShape[]) {
  return withTransaction(async (client) => {
    await client.query('DELETE FROM gateway_tools WHERE gateway_id = $1', [gatewayId])
    await insertGatewayTools(client, gatewayId, tools)
  })
}

export async function updateGatewayCredentials(gatewayId: number, creds: Record<string, string>) {
  const gateway = await findGatewayById(gatewayId)
  if (!gateway) throw new Error('Gateway tidak ditemukan')
  const merged = { ...gateway.credentials, ...encryptCredentials(creds) }
  await query('UPDATE gateways SET credentials = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(merged), gatewayId])
}

export async function regenerateGatewayToken(gatewayId: number): Promise<string> {
  const { raw, prefix, hash } = generateGatewayToken()
  await query(
    'UPDATE gateways SET token_prefix = $1, token_hash = $2, token_revoked_at = NULL, updated_at = NOW() WHERE id = $3',
    [prefix, hash, gatewayId]
  )
  return raw
}

export async function setGatewayActive(gatewayId: number, isActive: boolean) {
  await query('UPDATE gateways SET is_active = $1, updated_at = NOW() WHERE id = $2', [isActive, gatewayId])
}

export async function deleteGateway(gatewayId: number) {
  await query('DELETE FROM gateways WHERE id = $1', [gatewayId])
}

export async function isSlugTaken(slug: string): Promise<boolean> {
  const row = await queryOne('SELECT 1 FROM gateways WHERE slug = $1', [slug])
  return row !== null
}
