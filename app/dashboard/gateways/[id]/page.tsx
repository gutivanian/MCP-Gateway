export const dynamic = 'force-dynamic'

import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { GatewayManage } from '@/components/GatewayManage'
import { getCurrentUser } from '@/lib/auth'
import { findGatewayById, listGatewayTools } from '@/lib/gateways'

export default async function GatewayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  const gateway = await findGatewayById(Number(id))
  if (!user || !gateway || gateway.owner_user_id !== user.id) notFound()

  const tools = await listGatewayTools(gateway.id)
  const host = (await headers()).get('host')
  const mcpUrl = `${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://${host}/mcp/${gateway.slug}`

  return (
    <>
      <div className="dash__header">
        <h1>{gateway.name}</h1>
      </div>
      <GatewayManage gatewayId={gateway.id} slug={gateway.slug} mcpUrl={mcpUrl} isActive={gateway.is_active} tools={tools} />
    </>
  )
}
