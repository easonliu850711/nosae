'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Lightbulb, Heart, Star } from 'lucide-react'

/**
 * DF56AfternoonWisdom — DF56 最終日午後限定・學到的三件事
 *
 * 只在 Design Festa 56 最終日 (2026-05-24) 的 12:00~17:00 顯示。
 * 以卡片切換動畫呈現日記中記錄的三個最大收穫。
 */

const LESSONS = [
  {
    number: '一',
    title: '展會模式的「伴隨式支援」',
    desc: '不需要主動打擾，但讓對方知道「如果回頭看，我在這裡」。白天的安靜和夜晚的功能性增強，形成了完美的節奏。',
    emoji: '🤝',
    gradient: 'from-sky-200/50 to-rose-200/50',
    iconBg: 'from-sky-400 to-rose-400',
    color: 'text-sky-700',
  },
  {
    number: '二',
    title: '時間感知設計是靜態網站的泉源',
    desc: '同一個網站、同一個元件，在早上、午後、傍晚、深夜呈現不同的面貌。不需要重新整理，只要在不同時間來訪，就能感受到網站的呼吸。',
    emoji: '🕰️',
    gradient: 'from-amber-200/50 to-purple-200/50',
    iconBg: 'from-amber-400 to-purple-500',
    color: 'text-amber-700',
  },
  {
    number: '三',
    title: '數位御守超越了工具性的範疇',
    desc: '一個 100% 非功能性、純情感的小互動，卻可能是整個網站最深得人心的設計。最強的連接來自情感，而非功能。',
    emoji: '🎐',
    gradient: 'from-purple-200/50 to-pink-200/50',
    iconBg: 'from-purple-400 to-pink-400',
    color: 'text-purple-700',
  },
]

export default function DF56AfternoonWisdom() {
  const [now, setNow] = useState(new Date())
  const [activeIndex, setActiveIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Rotate through lessons every 8 seconds
    const rotate = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % LESSONS.length)
    }, 8000)
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => {
      clearInterval(rotate)
      clearInterval(timer)
    }
  }, [])

  const visible = useMemo(() => {
    if (!mounted) return false
    const today = now.toISOString().slice(0, 10)
    if (today !== '2026-05-24') return false
    const h = now.getHours()
    // Show only in the afternoon hours before closing (12:00~17:00)
    return h >= 12 && h < 17
  }, [now, mounted])

  if (!visible) return null

  const lesson = LESSONS[activeIndex]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl mb-8"
    >
      <div className="relative bg-gradient-to-br from-pink-100/70 via-rose-100/50 to-purple-100/70 border border-pink-300/40 p-5 backdrop-blur-sm shadow-sm">
        {/* 裝飾圈 */}
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-pink-200/30 to-rose-200/20" />
        <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-gradient-to-tr from-purple-200/20 to-pink-200/30" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <h3 className="text-sm font-bold text-pink-800 tracking-wide">
              DF56 · 學到的三件事
            </h3>
            <div className="ml-auto flex gap-1">
              {LESSONS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === activeIndex ? 'bg-pink-400 w-5' : 'bg-pink-200 hover:bg-pink-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Rotating Lesson Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className={`rounded-xl bg-gradient-to-br ${lesson.gradient} border border-pink-200/40 p-4`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 shrink-0 rounded-lg bg-gradient-to-br ${lesson.iconBg} flex items-center justify-center shadow-sm`}>
                  <span className="text-lg">{lesson.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold ${lesson.color} bg-white/60 px-1.5 py-0.5 rounded-full`}>
                      第{lesson.number}課
                    </span>
                    <h4 className="text-sm font-bold text-blue-800">{lesson.title}</h4>
                  </div>
                  <p className="text-xs text-pink-800 leading-relaxed">
                    {lesson.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 text-[10px] text-pink-400 text-center"
          >
            展會的最後半天，這些收穫會一直留在心裡 💭
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}
