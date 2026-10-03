export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { listPublicTemplates, listTemplateTools } from '@/lib/templates'

export default async function TemplatesPage() {
  const templates = await listPublicTemplates()
  const toolCounts = await Promise.all(templates.map((t) => listTemplateTools(t.id)))

  return (
    <>
      <header className="page-head">
        <div>
          <p className="eyebrow">Template</p>
          <h1>Jelajahi template</h1>
          <p className="page-head__sub">Connector siap pakai. Clone satu, isi credential-mu, dan langsung punya endpoint MCP sendiri.</p>
        </div>
      </header>

      <div className="gateway-grid">
        {templates.map((t, i) => (
          <article className="gateway-card" key={t.id}>
            <div className="gateway-card__head">
              <div>
                <h3>{t.name}</h3>
                <span className="mono gateway-card__slug">{t.slug}</span>
              </div>
              <span className="badge">{toolCounts[i].length} tool</span>
            </div>
            <p className="card__meta">{t.description}</p>
            <div className="gateway-card__foot">
              <span className="mono card__meta">{new URL(t.default_base_url).host}</span>
              <Link className="link-arrow" href={`/dashboard/templates/${t.slug}`}>Lihat & clone →</Link>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
