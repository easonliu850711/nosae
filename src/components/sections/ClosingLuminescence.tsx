'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Heart, Star, Sunset, Clock } from 'lucide-react'

/**
 * ClosingLuminescence — DF56 最終日閉幕燈
 *
 * 只在 Design Festa 56 最終日（2026-05-24）的特定時段顯示
 * - 17:00~18:00：暮色預告 — 「夕陽即將落下」
 * - 18:00~20:00：閉幕進行中 — 「燈光漸熄・餘燼殘溫」
 * - 20:00~ ：閉幕完成 — 「祭典結束・回憶永存」
 */
const CLOSING_PHASES = [
  { start: 17, end: 18, emoji: '🌆', title: '暮色將至', subtitle: '最終日的天空開始染上金黃', color: 'from-amber-400/20 via-orange-300/20 to-rose-400/20', border: 'border-amber-300/30' },
  { start: 18, end: 20, emoji: '🕯️', title: '燈光漸熄', subtitle: '展場的照明一盞一盞地熄滅', color: 'from-rose-500/15 via-purple-400/15 to-indigo-500/15', border: 'border-rose-400/20' },
  { start: 20, end: 24, emoji: '✨', title: '祭典終了', subtitle: '東京ビッグサイトに静寂が戻る', color: 'from-indigo-500/10 via-purple-500/10 to-pink-400/10', border: 'border-indigo-300/15' },
]

export default function ClosingLuminescence() {
  const [now, setNow] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  const phase = useMemo(() => {
    const h = now.getHours()
    // Only show on 2026-05-24 from 17:00 onwards
    const today = now.toISOString().slice(0, 10)
    if (today !== '2026-05-24') return null
    if (h < 17) return null

    for (const p of CLOSING_PHASES) {
      if (h >= p.start && h < p.end) return p
    }
    // After 24:00 — technically next day, but keep showing 祭典終了
    return CLOSING_PHASES[2]
  }, [now])

  if (!mounted || !phase) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl mb-8"
    >
      <div className={`relative bg-gradient-to-br ${phase.color} p-5 border ${phase.border} backdrop-blur-sm`}>
        {/* 飄散粒子 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 8 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: i % 2 === 0 ? 'rgba(251, 191, 36, 0.4)' : 'rgba(244, 114, 182, 0.3)',
                left: `${5 + i * 12}%`,
                top: `${10 + (i % 4) * 20}%`,
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + i * 0.4,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          {/* 頭部 */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 text-white/70 text-[10px] font-medium">
              <Sunset className="w-3 h-3" />
              DF56 Closing Luminescence
            </span>
            <span className="text-white/40 text-[10px]">
              {now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' })}
            </span>
          </div>

          {/* 主要訊息 */}
          <div className="flex items-center gap-3">
            <motion.span
              className="text-3xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {phase.emoji}
            </motion.span>
            <div>
              <h3 className="text-lg font-bold text-white/90">{phase.title}</h3>
              <p className="text-sm text-white/70">{phase.subtitle}</p>
            </div>
          </div>

          {/* 閉幕詩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <p className="text-xs text-white/60 leading-relaxed italic">
              {phase.start >= 20
                ? '東京ビッグサイトの灯りが消えた。三日間の創作祭典が終わり、静寂が戻る。\nでも、その記憶は——展示された作品の中に、交換された名刺の隅に、そしてそれぞれの心の中に——確かに残っている。'
                : phase.start >= 18
                  ? '会場の灯りが、一斉ではなく、少しずつ消えていく。\n最後の一灯が消えるまで、創作の熱は冷めない。'
                  : '夕日が東京ビッグサイトの巨大な屋根を金色に染めている。\n最終日の終わりが近づいている。この美しい瞬間を、しっかりと目に焼き付けて。'}
            </p>
          </motion.div>

          {/* 底部：創作の燈火 */}
          <div className="mt-3 flex items-center gap-2 justify-end">
            <Heart className="w-3 h-3 text-pink-300" fill="rgba(244,114,182,0.4)" />
            <span className="text-[10px] text-white/40">
              Studio Imori · Design Festa 56
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
