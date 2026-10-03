import { DashboardNav } from '@/components/DashboardNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <DashboardNav />
      <main className="shell__main">
        <div className="shell__inner">{children}</div>
      </main>
    </div>
  )
}
