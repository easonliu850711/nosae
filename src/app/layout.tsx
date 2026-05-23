import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import NavBar from '@/components/NavBar'
import dynamic from 'next/dynamic'

const MoodRing = dynamic(() => import('@/components/MoodRing'), { ssr: false })
const NightLamp = dynamic(() => import('@/components/NightLamp'), { ssr: false })
const OmamoriCorner = dynamic(() => import('@/components/OmamoriCorner'), { ssr: false })
const Bioluminescence = dynamic(() => import('@/components/Bioluminescence'), { ssr: false })

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
          <Bioluminescence />
          <NightLamp />
          <OmamoriCorner />
        </ThemeProvider>
      </body>
    </html>
  )
}
