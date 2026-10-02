export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { listPublicTemplates } from '@/lib/templates'

export default async function TemplatesPage() {
  const templates = await listPublicTemplates()

  return (
    <>
      <div className="dash__header">
        <h1>Templates</h1>
      </div>

      {templates.length === 0 ? (
        <div className="empty-state">
          <h3>No templates yet</h3>
        </div>
      ) : (
        templates.map((t) => (
          <div className="card" key={t.id}>
            <div className="card__row">
              <div>
                <h3>{t.name}</h3>
                <p className="card__meta">{t.description}</p>
              </div>
              <Link className="btn btn-primary" href={`/dashboard/templates/${t.slug}`}>View &amp; clone</Link>
            </div>
          </div>
        ))
      )}
    </>
  )
}
