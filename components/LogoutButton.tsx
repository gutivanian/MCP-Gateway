'use client'

import { useRouter } from 'next/navigation'
import { Icon } from './Icon'

export function LogoutButton() {
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <button className="side__logout" onClick={logout}>
      <Icon name="logout" size={16} />
      <span>Keluar</span>
    </button>
  )
}
