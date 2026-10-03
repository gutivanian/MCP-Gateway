export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { createMcpHandler } from 'mcp-handler'
import { executeTool } from '@/lib/connector'
import { findGatewayBySlug, isGatewayTokenValid, listGatewayTools } from '@/lib/gateways'
import { safeTool } from '@/lib/mcp-helpers'
import { buildZodSchema } from '@/lib/tool-schema'
import { extractBearerToken } from '@/lib/tokens'

async function withBothAcceptTypes(req: Request): Promise<Request> {
  const accept = req.headers.get('accept') ?? ''
  if (accept.includes('application/json') && accept.includes('text/event-stream')) return req
  const headers = new Headers(req.headers)
  headers.set('accept', 'application/json, text/event-stream')
  const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.text()
  return new Request(req.url, { method: req.method, headers, body })
}

async function handleRequest(incoming: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const req = await withBothAcceptTypes(incoming)
  const gateway = await findGatewayBySlug(slug)
  if (!gateway || !gateway.is_active) return new Response('Not found', { status: 404 })

  const token = extractBearerToken(req)
  if (!token || !isGatewayTokenValid(gateway, token)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const tools = (await listGatewayTools(gateway.id)).filter((t) => t.is_enabled)

  const handler = createMcpHandler(
    (server) => {
      for (const tool of tools) {
        server.registerTool(
          tool.tool_key,
          {
            title: tool.title,
            description: tool.description,
            inputSchema: buildZodSchema(tool.input_fields),
          },
          safeTool((args: Record<string, unknown>) => executeTool(gateway, tool, args))
        )
      }
    },
    { serverInfo: { name: `conduit-${slug}`, version: '0.1.0' } }
  )

  return handler(req)
}

export { handleRequest as GET, handleRequest as POST }
