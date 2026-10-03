import { config } from 'dotenv'
config({ path: '.env.local' })

import { query, queryOne, withTransaction } from '../lib/db'
import { hashPassword } from '../lib/auth'
import { encryptCredentials } from '../lib/crypto'
import { generateGatewayToken } from '../lib/tokens'
import type { ToolRowShape } from '../lib/types'

const ENKI_TOOLS: ToolRowShape[] = [
  {
    tool_key: 'list_accounts',
    title: 'List Accounts',
    description: 'Daftar akun sosial milik user. id-nya dipakai sebagai accountId di tool lain.',
    http_method: 'GET',
    path_template: '/api/v1/accounts',
    response_path: 'data',
    input_fields: [],
  },
  {
    tool_key: 'list_scheduled_posts',
    title: 'List Scheduled Posts',
    description: 'List igscheduler scheduled posts, filterable by status, account, and date range.',
    http_method: 'GET',
    path_template: '/api/v1/posts/scheduled',
    response_path: 'data',
    input_fields: [
      { key: 'status', type: 'string', required: false, in: 'query' },
      { key: 'accountId', type: 'string', required: false, in: 'query' },
      { key: 'from', type: 'string', required: false, in: 'query' },
      { key: 'to', type: 'string', required: false, in: 'query' },
      { key: 'limit', type: 'number', required: false, in: 'query' },
      { key: 'offset', type: 'number', required: false, in: 'query' },
      { key: 'order', type: 'enum', enumValues: ['asc', 'desc'], required: false, in: 'query' },
    ],
  },
  {
    tool_key: 'get_post',
    title: 'Get Post Detail',
    description: 'Detail of one igscheduler post by ID.',
    http_method: 'GET',
    path_template: '/api/v1/posts/{{input.postId}}',
    response_path: 'data',
    input_fields: [{ key: 'postId', type: 'string', required: true, in: 'path' }],
  },
  {
    tool_key: 'get_post_approval_status',
    title: 'Get Post Approval Status',
    description: 'Approval status of one post.',
    http_method: 'GET',
    path_template: '/api/v1/posts/{{input.postId}}/approval',
    response_path: 'data',
    input_fields: [{ key: 'postId', type: 'string', required: true, in: 'path' }],
  },
  {
    tool_key: 'list_approvals',
    title: 'List Posts Needing Approval',
    description: 'Posts awaiting approval.',
    http_method: 'GET',
    path_template: '/api/v1/approvals',
    response_path: 'data',
    input_fields: [{ key: 'accountId', type: 'string', required: false, in: 'query' }],
  },
  {
    tool_key: 'list_failed_posts',
    title: 'List Permanently Failed Posts',
    description: 'Posts that failed permanently.',
    http_method: 'GET',
    path_template: '/api/v1/posts/failed',
    response_path: 'data',
    input_fields: [{ key: 'accountId', type: 'string', required: false, in: 'query' }],
  },
  {
    tool_key: 'retry_post',
    title: 'Retry Publishing a Post',
    description: 'Retry publishing a pending/failed post.',
    http_method: 'POST',
    path_template: '/api/v1/posts/{{input.postId}}/retry',
    response_path: 'data',
    input_fields: [
      { key: 'postId', type: 'string', required: true, in: 'path' },
      { key: 'mode', type: 'enum', enumValues: ['current', 'local'], required: false, in: 'body' },
    ],
  },
  {
    tool_key: 'reschedule_post',
    title: 'Reschedule a Post',
    description: 'Reschedule a post to a new time.',
    http_method: 'POST',
    path_template: '/api/v1/posts/{{input.postId}}/reschedule',
    response_path: 'data',
    input_fields: [
      { key: 'postId', type: 'string', required: true, in: 'path' },
      { key: 'scheduledAt', type: 'string', required: true, in: 'body' },
    ],
  },
  {
    tool_key: 'create_instagram_post_xml',
    title: 'Create Instagram Carousel Post (XML)',
    description: 'Schedule a new Instagram carousel from XML.',
    http_method: 'POST',
    path_template: '/api/v1/posts/instagram/xml',
    response_path: 'data',
    input_fields: [
      { key: 'xmlContent', type: 'string', required: true, in: 'body' },
      { key: 'accountId', type: 'string', required: true, in: 'body' },
    ],
  },
  {
    tool_key: 'create_threads_post_xml',
    title: 'Create Threads Chain Post (XML)',
    description: 'Schedule a new Threads chain from XML.',
    http_method: 'POST',
    path_template: '/api/v1/posts/threads/xml',
    response_path: 'data',
    input_fields: [
      { key: 'threadXml', type: 'string', required: true, in: 'body' },
      { key: 'accountId', type: 'string', required: true, in: 'body' },
    ],
  },
  {
    tool_key: 'check_similar_content',
    title: 'Check Similar Content',
    description: 'Check a draft caption/thread against existing content before posting.',
    http_method: 'POST',
    path_template: '/api/v1/similar',
    response_path: 'data',
    input_fields: [
      { key: 'accountId', type: 'string', required: true, in: 'body' },
      { key: 'text', type: 'string', required: true, in: 'body' },
    ],
  },
]

