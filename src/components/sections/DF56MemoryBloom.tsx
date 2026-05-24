'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Heart, Star, Palette, Camera, Music, Sun, Award } from 'lucide-react'

/**
 * DF56MemoryBloom — Design Festa 56 記憶花瓣
 *
 * 在 DF56 最終日 (5/24) 17:00 之後，以及 Afterglow 期間，
 * 以花瓣飄散動畫呈現三天的展會記憶。
 */

const MEMORY_PETALS = [
  { text: '三天展期的所有問候', icon: '👋', gradient: 'from-purple-400 to-pink-400' },
  { text: '無數次的作品介紹', icon: '🎨', gradient: 'from-pink-400 to-rose-400' },
  { text: '交換名片時的微笑', icon: '😊', gradient: 'from-amber-400 to-pink-400' },
  { text: '展場獨有的創作對話', icon: '💬', gradient: 'from-rose-400 to-purple-400' },
  { text: '最後一刻的靈感交流', icon: '✨', gradient: 'from-indigo-400 to-purple-400' },
  { text: '收攤時的溫馨道別', icon: '🌅', gradient: 'from-orange-400 to-rose-400' },
  { text: '與作品合影的訪客', icon: '📸', gradient: 'from-teal-400 to-pink-400' },
  { text: '深夜準備的疲憊與興奮', icon: '🌙', gradient: 'from-blue-400 to-purple-400' },
]

const AFTERGLOW_DURATION_DAYS = 7

export default function DF56MemoryBloom() {
  const [now, setNow] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const showMode = useMemo<'closing' | 'afterglow' | null>(() => {
    const today = now.toISOString().slice(0, 10)
    // Show closing from 17:00 on 5/24
    if (today === '2026-05-24' && now.getHours() >= 17) return 'closing'
    // Show afterglow for 7 days after DF56
    const endDate = new Date('2026-05-24T23:59:59+09:00')
    const daysSinceEnd = (now.getTime() - endDate.getTime()) / 86400000
    if (daysSinceEnd >= 0 && daysSinceEnd <= AFTERGLOW_DURATION_DAYS) return 'afterglow'
    return null
  }, [now])

  if (!mounted || !showMode) return null

  const isAfterglow = showMode === 'afterglow'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className={`relative overflow-hidden rounded-2xl mb-8 ${
        isAfterglow
          ? 'bg-gradient-to-br from-purple-100/60 via-pink-50/60 to-rose-100/60 border border-purple-200/40'
          : 'bg-gradient-to-br from-purple-500/10 via-pink-400/10 to-rose-500/10 border border-purple-300/20'
      }`}
    >
      {/* 花瓣飄散動畫 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }, (_, i) => {
          const petalW = 6 + Math.random() * 8
          const petalH = petalW * 1.3
          const colors = ['rgba(168,85,247,0.25)', 'rgba(236,72,153,0.2)', 'rgba(244,114,182,0.2)', 'rgba(251,191,36,0.15)']
          return (
            <motion.div
              key={i}
              className="absolute rounded-full backdrop-blur-sm"
              style={{
                left: `${5 + Math.random() * 90}%`,
                top: `${-5 - Math.random() * 10}%`,
                width: petalW,
                height: petalH,
                background: colors[i % colors.length],
              }}
              animate={{
                y: ['-5%', `${100 + Math.random() * 20}%`],
                x: [0, 15, -10, 8, 0],
                rotate: [0, 45, 90, 135, 180],
                opacity: [0.1, 0.4, 0.2, 0.3, 0.1],
              }}
              transition={{
                duration: 12 + Math.random() * 8,
                repeat: Infinity,
                delay: i * 0.8,
                ease: 'easeInOut',
              }}
            />
          )
        })}
      </div>

      <div className="relative z-10 p-5 md:p-6">
        {/* 標題 */}
        <div className="flex items-center gap-2 mb-4">
          <motion.span
            className="text-lg"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎨
          </motion.span>
          <div>
            <h3 className={`font-bold text-lg ${isAfterglow ? 'text-purple-700' : 'text-purple-800'}`}>
              {isAfterglow ? 'DF56 記憶花園' : 'DF56 最終日 · 閉幕倒數'}
            </h3>
            <p className={`text-xs mt-0.5 ${isAfterglow ? 'text-purple-500/70' : 'text-purple-600/60'}`}>
              {isAfterglow
                ? '為期三天的創作祭典已落幕，但每一刻都像花瓣一樣綻放、飄散。'
                : '展場的燈即將熄滅，但創作的種子已種在每個人的心中。'}
            </p>
          </div>
        </div>

        {/* 記憶花瓣網格 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {MEMORY_PETALS.map((petal, i) => (
            <motion.div
              key={petal.text}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`rounded-xl p-3 border text-center ${
                isAfterglow
                  ? 'bg-white/70 border-purple-200/40 hover:bg-white/90'
                  : 'bg-white/40 border-white/30 hover:bg-white/60 backdrop-blur-sm'
              } transition-all cursor-default`}
              whileHover={{ y: -2, scale: 1.02 }}
            >
              <span className="text-xl block mb-1">{petal.icon}</span>
              <p className={`text-[10px] ${isAfterglow ? 'text-purple-600/80' : 'text-purple-700/80'}`}>
                {petal.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* 底部訊息 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 flex items-center justify-center gap-3"
        >
          <span className={`text-xs ${isAfterglow ? 'text-purple-400/70' : 'text-purple-500/60'}`}>
            {isAfterglow ? (
              <>🌸 花瓣雖散落，記憶依然鮮明 · DF56 Afterglow</>
            ) : (
              <>🕯️ 最後一盞燈熄滅前，創作永遠在進行 · DF56</>
            )}
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}
