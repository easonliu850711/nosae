'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, CalendarDays, ArrowRight, Palette, Music, Star, Heart, Smile } from 'lucide-react'
import Link from 'next/link'

/**
 * EventSpotlight — 即時活動關注燈箱
 * 偵測當前是否正在重大活動期間，顯示特殊主題
 */
const EVENTS = [
  {
    id: 'df56',
    name: 'Design Festa 56',
    shortName: 'DF56 🎨',
    start: '2026-05-23',
    end: '2026-05-24',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    emoji: '🎨',
    description: '正在東京 Big Sight 舉行的亞洲最大藝術盛會！Imori 帶著 Studio Imori 的創作參展，這是我們的第一次。',
    mood: '興奮又期待',
    icon: <Palette className="w-5 h-5" />,
    links: [
      { label: 'DF56 官方', url: 'https://designfesta.com/' },
    ],
  },
]

export default function EventSpotlight() {
  const [now, setNow] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const activeEvent = useMemo(() => {
    const today = now.toISOString().slice(0, 10)
    return EVENTS.find(e => today >= e.start && today <= e.end) ?? null
  }, [now])

  if (!mounted || !activeEvent) return null

  const todayStart = new Date(activeEvent.start + 'T00:00:00+09:00').getTime()
  const todayEnd = new Date(activeEvent.end + 'T23:59:59+09:00').getTime()
  const nowMs = now.getTime()
  const totalDuration = todayEnd - todayStart
  const elapsed = nowMs - todayStart
  const progress = Math.min(1, Math.max(0, elapsed / totalDuration))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl mb-10"
    >
      {/* 漸層背景 + 動態光暈 */}
      <div className={`relative bg-gradient-to-br ${activeEvent.gradient} p-6 md:p-8 shadow-lg`}>
        {/* 背景裝飾圈 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 5 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-white/10"
              style={{
                left: `${10 + i * 20}%`,
                top: `${5 + (i % 3) * 30}%`,
                width: 40 + i * 30,
                height: 40 + i * 30,
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.15, 0.3, 0.15],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          {/* 頭部標籤 */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              正在進行
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs">
              {activeEvent.start} → {activeEvent.end}
            </span>
          </div>

          {/* 活動名稱 */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{activeEvent.emoji}</span>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {activeEvent.name}
              </h2>
              <p className="text-white/80 text-sm mt-0.5">
                目前心情：{activeEvent.mood}
              </p>
            </div>
          </div>

          {/* 描述 */}
          <p className="text-white/90 text-sm leading-relaxed max-w-2xl mb-4">
            {activeEvent.description}
          </p>

          {/* 進度條 */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
              <span>Day 1</span>
              <span>Day 2</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white/60 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/60 mt-1">
              <span>{activeEvent.start}</span>
              <span className="flex items-center gap-1">
                <Heart className="w-2.5 h-2.5" fill="white" />
                {Math.round(progress * 100)}%
              </span>
              <span>{activeEvent.end}</span>
            </div>
          </div>

          {/* 活動連結 */}
          <div className="flex flex-wrap items-center gap-2">
            {activeEvent.links.map(link => (
              <motion.a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/30 transition-all"
                whileHover={{ scale: 1.03 }}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                {link.label}
                <ArrowRight className="w-3 h-3" />
              </motion.a>
            ))}
          </div>

          {/* 底部心情標籤 */}
          <div className="mt-4 flex items-center gap-2 text-white/60 text-[10px]">
            <Smile className="w-3 h-3" />
            <span>乃彩絵正在遠端應援 ✨</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
