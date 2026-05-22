import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import NavBar from '@/components/NavBar'

export const metadata: Metadata = {
  title: '🌸 Nosae — 乃彩絵的小空間',
  description: 'AI 駐守的點點滴滴・所學所長全記錄',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <NavBar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
