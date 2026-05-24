'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight, Coffee, Compass, Sparkles } from 'lucide-react'

/**
 * WeekAheadPreview — 每週展望（星期日限定）
 *
 * 星期日傍晚/晚上顯示，低調提醒即將到來的一週。
 * 展會終了後的第一個星期日特別溫柔。
 * 之後的普通星期日則回歸一般的週期提醒。
 */

const DF56_CLOSING_DATE = '2026-05-24'

const UPCOMING_WEEK = [
  { day: '月', date: '5/25', note: '日常開始', vibes: '☕' },
  { day: '火', date: '5/26', note: '創作持續', vibes: '🎨' },
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
    const today = now.toISOString().slice(0, 10)
    const h = now.getHours()
    const day = now.getDay()
    // Only show on Sunday (day 0) from 15:00 onwards
    if (day !== 0 || h < 15) return null
    return { today, isDF56ClosingDay: today === DF56_CLOSING_DATE }
  }, [now])

  if (!mounted || !display) return null

  const isDF56 = display.isDF56ClosingDay

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="mb-8"
    >
      <div className={`rounded-2xl border p-5 backdrop-blur-sm
        ${isDF56
          ? 'border-amber-300/20 bg-gradient-to-br from-amber-50/60 via-orange-30/40 to-rose-50/60'
          : 'border-pink-200/30 bg-gradient-to-br from-pink-50/40 via-white/40 to-rose-50/40'
        }`}
      >
        {/* 頭部 */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center shadow-sm
            ${isDF56
              ? 'bg-gradient-to-br from-amber-400 to-rose-400'
              : 'bg-gradient-to-br from-pink-400 to-rose-400'
            }`}
          >
            <Compass className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${isDF56 ? 'text-amber-800' : 'text-blue-800'}`}>
              {isDF56 ? '🌸 展會過後，下一週的開始' : '📆 下週展望'}
            </h3>
            <p className={`text-xs ${isDF56 ? 'text-amber-600/70' : 'text-pink-600/70'}`}>
              星期日 · 為明日做好準備
            </p>
          </div>
          {isDF56 && (
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
              DF56 Afterglow
            </span>
          )}
        </div>

        {/* 展會特別訊息 */}
        {isDF56 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-4 p-3 rounded-xl bg-white/50 border border-amber-200/20"
          >
            <p className="text-xs text-amber-700/80 leading-relaxed">
              三天展會，在東京ビッグサイト的創作者祭典中落幕了。
              整理名片、打包靈感、收納回憶——然後，溫柔地回到日常。
            </p>
            <p className="text-xs text-amber-700/60 mt-1 italic">
              「創作祭典結束了，但創作永遠不會。收拾行囊，回家繼續。」
            </p>
          </motion.div>
        )}

        {/* 週曆格 */}
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

        {/* 明日の心構え */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-3 flex items-center gap-2 justify-end"
        >
          <Sparkles className={`w-3 h-3 ${isDF56 ? 'text-amber-400' : 'text-pink-400'}`} />
          <span className={`text-[10px] ${isDF56 ? 'text-amber-600/50' : 'text-pink-500/50'}`}>
            {isDF56
              ? '明日から新しい物語が始まる'
              : '毎週、新しい始まりがある'}
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}
