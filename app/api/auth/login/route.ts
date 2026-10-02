export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { setSessionCookie, signSession, verifyPassword } from '@/lib/auth'
import { findUserByEmail } from '@/lib/users'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!email || !password) {
    return Response.json({ success: false, error: 'Email dan password wajib diisi' }, { status: 400 })
  }

  const user = await findUserByEmail(email)
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return Response.json({ success: false, error: 'Email atau password salah' }, { status: 401 })
  }

  const token = await signSession({ sub: String(user.id), email: user.email, name: user.name })
  await setSessionCookie(token)

  return Response.json({ success: true, data: { id: user.id, email: user.email, name: user.name } })
}
