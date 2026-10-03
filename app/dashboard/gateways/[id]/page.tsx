export const dynamic = 'force-dynamic'

import Link from 'next/link'
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
  const proto = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const mcpUrl = `${proto}://${host}/mcp/${gateway.slug}`

  return (
    <>
      <nav className="crumbs">
        <Link href="/dashboard">Gateway</Link>
        <span>/</span>
        <span>{gateway.name}</span>
      </nav>

      <header className="page-head">
        <div>
          <h1>{gateway.name}</h1>
          <p className="page-head__sub mono">/mcp/{gateway.slug}</p>
        </div>
        <div className="stat-strip">
          <div className="stat">
            <span className="stat__value">{tools.length}</span>
            <span className="stat__label">tool</span>
          </div>
          <div className="stat">
            <span className="stat__value">{Object.keys(gateway.credentials).length}</span>
            <span className="stat__label">credential</span>
          </div>
        </div>
      </header>

      <GatewayManage
        gatewayId={gateway.id}
        slug={gateway.slug}
        mcpUrl={mcpUrl}
        isActive={gateway.is_active}
        tokenPrefix={gateway.token_prefix}
        credentialKeys={Object.keys(gateway.credentials)}
        tools={tools}
      />
    </>
  )
}
