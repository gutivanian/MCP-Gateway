export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getCurrentUser } from '@/lib/auth'
import { cloneTemplateGateway, isSlugTaken } from '@/lib/gateways'
import { findTemplateBySlug, listTemplateTools } from '@/lib/templates'

const SLUG_RE = /^[a-z][a-z0-9-]{1,62}$/

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { slug: templateSlug } = await params
  const template = await findTemplateBySlug(templateSlug)
  if (!template || !template.is_public) {
    return Response.json({ success: false, error: 'Template tidak ditemukan' }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  const slug = typeof body?.slug === 'string' ? body.slug.trim() : ''
  const name = typeof body?.name === 'string' && body.name.trim() ? body.name.trim() : template.name
  const baseUrl = typeof body?.baseUrl === 'string' && body.baseUrl.trim() ? body.baseUrl.trim() : template.default_base_url
  const credentials = typeof body?.credentials === 'object' && body?.credentials !== null ? body.credentials : {}

  if (!SLUG_RE.test(slug)) {
    return Response.json({ success: false, error: 'Slug harus huruf kecil/angka/dash, diawali huruf' }, { status: 400 })
  }
  if (await isSlugTaken(slug)) {
    return Response.json({ success: false, error: 'Slug sudah dipakai' }, { status: 409 })
  }
  for (const field of template.credential_fields) {
    if (field.required && !credentials[field.key]) {
      return Response.json({ success: false, error: `Credential "${field.label}" wajib diisi` }, { status: 400 })
    }
  }

  const tools = await listTemplateTools(template.id)
  const { gateway, rawToken } = await cloneTemplateGateway(template, tools, {
    ownerUserId: user.id,
    slug,
    name,
    baseUrl,
    credentials,
  })

  return Response.json({ success: true, data: { gateway, rawToken } }, { status: 201 })
}
