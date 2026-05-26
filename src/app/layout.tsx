import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/NavBar'
import VisitorCounter from '@/components/VisitorCounter'
import ThemeToggleFixed from '@/components/ThemeToggle'
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
        <MoodRing />
        <ThemeToggleFixed />
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
        <PetalTouch />
        <Bioluminescence />
        <NightLamp />
        <EveningLamp />
        <OmamoriCorner />
      </body>
    </html>
  )
}
