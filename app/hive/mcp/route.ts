/**
 * app/hive/mcp/route.ts — MCP server "hivemcp": tools untuk wa-gateway-go.
 * URL MCP: https://<deployment>/hive/mcp — dilindungi HIVE_MCP_TOKEN.
 */
import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'
import { hive } from '@/lib/wagateway'
import { checkGatewayAuth } from '@/lib/auth'
import { safeTool } from '@/lib/mcp-helpers'

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      'whoami',
      {
        title: 'Who Am I',
        description: 'Info API key wa-gateway yang sedang dipakai: scopes, workspace, dan sesi yang terikat (kalau ada).',
        inputSchema: z.object({}),
      },
      safeTool(() => hive.me())
    )

    server.registerTool(
      'list_sessions',
      {
        title: 'List WhatsApp Sessions',
        description: 'Daftar sesi WhatsApp yang terhubung (nama, status, nomor telepon, workspace).',
        inputSchema: z.object({}),
      },
      safeTool(() => hive.listSessions())
    )

    server.registerTool(
      'send_message',
      {
        title: 'Send WhatsApp Message',
        description:
          'Kirim pesan teks atau lampiran (via URL, bukan upload langsung) ke satu nomor WhatsApp. sessionId boleh dikosongkan kalau API key sudah dipatok ke satu sesi.',
        inputSchema: z.object({
          sessionId: z.string().optional(),
          to: z.string().describe('Nomor tujuan (format internasional, mis. 628123456789).'),
          text: z.string().optional(),
          quotedId: z.string().optional().describe('ID pesan yang mau di-reply/quote.'),
          media: z
            .object({
              url: z.string().describe('URL publik file yang mau dikirim.'),
              kind: z.enum(['image', 'video', 'audio', 'document']),
              caption: z.string().optional(),
              fileName: z.string().optional(),
              mimeType: z.string().optional(),
            })
            .optional(),
        }),
      },
      safeTool((args: Parameters<typeof hive.sendMessage>[0]) => hive.sendMessage(args))
    )
  },
  { serverInfo: { name: 'hive-mcp', version: '0.1.0' } }
)

async function withAuth(req: Request) {
  const unauthorized = checkGatewayAuth(req, 'HIVE_MCP_TOKEN')
  if (unauthorized) return unauthorized
  return handler(req)
}

export { withAuth as GET, withAuth as POST }
