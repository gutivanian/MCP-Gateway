export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getCurrentUser } from '@/lib/auth'
import { deleteGateway, findGatewayById, listGatewayTools, replaceGatewayTools, setGatewayActive, updateGatewayCredentials } from '@/lib/gateways'
import { query } from '@/lib/db'
import { validateToolListJson } from '@/lib/tool-schema'

async function loadOwnedGateway(id: number, userId: number) {
  const gateway = await findGatewayById(id)
  if (!gateway || gateway.owner_user_id !== userId) return null
  return gateway
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const gateway = await loadOwnedGateway(Number((await params).id), user.id)
  if (!gateway) return Response.json({ success: false, error: 'Gateway tidak ditemukan' }, { status: 404 })

  const tools = await listGatewayTools(gateway.id)
  const { credentials, ...safeGateway } = gateway
  return Response.json({
    success: true,
    data: { gateway: { ...safeGateway, credentialKeys: Object.keys(credentials) }, tools },
  })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const gateway = await loadOwnedGateway(Number((await params).id), user.id)
  if (!gateway) return Response.json({ success: false, error: 'Gateway tidak ditemukan' }, { status: 404 })

  const body = await req.json().catch(() => null)

  if (typeof body?.toolsJson === 'string') {
    const validated = validateToolListJson(body.toolsJson)
    if (!validated.ok) return Response.json({ success: false, error: validated.error }, { status: 400 })
    await replaceGatewayTools(gateway.id, validated.tools)
  }

  if (typeof body?.credentials === 'object' && body?.credentials !== null) {
    await updateGatewayCredentials(gateway.id, body.credentials)
  }

  if (typeof body?.isActive === 'boolean') {
    await setGatewayActive(gateway.id, body.isActive)
  }

  const fields: string[] = []
  const values: unknown[] = []
  let i = 1
  if (typeof body?.name === 'string' && body.name.trim()) {
    fields.push(`name = $${i++}`)
    values.push(body.name.trim())
  }
  if (typeof body?.baseUrl === 'string' && body.baseUrl.trim()) {
    fields.push(`base_url = $${i++}`)
    values.push(body.baseUrl.trim())
  }
  if (fields.length) {
    values.push(gateway.id)
    await query(`UPDATE gateways SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${i}`, values)
  }

  return Response.json({ success: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const gateway = await loadOwnedGateway(Number((await params).id), user.id)
  if (!gateway) return Response.json({ success: false, error: 'Gateway tidak ditemukan' }, { status: 404 })

  await deleteGateway(gateway.id)
  return Response.json({ success: true })
}
