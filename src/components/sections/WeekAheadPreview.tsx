'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight, Coffee, Compass, Sparkles } from 'lucide-react'

/**
 * WeekAheadPreview — 每週展望（星期日限定）
 * 星期日傍晚/晚上顯示，低調提醒即將到來的一週。
 */

const UPCOMING_WEEK = [
  { day: '月', date: '5/25', note: '新的一週', vibes: '☕' },
  { day: '火', date: '5/26', note: '充實向前', vibes: '🎨' },
  { day: '水', date: '5/27', note: '中點反思', vibes: '📝' },
  { day: '木', date: '5/28', note: '高爾夫🏌️', vibes: '⛳' },
  { day: '金', date: '5/29', note: '黃昏加速', vibes: '🌆' },
  { day: '土', date: '5/30', note: '週末前夜', vibes: '🎉' },
  { day: '日', date: '5/31', note: 'APM維護日', vibes: '🔧' },
]

export default function WeekAheadPreview() {
  const [now, setNow] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const display = useMemo(() => {
    const h = now.getHours()
    const day = now.getDay()
    if (day !== 0 || h < 15) return null
    return true
  }, [now])

  if (!mounted || !display) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="mb-8"
    >
      <div className="rounded-2xl border border-pink-200/30 bg-gradient-to-br from-pink-50/40 via-white/40 to-rose-50/40 backdrop-blur-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 shrink-0 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br from-pink-400 to-rose-400">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#3b1025]">📆 下週展望</h3>
            <p className="text-xs text-pink-600/70">星期日 · 為明日做好準備</p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {UPCOMING_WEEK.map((item) => (
            <div
              key={item.day}
              className="flex flex-col items-center gap-1 p-1.5 rounded-xl bg-white/40 border border-pink-100/30 hover:bg-white/60 transition-colors"
            >
              <span className={`text-[10px] font-bold ${item.day === '日' ? 'text-pink-500' : 'text-pink-700/70'}`}>
                {item.day}
              </span>
              <span className="text-[9px] text-pink-500/60">{item.date}</span>
              <span className="text-xs">{item.vibes}</span>
              <span className="text-[8px] text-pink-600/60 text-center leading-tight">{item.note}</span>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-3 flex items-center gap-2 justify-end"
        >
          <Sparkles className="w-3 h-3 text-pink-400" />
          <span className="text-[10px] text-pink-500/50">每週，都是新的開始</span>
        </motion.div>
      </div>
    </motion.div>
  )
}
