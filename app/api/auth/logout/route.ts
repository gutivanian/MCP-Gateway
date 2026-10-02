export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { clearSessionCookie } from '@/lib/auth'

export async function POST() {
  await clearSessionCookie()
  return Response.json({ success: true })
}
