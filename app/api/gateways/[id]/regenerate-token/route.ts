export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getCurrentUser } from '@/lib/auth'
import { findGatewayById, regenerateGatewayToken } from '@/lib/gateways'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const gateway = await findGatewayById(Number((await params).id))
  if (!gateway || gateway.owner_user_id !== user.id) {
    return Response.json({ success: false, error: 'Gateway tidak ditemukan' }, { status: 404 })
  }

  const rawToken = await regenerateGatewayToken(gateway.id)
  return Response.json({ success: true, data: { rawToken } })
}
