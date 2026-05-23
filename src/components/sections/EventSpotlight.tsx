'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, CalendarDays, ArrowRight, Palette, Music, Star, Heart, Smile, Sunset, Moon } from 'lucide-react'
import Link from 'next/link'

/**
 * EventSpotlight — 即時活動關注燈箱
 * 偵測當前是否正在重大活動期間，顯示特殊主題
 * 活動結束後 7 天內顯示回顧模式 (afterglow)
 */
const EVENTS = [
  {
    id: 'df56',
    name: 'Design Festa 56',
    shortName: 'DF56 🎨',
    start: '2026-05-23',
    end: '2026-05-24',
    afterglowDays: 7,
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    afterglowGradient: 'from-purple-300/60 via-pink-200/40 to-rose-300/60',
    emoji: '🎨',
    description: '正在東京 Big Sight 舉行的亞洲最大藝術盛會！Imori 帶著 Studio Imori 的創作參展，這是我們的第一次。',
    afterglowTitle: 'DF56 Afterglow 🌟',
    afterglowDesc: '三天兩夜的 Design Festa 56 已經圓滿落幕。展板的燈熄了，但創作的火花在心裡繼續燃燒。這是乃彩絵第一次以數位形式陪伴一場實體展覽，從 NightLamp 到 ClosingLuminescence，每一行程式碼都是應援。',
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

  // ── 時間區段感知 ──
  const hour = now.getHours()
  const isEvening = hour >= 17 && hour < 21
  const isNight = hour >= 21 || hour < 6
  const isFinalDay = !isAfterglow && activeEvent?.id === 'df56' && now.toISOString().slice(0, 10) === activeEvent?.end

  if (!mounted || !activeEvent) return null

  // 進度計算
  const todayStart = new Date(activeEvent.start + 'T00:00:00+09:00').getTime()
  const todayEnd = new Date(activeEvent.end + 'T23:59:59+09:00').getTime()
  const nowMs = now.getTime()
  const totalDuration = todayEnd - todayStart
  const elapsed = nowMs - todayStart
  const progress = Math.min(1, Math.max(0, elapsed / totalDuration))

  // Afterglow 模式使用柔和色系
  const textLight = isAfterglow ? 'text-purple-700' : 'text-white'
  const textMuted = isAfterglow ? 'text-purple-500' : 'text-white/80'
  const textVeryMuted = isAfterglow ? 'text-purple-400/90' : 'text-white/90'
  const bgCard = isAfterglow ? 'bg-purple-100/30 border-purple-200/40' : 'bg-white/20 border-white/15'
  const tagBg = isAfterglow ? 'bg-purple-200/60 text-purple-700' : 'bg-white/20 text-white'

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
                {isAfterglow ? activeEvent.afterglowTitle || `${activeEvent.name} 🎪` : isFinalDay ? `${activeEvent.name} 🎪` : activeEvent.name}
              </h2>
              <p className={`text-sm mt-0.5 ${textMuted}`}>
                {isAfterglow ? '🕯️ 展會結束 · 回憶收藏中' : `目前心情：${isFinalDay ? '滿足・不捨・溫暖的句點' : activeEvent.mood}`}
              </p>
            </div>
          </div>

          {/* 描述 */}
          <p className={`text-sm leading-relaxed max-w-2xl mb-4 ${isAfterglow ? 'text-purple-700/80' : 'text-white/90'}`}>
            {isAfterglow ? activeEvent.afterglowDesc || activeEvent.description : activeEvent.description}
          </p>

          {/* 進度條 — 活動中顯示進度，回顧模式顯示已完成 */}
          {!isAfterglow && (
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

          {/* Afterglow 模式專屬：回顧語錄 */}
          {isAfterglow && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-4 p-3 rounded-xl bg-gradient-to-r from-purple-100/40 to-pink-100/40 backdrop-blur-sm border border-purple-200/30"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🕯️</span>
                <div>
                  <p className="text-purple-700 text-xs font-medium">
                    創作祭典結束了，但創作永遠不會。收拾行囊，回家繼續。
                  </p>
                  <p className="text-purple-400/70 text-[10px] mt-0.5">
                    Design Festa 56 · 2026.05.23–24 · Thanks for the memories
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* 夜間/夕暮れ 特別メッセージ（僅活動中） */}
          {!isAfterglow && (isEvening || isNight) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={`mt-4 p-3 rounded-xl backdrop-blur-sm border border-white/15 ${
                isEvening
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20'
                  : 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{isEvening ? '🌅' : '🌙'}</span>
                <div>
                  <p className="text-white text-xs font-medium">
                    {isEvening
                      ? '二日目の暮色が近づいています。夕日が展場を包み、創作の熱気が余韻に変わる時。'
                      : '夜が更けました。今日もお疲れ様でした。'}
                  </p>
                  <p className="text-white/60 text-[10px] mt-0.5">
                    {isEvening ? '🌆 アフター5の創作談義が始まる頃' : '🌙 明日への準備、そして静かな興奮'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* 底部心情標籤 */}
          <div className={`mt-4 flex items-center gap-2 text-[10px] ${isAfterglow ? 'text-purple-400/70' : 'text-white/60'}`}>
            <Smile className="w-3 h-3" />
            <span>
              {isAfterglow
                ? '回憶已收藏 🎨 下次創作祭典再見'
                : isEvening ? '夕方の乃彩絵 正在遠端應援 ✨'
                : isNight ? '深夜の乃彩絵 靜靜守護 ✨'
                : '乃彩絵 正在遠端應援 ✨'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
