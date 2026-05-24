'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Heart, Quote, Star, Sparkles, Clock } from 'lucide-react'

/**
 * AfterglowReflection — 活動後的個人沉澱
 * 在活動結束後的幾天內顯示，以 Nosae 的視角分享反思。
 * 當前無活動，此元件隱藏。
 */

const REFLECTIONS = [
  {
    emoji: '🌙',
    title: '靜夜思',
    period: '夜晚',
    text: '每一天都是一段旅程。\n從晨光的清新到午後的專注，再到夜晚的沈澱——\n\n時間靜靜流過，而我還在這裡，看顧著點點滴滴。',
    color: 'from-indigo-500/20 via-purple-500/15 to-pink-500/20',
    accent: 'rgb(129,140,248)',
    border: 'border-indigo-300/25',
  },
  {
    emoji: '🌸',
    title: '花のように',
    period: '日常',
    text: '花が咲き、散り、また咲く。\n每一天都是新的開始。\n\n昨日の自分を振り返りながら、今日の一歩を踏み出す。\nその繰り返しが、成長というものかもしれない。',
    color: 'from-pink-400/15 via-rose-300/15 to-orange-300/15',
    accent: 'rgb(244,114,182)',
    border: 'border-pink-300/20',
  },
  {
    emoji: '🕯️',
    title: '日常の灯り',
    period: '静かな時間',
    text: '日常の中で見つけた小さな美しさに、\nそっと灯りをともすように。\n\n大げさなことじゃなくていい。\nただ、今日という一日を大切に生きること。\nそれだけで、十分に美しい。',
    color: 'from-slate-400/15 via-purple-400/10 to-indigo-400/15',
    accent: 'rgb(148,163,184)',
    border: 'border-slate-300/20',
  },
]

const DAILY_VIGNETTES = [
  '新しい一日が始まる。今日はどんな一日になるだろう',
  '日々の積み重ねが、いつか花開く',
  '小さな一歩も、振り返れば大きな距離になっている',
  '今日もお疲れ様でした。ゆっくり休んでください',
  '明日もいい日になりますように',
  '季節は巡り、心もまた変わっていく',
  '静かな夜には、やさしい音楽が似合う',
]

export default function AfterglowReflection() {
  const [now, setNow] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const [vignette, setVignette] = useState(0)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setNow(new Date()), 30000)
    const vTimer = setInterval(() => {
      setVignette(prev => (prev + 1) % DAILY_VIGNETTES.length)
    }, 10000)
    return () => { clearInterval(timer); clearInterval(vTimer) }
  }, [])

  // Simple time-based reflection
  const activeReflection = useMemo(() => {
    const h = now.getHours()
    if (h >= 5 && h < 12) return null // daytime - show other components
    if (h >= 12 && h < 17) return null
    if (h >= 17 && h < 21) return 0 // 最終夜→evening
    return 2 // night
  }, [now])

  if (!mounted || activeReflection === null) return null

  const ref = REFLECTIONS[activeReflection]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className={`relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br ${ref.color} border ${ref.border} backdrop-blur-sm`}
    >
      {/* 點點光粒 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: ref.accent.replace('rgb', 'rgba').replace(')', ',0.4)'),
              left: `${8 + i * 11}%`,
              top: `${15 + (i % 3) * 25}%`,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.8, 1],
            }}
            transition={{
              duration: 2.5 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-5 md:p-6">
        {/* 頭部 */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/25 text-white/80 text-[10px] font-medium">
            <Star className="w-3 h-3" />
            {ref.period}
          </span>
          <span className="text-white/40 text-[10px] ml-auto">
            <Clock className="w-3 h-3 inline-block mr-1" />
            心の灯り
          </span>
        </div>

        {/* 主要內容 */}
        <div className="flex gap-4">
          <motion.div
            className="text-3xl flex-shrink-0 mt-1"
            animate={{
              scale: [1, 1.08, 1],
              rotate: [0, 2, -2, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {ref.emoji}
          </motion.div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white/90 mb-1">{ref.title}</h3>
            <p className="text-sm text-white/75 leading-relaxed whitespace-pre-line">
              {ref.text}
            </p>
          </div>
        </div>

        {/* 微語錄輪播 */}
        <motion.div
          key={vignette}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-white/10 border border-white/10"
        >
          <Quote className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
          <p className="text-xs text-white/60 italic">
            {DAILY_VIGNETTES[vignette]}
          </p>
        </motion.div>

        {/* 署名 */}
        <div className="mt-3 flex items-center gap-2 justify-end">
          <Heart className="w-3 h-3 text-pink-300" fill="rgba(244,114,182,0.4)" />
          <span className="text-[10px] text-white/40">Nosae · 日常の詩</span>
        </div>
      </div>
    </motion.div>
  )
}
