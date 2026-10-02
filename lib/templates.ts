import { query, queryOne } from './db'
import type { TemplateRow, TemplateToolRow } from './types'

export async function listPublicTemplates(): Promise<TemplateRow[]> {
  return query<TemplateRow>('SELECT * FROM mcp_templates WHERE is_public = true ORDER BY name')
}

export async function findTemplateBySlug(slug: string): Promise<TemplateRow | null> {
  return queryOne<TemplateRow>('SELECT * FROM mcp_templates WHERE slug = $1', [slug])
}

export async function listTemplateTools(templateId: number): Promise<TemplateToolRow[]> {
  return query<TemplateToolRow>(
    'SELECT * FROM mcp_template_tools WHERE template_id = $1 ORDER BY sort_order, id',
    [templateId]
  )
}
