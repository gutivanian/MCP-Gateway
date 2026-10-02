export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  return Response.json({ success: true, data: { id: user.id, email: user.email, name: user.name } })
}
