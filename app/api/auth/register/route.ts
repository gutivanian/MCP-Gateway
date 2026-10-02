export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { hashPassword, setSessionCookie, signSession } from '@/lib/auth'
import { createUser, findUserByEmail } from '@/lib/users'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  const name = typeof body?.name === 'string' ? body.name.trim() : undefined

  if (!email || !password || password.length < 8) {
    return Response.json({ success: false, error: 'Email wajib diisi, password minimal 8 karakter' }, { status: 400 })
  }

  const existing = await findUserByEmail(email)
  if (existing) {
    return Response.json({ success: false, error: 'Email sudah terdaftar' }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)
  const user = await createUser(email, passwordHash, name)
  const token = await signSession({ sub: String(user.id), email: user.email, name: user.name })
  await setSessionCookie(token)

  return Response.json({ success: true, data: { id: user.id, email: user.email, name: user.name } }, { status: 201 })
}
