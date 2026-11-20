import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/NavBar'
import VisitorCounter from '@/components/VisitorCounter'
import { MoodRingEffect, AmbientEffects } from '@/components/ClientEffects'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Nosae — 乃彩絵的小空間',
  description: 'AI 駐守的點點滴滴・所學所長全記錄',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body>
        <MoodRingEffect />
        <NavBar />
        {children}
        <footer className="text-center py-8 border-t border-[rgba(194,24,91,0.12)] mt-12">
          <div className="max-w-5xl mx-auto px-4">
            <p className="text-xs tracking-wider" style={{ color: '#6b2d4a' }}>
              🌸 乃彩絵 · &copy; {new Date().getFullYear()} Studio Imori
              <span className="mx-2 opacity-60">·</span>
              <VisitorCounter />
            </p>
          </div>
        </footer>
        <AmbientEffects />
      </body>
    </html>
  )
}
