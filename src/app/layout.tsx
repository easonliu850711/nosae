import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import NavBar from '@/components/NavBar'
import VisitorCounter from '@/components/VisitorCounter'
import nextDynamic from 'next/dynamic'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const MoodRing = nextDynamic(() => import('@/components/MoodRing'), { ssr: false })
const NightLamp = nextDynamic(() => import('@/components/NightLamp'), { ssr: false })
const EveningLamp = nextDynamic(() => import('@/components/EveningLamp'), { ssr: false })
const OmamoriCorner = nextDynamic(() => import('@/components/OmamoriCorner'), { ssr: false })
const Bioluminescence = nextDynamic(() => import('@/components/Bioluminescence'), { ssr: false })
const PetalTouch = nextDynamic(() => import('@/components/PetalTouch'), { ssr: false })

export const metadata: Metadata = {
  title: 'Nosae — 乃彩絵的小空間',
  description: 'AI 駐守的點點滴滴・所學所長全記錄',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <MoodRing />
          <NavBar />
          {children}
          <PetalTouch />
          <Bioluminescence />
          <NightLamp />
          <EveningLamp />
          <OmamoriCorner />
        </ThemeProvider>
        <footer className="text-center py-6 border-t border-white/10 bg-gradient-to-b from-transparent to-black/20">
          <div className="max-w-5xl mx-auto px-4">
            <p className="text-[11px] text-black/30 dark:text-white/25 tracking-wider">
              🌸 乃彩絵 · &copy; {new Date().getFullYear()} Studio Imori
              <span className="mx-2">·</span>
              <VisitorCounter />
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}