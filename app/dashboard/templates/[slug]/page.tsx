export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CloneTemplateForm } from '@/components/CloneTemplateForm'
import { findTemplateBySlug, listTemplateTools } from '@/lib/templates'

export default async function TemplateDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const template = await findTemplateBySlug(slug)
  if (!template || !template.is_public) notFound()

  const tools = await listTemplateTools(template.id)

  return (
    <>
      <nav className="crumbs">
        <Link href="/dashboard/templates">Template</Link>
        <span>/</span>
        <span>{template.name}</span>
      </nav>

      <header className="page-head">
        <div>
          <p className="eyebrow">Template</p>
          <h1>{template.name}</h1>
          <p className="page-head__sub">{template.description}</p>
        </div>
        <div className="stat-strip">
          <div className="stat">
            <span className="stat__value">{tools.length}</span>
            <span className="stat__label">tool</span>
          </div>
        </div>
      </header>

      <div className="split">
        <section className="card">
          <div className="card__head">
            <div>
              <p className="eyebrow">Isi template</p>
              <h2>Tool yang akan dibuat</h2>
            </div>
          </div>
          <ul className="tool-list">
            {tools.map((t) => (
              <li key={t.id} className="tool">
                <div className="tool__top">
                  <span className="tool__name mono">{t.tool_key}</span>
                  <span className={`method method--${t.http_method.toLowerCase()}`}>{t.http_method}</span>
                </div>
                <code className="tool__path mono">{t.path_template}</code>
                <p className="tool__desc">{t.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <div className="card__head">
            <div>
              <p className="eyebrow">Clone</p>
              <h2>Buat gateway dari template ini</h2>
            </div>
          </div>
          <CloneTemplateForm
            templateSlug={template.slug}
            defaultName={template.name}
            defaultBaseUrl={template.default_base_url}
            credentialFields={template.credential_fields}
          />
        </section>
      </div>
    </>
  )
}
