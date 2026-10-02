export const dynamic = 'force-dynamic'

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
      <div className="dash__header">
        <h1>{template.name}</h1>
      </div>
      <p className="card__meta" style={{ marginBottom: 'var(--space-lg)' }}>{template.description}</p>

      <div className="card">
        <h3>Tools ({tools.length})</h3>
        {tools.map((t) => (
          <div key={t.id} style={{ paddingBlock: 'var(--space-xs)', borderTop: '1px solid var(--color-border)', marginTop: 'var(--space-xs)' }}>
            <strong className="mono">{t.tool_key}</strong>
            <p className="card__meta">{t.http_method} {t.path_template}</p>
            <p className="card__meta">{t.description}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'var(--space-lg)' }}>
        <CloneTemplateForm
          templateSlug={template.slug}
          defaultName={template.name}
          defaultBaseUrl={template.default_base_url}
          credentialFields={template.credential_fields}
        />
      </div>
    </>
  )
}
