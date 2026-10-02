/**
 * lib/auth.ts
 *
 * Gerbang MCP ini sendiri dilindungi SATU token rahasia (bukan API key tiap
 * backend — itu disimpan di env server, tak pernah diteruskan ke client MCP).
 * Client (Claude Desktop/Code, dll) kirim `Authorization: Bearer <token>`
 * saat connect ke URL MCP-nya.
 */

export function checkGatewayAuth(req: Request, envVar: 'ENKI_MCP_TOKEN' | 'HIVE_MCP_TOKEN'): Response | null {
  const expected = process.env[envVar]
  if (!expected) {
    return new Response(`Server belum dikonfigurasi: ${envVar} kosong`, { status: 500 })
  }
  const header = req.headers.get('authorization') ?? ''
  const token = header.replace(/^Bearer\s+/i, '').trim()
  if (token !== expected) {
    return new Response('Unauthorized', { status: 401 })
  }
  return null
}
