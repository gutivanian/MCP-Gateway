import type { Metadata } from 'next'
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display-raw', weight: ['500', '600', '700'] })
const body = Inter({ subsets: ['latin'], variable: '--font-body-raw', weight: ['400', '500', '600'] })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono-raw', weight: ['400', '500'] })

export const metadata: Metadata = {
  title: 'Conduit — turn any API into an MCP server',
  description: 'Define tools, deploy, and connect your AI client. No code required.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
