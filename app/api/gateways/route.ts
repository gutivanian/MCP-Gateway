export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getCurrentUser } from '@/lib/auth'
import { createCustomGateway, isSlugTaken, listGatewaysByOwner } from '@/lib/gateways'
import { validateToolListJson } from '@/lib/tool-schema'

const SLUG_RE = /^[a-z][a-z0-9-]{1,62}$/

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const gateways = await listGatewaysByOwner(user.id)
  return Response.json({ success: true, data: gateways })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const slug = typeof body?.slug === 'string' ? body.slug.trim() : ''
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const baseUrl = typeof body?.baseUrl === 'string' ? body.baseUrl.trim() : ''
  const authHeaderName = typeof body?.authHeaderName === 'string' && body.authHeaderName.trim() ? body.authHeaderName.trim() : 'Authorization'
  const authHeaderValueTemplate = typeof body?.authHeaderValueTemplate === 'string' ? body.authHeaderValueTemplate : null
  const credentials = typeof body?.credentials === 'object' && body?.credentials !== null ? body.credentials : {}
  const toolsJson = typeof body?.toolsJson === 'string' ? body.toolsJson : '[]'

  if (!SLUG_RE.test(slug)) {
    return Response.json({ success: false, error: 'Slug harus huruf kecil/angka/dash, diawali huruf' }, { status: 400 })
  }
  if (!name) return Response.json({ success: false, error: 'Nama wajib diisi' }, { status: 400 })
  if (!baseUrl) return Response.json({ success: false, error: 'Base URL wajib diisi' }, { status: 400 })
  if (await isSlugTaken(slug)) {
    return Response.json({ success: false, error: 'Slug sudah dipakai' }, { status: 409 })
  }

  const validated = validateToolListJson(toolsJson)
  if (!validated.ok) {
    return Response.json({ success: false, error: validated.error }, { status: 400 })
  }

  const { gateway, rawToken } = await createCustomGateway(
    { ownerUserId: user.id, slug, name, baseUrl, authHeaderName, authHeaderValueTemplate, credentials },
    validated.tools
  )

  return Response.json({ success: true, data: { gateway, rawToken } }, { status: 201 })
}
