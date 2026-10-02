export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { findTemplateBySlug, listTemplateTools } from '@/lib/templates'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const template = await findTemplateBySlug(slug)
  if (!template || !template.is_public) {
    return Response.json({ success: false, error: 'Template tidak ditemukan' }, { status: 404 })
  }
  const tools = await listTemplateTools(template.id)
  return Response.json({ success: true, data: { template, tools } })
}