const HIVE_TOOLS: ToolRowShape[] = [
  {
    tool_key: 'whoami',
    title: 'Who Am I',
    description: 'Info about the wa-gateway API key in use.',
    http_method: 'GET',
    path_template: '/api/v1/me',
    response_path: null,
    input_fields: [],
  },
  {
    tool_key: 'list_sessions',
    title: 'List WhatsApp Sessions',
    description: 'List connected WhatsApp sessions.',
    http_method: 'GET',
    path_template: '/api/v1/sessions',
    response_path: null,
    input_fields: [],
  },
  {
    tool_key: 'send_message',
    title: 'Send WhatsApp Message',
    description: 'Send a text message or attachment (via URL) to a WhatsApp number.',
    http_method: 'POST',
    path_template: '/api/v1/messages',
    response_path: null,
    input_fields: [
      { key: 'sessionId', type: 'string', required: false, in: 'body' },
      { key: 'to', type: 'string', required: true, in: 'body' },
      { key: 'text', type: 'string', required: false, in: 'body' },
      { key: 'quotedId', type: 'string', required: false, in: 'body' },
      { key: 'mediaUrl', type: 'string', required: false, in: 'body', bodyPath: 'media.url' },
      { key: 'mediaKind', type: 'enum', enumValues: ['image', 'video', 'audio', 'document'], required: false, in: 'body', bodyPath: 'media.kind' },
      { key: 'mediaCaption', type: 'string', required: false, in: 'body', bodyPath: 'media.caption' },
      { key: 'mediaFileName', type: 'string', required: false, in: 'body', bodyPath: 'media.fileName' },
      { key: 'mediaMimeType', type: 'string', required: false, in: 'body', bodyPath: 'media.mimeType' },
    ],
  },
]

async function upsertTemplate(
  slug: string,
  name: string,
  description: string,
  defaultBaseUrl: string,
  successPath: string | null,
  tools: ToolRowShape[]
) {
  const existing = await queryOne<{ id: number }>('SELECT id FROM mcp_templates WHERE slug = $1', [slug])
  if (existing) {
    console.log(`Template "${slug}" already exists (id=${existing.id}), skipping.`)
    return existing.id
  }

  return withTransaction(async (client) => {
    const res = await client.query<{ id: number }>(
      `INSERT INTO mcp_templates (slug, name, description, default_base_url, auth_header_value_template, success_path, credential_fields)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [
        slug,
        name,
        description,
        defaultBaseUrl,
        'Bearer {{credentials.API_KEY}}',
        successPath,
        JSON.stringify([{ key: 'API_KEY', label: `${name} API Key`, type: 'secret', required: true }]),
      ]
    )
    const templateId = res.rows[0].id
    for (const t of tools) {
      await client.query(
        `INSERT INTO mcp_template_tools (template_id, tool_key, title, description, input_fields, http_method, path_template, response_path)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [templateId, t.tool_key, t.title, t.description, JSON.stringify(t.input_fields), t.http_method, t.path_template, t.response_path]
      )
    }
    console.log(`Created template "${slug}" (id=${templateId}) with ${tools.length} tools.`)
    return templateId
  })
}

