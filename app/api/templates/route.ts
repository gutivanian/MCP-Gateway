export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { listPublicTemplates } from '@/lib/templates'

export async function GET() {
  const templates = await listPublicTemplates()
  return Response.json({ success: true, data: templates })
}
