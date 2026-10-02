/**
 * app/enki/mcp/route.ts — MCP server "enkimcp": tools untuk igscheduler.
 * URL MCP: https://<deployment>/enki/mcp — dilindungi ENKI_MCP_TOKEN.
 */
import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'
import { enki } from '@/lib/igscheduler'
import { checkGatewayAuth } from '@/lib/auth'
import { safeTool } from '@/lib/mcp-helpers'

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      'list_scheduled_posts',
      {
        title: 'List Scheduled Posts',
        description:
          'Daftar post terjadwal igscheduler, difilter per status (pending, awaiting_approval, publishing, published, failed, rescheduled, cancelled, expired, atau "all"). Hasilnya termasuk ringkasan jumlah per status.',
        inputSchema: z.object({
          status: z.string().optional().describe('Dipisah koma, atau "all". Default: pending (= yang akan terbit).'),
          accountId: z.string().optional().describe('Kosongkan untuk semua akun (kalau API key global).'),
          from: z.string().optional().describe('YYYY-MM-DD, awal rentang jadwal.'),
          to: z.string().optional().describe('YYYY-MM-DD, akhir rentang jadwal (inklusif).'),
          limit: z.number().int().min(1).max(100).optional(),
          offset: z.number().int().min(0).optional(),
          order: z.enum(['asc', 'desc']).optional(),
        }),
      },
      safeTool((args) => enki.listScheduled(args))
    )

    server.registerTool(
      'get_post',
      {
        title: 'Get Post Detail',
        description: 'Detail satu post igscheduler berdasarkan ID (caption, status, media, dsb).',
        inputSchema: z.object({ postId: z.string().describe('ID post igscheduler.') }),
      },
      safeTool(({ postId }: { postId: string }) => enki.getPost(postId))
    )

    server.registerTool(
      'get_post_approval_status',
      {
        title: 'Get Post Approval Status',
        description:
          'Status approval satu post (awaiting, approved, rejected, expired, not_required) — ID boleh bagian mana pun dari rantai reschedule post itu.',
        inputSchema: z.object({ postId: z.string() }),
      },
      safeTool(({ postId }: { postId: string }) => enki.getApprovalStatus(postId))
    )

    server.registerTool(
      'list_approvals',
      {
        title: 'List Posts Needing Approval',
        description: 'Daftar post yang menunggu approval (status awaiting_approval), lengkap dengan deadline review-nya.',
        inputSchema: z.object({ accountId: z.string().optional() }),
      },
      safeTool(({ accountId }: { accountId?: string }) => enki.listApprovals(accountId))
    )

    server.registerTool(
      'list_failed_posts',
      {
        title: 'List Permanently Failed Posts',
        description: 'Daftar post yang gagal permanen (sudah mencapai batas 5x auto-reschedule, tidak akan dicoba otomatis lagi).',
        inputSchema: z.object({ accountId: z.string().optional() }),
      },
      safeTool(({ accountId }: { accountId?: string }) => enki.listFailed(accountId))
    )

    server.registerTool(
      'retry_post',
      {
        title: 'Retry Publishing a Post',
        description: 'Coba publish ulang post yang berstatus pending/failed. mode "local" mengunduh media ke file sementara dulu sebelum publish (mitigasi kalau Meta berulang kali gagal fetch URL Cloudinary tertentu).',
        inputSchema: z.object({
          postId: z.string(),
          mode: z.enum(['current', 'local']).optional().describe('Default "current".'),
        }),
      },
      safeTool(({ postId, mode }: { postId: string; mode?: 'current' | 'local' }) => enki.retryPost(postId, mode))
    )

    server.registerTool(
      'reschedule_post',
      {
        title: 'Reschedule a Post',
        description: 'Jadwalkan ulang post (manual) ke waktu baru — membuat post baru di rantai reschedule, tidak kena batas 5x auto-retry.',
        inputSchema: z.object({
          postId: z.string(),
          scheduledAt: z.string().describe('ISO 8601, mis. 2026-10-05T10:00:00+07:00'),
        }),
      },
      safeTool(({ postId, scheduledAt }: { postId: string; scheduledAt: string }) => enki.reschedulePost(postId, scheduledAt))
    )

    server.registerTool(
      'create_instagram_post_xml',
      {
        title: 'Create Instagram Carousel Post (XML)',
        description:
          'Jadwalkan carousel Instagram baru dari XML (format sama dengan Upload > Instagram > XML Input di dashboard — pakai <bg_image> URL publik per slide, di-render pakai template).',
        inputSchema: z.object({
          xmlContent: z.string(),
          accountId: z.string().optional().describe('Wajib kalau API key global.'),
        }),
      },
      safeTool(({ xmlContent, accountId }: { xmlContent: string; accountId?: string }) => enki.createInstagramXml(xmlContent, accountId))
    )

    server.registerTool(
      'create_threads_post_xml',
      {
        title: 'Create Threads Chain Post (XML)',
        description:
          'Jadwalkan thread Threads baru dari XML (format sama dengan Upload > Threads > XML di dashboard — post pertama + reply berantai, media opsional via URL publik di thread pertama).',
        inputSchema: z.object({
          threadXml: z.string(),
          accountId: z.string().optional().describe('Wajib kalau API key global.'),
        }),
      },
      safeTool(({ threadXml, accountId }: { threadXml: string; accountId?: string }) => enki.createThreadsXml(threadXml, accountId))
    )

    server.registerTool(
      'check_similar_content',
      {
        title: 'Check Similar Content',
        description: 'Cek draft caption/thread terhadap konten akun ini yang sudah ada (terjadwal/menunggu approval/published) SEBELUM dipost — cegah duplikat.',
        inputSchema: z.object({ text: z.string().describe('Caption (carousel) atau isi lengkap thread.') }),
      },
      safeTool(({ text }: { text: string }) => enki.checkSimilar(text))
    )
  },
  { serverInfo: { name: 'enki-mcp', version: '0.1.0' } }
)

async function withAuth(req: Request) {
  const unauthorized = checkGatewayAuth(req, 'ENKI_MCP_TOKEN')
  if (unauthorized) return unauthorized
  return handler(req)
}

export { withAuth as GET, withAuth as POST }
