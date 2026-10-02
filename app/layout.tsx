export const metadata = { title: 'mcp-gateway' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'ui-monospace, monospace', background: '#0a0a0a', color: '#e5e5e5' }}>
        {children}
      </body>
    </html>
  )
}
