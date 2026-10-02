/**
 * lib/mcp-helpers.ts — util kecil dipakai kedua route MCP (enki & hive).
 */

export function textResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
}

export function errorResult(e: unknown) {
  const message = e instanceof Error ? e.message : String(e)
  return { content: [{ type: 'text' as const, text: `Error: ${message}` }], isError: true }
}

/** Bungkus handler tool: hasil sukses jadi JSON text, error jadi isError:true (bukan 500). */
export function safeTool<Args, R>(fn: (args: Args) => Promise<R>) {
  return async (args: Args) => {
    try {
      return textResult(await fn(args))
    } catch (e) {
      return errorResult(e)
    }
  }
}