async function seedOwnerGateway(
  ownerUserId: number,
  templateId: number,
  slug: string,
  name: string,
  baseUrl: string,
  authHeaderValueTemplate: string,
  successPath: string | null,
  apiKey: string,
  tools: ToolRowShape[]
) {
  const existing = await queryOne<{ id: number }>('SELECT id FROM gateways WHERE slug = $1', [slug])
  if (existing) {
    console.log(`Gateway "${slug}" already exists (id=${existing.id}), skipping.`)
    return
  }

  const { raw, prefix, hash } = generateGatewayToken()
  await withTransaction(async (client) => {
    const res = await client.query<{ id: number }>(
      `INSERT INTO gateways
         (owner_user_id, template_id, slug, name, base_url, auth_header_value_template, success_path, credentials, token_prefix, token_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [
        ownerUserId,
        templateId,
        slug,
        name,
        baseUrl,
        authHeaderValueTemplate,
        successPath,
        JSON.stringify(encryptCredentials({ API_KEY: apiKey })),
        prefix,
        hash,
      ]
    )
    const gatewayId = res.rows[0].id
    for (const t of tools) {
      await client.query(
        `INSERT INTO gateway_tools (gateway_id, tool_key, title, description, input_fields, http_method, path_template, response_path)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [gatewayId, t.tool_key, t.title, t.description, JSON.stringify(t.input_fields), t.http_method, t.path_template, t.response_path]
      )
    }
  })
  console.log(`Created gateway "${slug}" — token (shown once): ${raw}`)
}

async function main() {
  const adminPassword = process.env.CONDUIT_SEED_ADMIN_PASSWORD
  const enkiKey = process.env.CONDUIT_SEED_ENKI_KEY
  if (!adminPassword) throw new Error('CONDUIT_SEED_ADMIN_PASSWORD belum diset')
  if (!enkiKey) throw new Error('CONDUIT_SEED_ENKI_KEY belum diset')

  const enkiTemplateId = await upsertTemplate(
    'enki',
    'igscheduler',
    'Schedule, approve, and retry Instagram/Threads posts via igscheduler.',
    'https://enki.gutivanian.id',
    'success',
    ENKI_TOOLS
  )
  const hiveTemplateId = await upsertTemplate(
    'hive',
    'wa-gateway-go',
    'Send WhatsApp messages and manage sessions via wa-gateway-go.',
    'https://hive.gutivanian.id',
    null,
    HIVE_TOOLS
  )

  let admin = await queryOne<{ id: number }>('SELECT id FROM users WHERE email = $1', ['fondofne@gmail.com'])
  if (!admin) {
    const passwordHash = await hashPassword(adminPassword)
    const rows = await query<{ id: number }>(
      'INSERT INTO users (email, password_hash, name) VALUES ($1,$2,$3) RETURNING id',
      ['fondofne@gmail.com', passwordHash, 'fondofne']
    )
    admin = rows[0]
    console.log(`Created user fondofne@gmail.com (id=${admin.id}).`)
  } else {
    console.log(`User fondofne@gmail.com already exists (id=${admin.id}).`)
  }

  await seedOwnerGateway(
    admin.id,
    enkiTemplateId,
    'enki',
    'igscheduler',
    'https://enki.gutivanian.id',
    'Bearer {{credentials.API_KEY}}',
    'success',
    enkiKey,
    ENKI_TOOLS
  )
  await seedOwnerGateway(
    admin.id,
    hiveTemplateId,
    'hive',
    'wa-gateway-go',
    'https://hive.gutivanian.id',
    'Bearer {{credentials.API_KEY}}',
    null,
    process.env.CONDUIT_SEED_HIVE_KEY ?? 'REPLACE_ME',
    HIVE_TOOLS
  )

  console.log('Seed complete.')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
