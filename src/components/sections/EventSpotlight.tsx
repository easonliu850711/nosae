'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, CalendarDays, ArrowRight, Palette, Music, Star, Heart, Smile, Sunset, Moon } from 'lucide-react'
import Link from 'next/link'

/**
 * EventSpotlight — 即時活動關注燈箱
 * 偵測當前是否正在重大活動期間，顯示特殊主題
 * 活動結束後 7 天內顯示回顧模式 (afterglow)
 *
 * 目前無進行中活動 — 保留結構待未來使用
 */
const EVENTS: Array<{
  id: string
  name: string
  shortName: string
  start: string
  end: string
  afterglowDays: number
  gradient: string
  afterglowGradient: string
  emoji: string
  description: string
  afterglowTitle: string
  afterglowDesc: string
  mood: string
  icon: React.ReactNode
  links: Array<{ label: string; url: string }>
}> = [
  {
    id: 'df56',
    name: '創作祭典 56 @東京ビッグサイト',
    shortName: 'DF56',
    start: '2026-05-22',
    end: '2026-05-24',
    afterglowDays: 7,
    gradient: 'from-amber-400/70 via-orange-300/60 to-rose-400/70',
    afterglowGradient: 'from-purple-200/60 via-pink-100/50 to-rose-200/60',
    emoji: '🎨',
    description: '三天の創作の旅。東京ビッグサイトに集まった創作者たちが、それぞれの作品を展示・販売し、交流を深めた。',
    afterglowTitle: '🎪 創作祭典 56',
    afterglowDesc: '燈火熄了，但火花留下。創作祭典 56 的三天旅程畫上句點，回憶的餘韻還在心裡輕輕發光。',
    mood: '充実した創作の余韻',
    icon: null,
    links: [
      { label: '📖 回顧日記', url: '/diary' },
      { label: '🌸 成長軌跡', url: '/growth' },
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

  const [activeEvent, isAfterglow] = useMemo(() => {
    const today = now.toISOString().slice(0, 10)
    const liveEvent = EVENTS.find(e => today >= e.start && today <= e.end) ?? null
    if (liveEvent) return [liveEvent, false]

    const pastEvent = EVENTS.find(e => {
      if (!e.end || !e.afterglowDays) return false
      const endDate = new Date(e.end + 'T23:59:59+09:00')
      const nowDate = new Date()
      const daysSinceEnd = (nowDate.getTime() - endDate.getTime()) / 86400000
      return daysSinceEnd >= 0 && daysSinceEnd <= e.afterglowDays
    }) ?? null
    if (pastEvent) return [pastEvent, true]

    return [null, false]
  }, [now])

  if (!mounted || !activeEvent) return null

  // ... keep the full rendering logic below for when events exist
  const hour = now.getHours()
  const isEvening = hour >= 17 && hour < 21
  const isNight = hour >= 21 || hour < 6

  const textLight = isAfterglow ? 'text-purple-700' : 'text-white'
  const textMuted = isAfterglow ? 'text-purple-500' : 'text-white/80'
  const bgCard = isAfterglow ? 'bg-purple-100/30 border-purple-200/40' : 'bg-white/20 border-white/15'
  const tagBg = isAfterglow ? 'bg-purple-200/60 text-purple-700' : 'bg-white/20 text-white'

  // 進度計算
  const todayStart = new Date(activeEvent.start + 'T00:00:00+09:00').getTime()
  const todayEnd = new Date(activeEvent.end + 'T23:59:59+09:00').getTime()
  const nowMs = now.getTime()
  const totalDuration = todayEnd - todayStart
  const elapsed = nowMs - todayStart
  const progress = Math.min(1, Math.max(0, elapsed / totalDuration))
  const isFinalDay = !isAfterglow && now.toISOString().slice(0, 10) === activeEvent?.end

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl mb-10"
    >
      <div className={`relative ${
        isAfterglow
          ? 'bg-gradient-to-br from-purple-200/70 via-pink-100/50 to-rose-200/70 border border-purple-200/50'
          : `bg-gradient-to-br ${activeEvent.gradient}`
      } p-6 md:p-8 shadow-lg`}>
        {/* 背景裝飾圈 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: isAfterglow ? 3 : 5 }, (_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${isAfterglow ? 'border border-purple-300/20' : 'border border-white/10'}`}
              style={{
                left: `${10 + i * 20}%`,
                top: `${5 + (i % 3) * 30}%`,
                width: 40 + i * 30,
                height: 40 + i * 30,
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.1, 0.25, 0.1],
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
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-sm text-xs font-medium ${tagBg}`}>
              <Sparkles className="w-3 h-3" />
              {isAfterglow ? '回顧 · 餘韻' : '正在進行'}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-sm text-xs ${isAfterglow ? 'bg-purple-100/40 text-purple-500' : 'bg-white/15 text-white/90'}`}>
              {activeEvent.start} → {activeEvent.end}
              {isFinalDay && (
                <span className="ml-1.5 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-yellow-300/25 text-yellow-100 text-[10px]">
                  ✨ Final Day
                </span>
              )}
              {isAfterglow && (
                <span className="ml-1.5 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-purple-200/30 text-purple-600 text-[10px]">
                  已結束 ✨
                </span>
              )}
            </span>
          </div>

          {/* 活動名稱 */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{activeEvent.emoji}</span>
            <div>
              <h2 className={`text-2xl md:text-3xl font-bold ${textLight}`}>
                {isAfterglow ? activeEvent.afterglowTitle || `${activeEvent.name} 🎪` : activeEvent.name}
              </h2>
              <p className={`text-sm mt-0.5 ${textMuted}`}>
                {isAfterglow ? '🕯️ 展會結束 · 回憶收藏中' : `目前心情：${activeEvent.mood}`}
              </p>
            </div>
          </div>

          {/* 描述 */}
          <p className={`text-sm leading-relaxed max-w-2xl mb-4 ${isAfterglow ? 'text-purple-700/80' : 'text-white/90'}`}>
            {isAfterglow ? activeEvent.afterglowDesc : activeEvent.description}
          </p>

          {/* 進度條 */}
          {!isAfterglow && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
                <span>開始</span>
                <span>終了</span>
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
          )}

          {/* 活動連結 */}
          <div className="flex flex-wrap items-center gap-2">
            {activeEvent.links.map(link => (
              <motion.a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full backdrop-blur-sm text-sm font-medium transition-all ${
                  isAfterglow
                    ? 'bg-purple-100/60 text-purple-600 hover:bg-purple-200/80 border border-purple-200/40'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                whileHover={{ scale: 1.03 }}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                {link.label}
                <ArrowRight className="w-3 h-3" />
              </motion.a>
            ))}
          </div>

          {/* 底部心情標籤 */}
          <div className={`mt-4 flex items-center gap-2 text-[10px] ${isAfterglow ? 'text-purple-400/70' : 'text-white/60'}`}>
            <Smile className="w-3 h-3" />
            <span>
              {isAfterglow
                ? '回憶已收藏 🎨 下次活動再見'
                : '乃彩絵 正在遠端應援 ✨'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
