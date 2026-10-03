'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon, type IconName } from './Icon'
import { Logo } from './Logo'
import { LogoutButton } from './LogoutButton'

const ITEMS: { href: string; label: string; icon: IconName; exact?: boolean }[] = [
  { href: '/dashboard', label: 'Gateway', icon: 'grid', exact: true },
  { href: '/dashboard/templates', label: 'Template', icon: 'layers' },
  { href: '/dashboard/gateways/new', label: 'Gateway baru', icon: 'plus', exact: true },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <aside className="side">
      <div className="side__brand">
        <Logo />
      </div>

      <p className="side__label">Workspace</p>
      <nav className="side__nav" aria-label="Utama">
        {ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} className={`side__item ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined}>
              <Icon name={item.icon} size={17} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="side__foot">
        <div className="side__status">
          <span className="dot dot--live" aria-hidden />
          <span>Semua sistem normal</span>
        </div>
        <LogoutButton />
      </div>
    </aside>
  )
}
