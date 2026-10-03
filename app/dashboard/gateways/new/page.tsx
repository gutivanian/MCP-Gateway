export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { NewGatewayForm } from '@/components/NewGatewayForm'

export default function NewGatewayPage() {
  return (
    <>
      <nav className="crumbs">
        <Link href="/dashboard">Gateway</Link>
        <span>/</span>
        <span>Baru</span>
      </nav>
      <header className="page-head">
        <div>
          <p className="eyebrow">Gateway baru</p>
          <h1>Buat dari nol</h1>
          <p className="page-head__sub">Isi koneksi ke API kamu, lalu definisikan tool yang mau diekspos ke AI.</p>
        </div>
      </header>
      <section className="card">
        <NewGatewayForm />
      </section>
    </>
  )
}
