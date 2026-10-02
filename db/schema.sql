-- Conduit schema. Apply once against the target Postgres database.

CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mcp_templates (
  id                         BIGSERIAL PRIMARY KEY,
  slug                       VARCHAR(64) UNIQUE NOT NULL,
  name                       VARCHAR(120) NOT NULL,
  description                TEXT,
  default_base_url           TEXT NOT NULL,
  auth_header_name           VARCHAR(80) NOT NULL DEFAULT 'Authorization',
  auth_header_value_template TEXT,
  success_path               VARCHAR(80),
  credential_fields          JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_public                  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mcp_template_tools (
  id             BIGSERIAL PRIMARY KEY,
  template_id    BIGINT NOT NULL REFERENCES mcp_templates(id) ON DELETE CASCADE,
  tool_key       VARCHAR(80) NOT NULL,
  title          VARCHAR(160) NOT NULL,
  description    TEXT NOT NULL,
  input_fields   JSONB NOT NULL DEFAULT '[]'::jsonb,
  http_method    VARCHAR(10) NOT NULL,
  path_template  TEXT NOT NULL,
  response_path  TEXT,
  sort_order     INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (template_id, tool_key)
);
CREATE INDEX IF NOT EXISTS idx_template_tools_template ON mcp_template_tools(template_id);

CREATE TABLE IF NOT EXISTS gateways (
  id                          BIGSERIAL PRIMARY KEY,
  owner_user_id               BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id                 BIGINT REFERENCES mcp_templates(id) ON DELETE SET NULL,
  slug                        VARCHAR(64) UNIQUE NOT NULL,
  name                        VARCHAR(120) NOT NULL,
  description                 TEXT,
  base_url                    TEXT NOT NULL,
  auth_header_name            VARCHAR(80) NOT NULL DEFAULT 'Authorization',
  auth_header_value_template  TEXT,
  success_path                VARCHAR(80),
  credentials                 JSONB NOT NULL DEFAULT '{}'::jsonb,
  token_prefix                VARCHAR(16) NOT NULL,
  token_hash                  VARCHAR(128) NOT NULL UNIQUE,
  token_revoked_at            TIMESTAMPTZ,
  is_active                   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gateways_owner ON gateways(owner_user_id);

CREATE TABLE IF NOT EXISTS gateway_tools (
  id             BIGSERIAL PRIMARY KEY,
  gateway_id     BIGINT NOT NULL REFERENCES gateways(id) ON DELETE CASCADE,
  tool_key       VARCHAR(80) NOT NULL,
  title          VARCHAR(160) NOT NULL,
  description    TEXT NOT NULL,
  input_fields   JSONB NOT NULL DEFAULT '[]'::jsonb,
  http_method    VARCHAR(10) NOT NULL,
  path_template  TEXT NOT NULL,
  response_path  TEXT,
  sort_order     INT NOT NULL DEFAULT 0,
  is_enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (gateway_id, tool_key)
);
CREATE INDEX IF NOT EXISTS idx_gateway_tools_gateway ON gateway_tools(gateway_id);
