import Link from 'next/link'
import { LogoutButton } from '@/components/LogoutButton'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dash">
      <aside className="dash__sidebar">
        <div className="dash__brand">Conduit</div>
        <nav className="dash__nav">
          <Link href="/dashboard">Gateways</Link>
          <Link href="/dashboard/templates">Templates</Link>
          <Link href="/dashboard/gateways/new">New gateway</Link>
        </nav>
        <LogoutButton />
      </aside>
      <main className="dash__main">{children}</main>
    </div>
  )
}
