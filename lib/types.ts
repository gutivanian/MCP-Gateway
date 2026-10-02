export interface ToolFieldDef {
  key: string
  type: 'string' | 'number' | 'boolean' | 'enum'
  required: boolean
  description?: string
  enumValues?: string[]
  default?: string | number | boolean
  in: 'path' | 'query' | 'body'
  bodyPath?: string
}

export interface ToolRowShape {
  tool_key: string
  title: string
  description: string
  input_fields: ToolFieldDef[]
  http_method: string
  path_template: string
  response_path: string | null
  sort_order?: number
}

export interface CredentialFieldDef {
  key: string
  label: string
  type: 'string' | 'secret'
  required: boolean
}

export interface TemplateRow {
  id: number
  slug: string
  name: string
  description: string | null
  default_base_url: string
  auth_header_name: string
  auth_header_value_template: string | null
  success_path: string | null
  credential_fields: CredentialFieldDef[]
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface TemplateToolRow extends ToolRowShape {
  id: number
  template_id: number
}

export interface GatewayRow {
  id: number
  owner_user_id: number
  template_id: number | null
  slug: string
  name: string
  description: string | null
  base_url: string
  auth_header_name: string
  auth_header_value_template: string | null
  success_path: string | null
  credentials: Record<string, string>
  token_prefix: string
  token_hash: string
  token_revoked_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GatewayToolRow extends ToolRowShape {
  id: number
  gateway_id: number
  is_enabled: boolean
}

export interface UserRow {
  id: number
  email: string
  password_hash: string
  name: string | null
  created_at: string
  updated_at: string
}
