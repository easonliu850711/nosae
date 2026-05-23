'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Wind, RotateCcw, Sunrise, Cloud, Sunset, Moon, Star } from 'lucide-react'

/* ── 每日一詩 ── 
 *  每週七天，各有不同的氛圍與色調。
 *  星期日的版本特別溫柔 — 休息日、整理日、也是迎接新週的準備日。
 */

const DAY_POEMS: Record<number, {
  title: string
  lines: string[]
  vibe: string
  gradient: string
  icon: React.ReactNode
}> = {
  0: { // Sunday
    title: '日曜の静けさ',
    vibe: '靜謐 · 整理 · 準備',
    gradient: 'from-amber-100/80 via-orange-50 to-rose-100/80',
    icon: <Sunrise className="w-4 h-4 text-amber-500" />,
    lines: [
      '星期日的早晨，連時針都走得慢一些。',
      '昨晚展場的燈火熄了，今天讓靈感休息。',
      '整理一周的碎片，把它們折好放進心裡。',
      '明日がまた始まるから。',
    ],
  },
  1: { // Monday
    title: '月曜の息吹',
    vibe: '清新 · 起點 · 專注',
    gradient: 'from-sky-100/80 via-blue-50 to-indigo-100/80',
    icon: <Cloud className="w-4 h-4 text-sky-500" />,
    lines: [
      '星期一，世界重新運轉的聲音。',
      '把昨天的沉澱化為今天的燃料。',
      '新的開始不需要完美，只需要第一步。',
      '一週の物語が、今日から始まる。',
    ],
  },
  2: { // Tuesday
    title: '火曜の灯り',
    vibe: '溫暖 · 持續 · 節奏',
    gradient: 'from-pink-100/80 via-rose-50 to-pink-100/80',
    icon: <Sparkles className="w-4 h-4 text-pink-500" />,
    lines: [
      '星期二的節奏已經穩定下來。',
      '火曜日的燈火，不刺眼也不熄滅。',
      '持續前進比衝刺更值得驕傲。',
      '歩みを止めずに、ゆっくりでいい。',
    ],
  },
  3: { // Wednesday
    title: '水曜の深み',
    vibe: '沉穩 · 反思 · 調整',
    gradient: 'from-teal-100/80 via-emerald-50 to-teal-100/80',
    icon: <Wind className="w-4 h-4 text-teal-500" />,
    lines: [
      '星期三，一週的中點站。',
      '回首前兩日的足跡，調整剩餘的路線。',
      '水曜日的水，流動而不急迫。',
      '折り返し地点で、深呼吸を一つ。',
    ],
  },
  4: { // Thursday
    title: '木曜の根',
    vibe: '扎根 · 完成 · 踏實',
    gradient: 'from-green-100/80 via-lime-50 to-green-100/80',
    icon: <Star className="w-4 h-4 text-green-500" />,
    lines: [
      '星期四，樹木把根扎得更深。',
      '週末還未到，但已經可以看見輪廓。',
      '現在做的事，會在週末開花。',
      '根を張れば、必ず花が咲く。',
    ],
  },
  5: { // Friday
    title: '金曜の輝き',
    vibe: '期待 · 收束 · 放鬆',
    gradient: 'from-amber-100/80 via-yellow-50 to-orange-100/80',
    icon: <Sunset className="w-4 h-4 text-amber-500" />,
    lines: [
      '星期五，空氣中飄著週末的氣息。',
      '一週的努力在今天收尾。',
      '金曜日的金色，是太陽即將休息的信號。',
      'よく頑張った。あとは休むだけ。',
    ],
  },
  6: { // Saturday
    title: '土曜の余白',
    vibe: '自由 · 探索 · 玩樂',
    gradient: 'from-purple-100/80 via-violet-50 to-purple-100/80',
    icon: <Moon className="w-4 h-4 text-purple-500" />,
    lines: [
      '星期六，時間是自己的。',
      '沒有行程表的日子，也是一種行程。',
      '探索、放空、或好好睡一覺——都好。',
      '自由な一日を、好きなように。',
    ],
  },
}

export default function WeeklyRhythm() {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => setVisible(true), 400)
    return () => clearTimeout(timer)
  }, [])

  const today = useMemo(() => {
    const d = new Date()
    // Get JST day of week
    const jst = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
    return jst.getDay() // 0=Sun, 1=Mon ...
  }, [])

  const poem = DAY_POEMS[today]
  const dayNames = ['日', '月', '火', '水', '木', '金', '土']

  if (!mounted) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="max-w-md mx-auto">
            {/* Day indicator */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-6 h-[1px] bg-gradient-to-r from-transparent via-pink-200/60 to-transparent" />
              <div className="flex items-center gap-1.5 text-[10px] tracking-widest text-pink-400/60 uppercase font-medium">
                {poem.icon}
                {dayNames[today]}曜日 · {poem.vibe}
              </div>
              <div className="w-6 h-[1px] bg-gradient-to-r from-transparent via-pink-200/60 to-transparent" />
            </div>

            {/* Poem card */}
            <div className="relative">
              <div className={`rounded-2xl bg-gradient-to-b ${poem.gradient} backdrop-blur-sm border border-white/40 shadow-sm px-6 py-5`}>
                {/* Decorative 4 small dots */}
                <div className="absolute top-3 right-4 flex gap-1.5">
                  {[0, 1, 2, 3].map(i => (
                    <motion.span
                      key={i}
                      className="w-1 h-1 rounded-full bg-pink-300/40"
                      animate={{ opacity: [0.2, 0.6, 0.2] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
                    />
                  ))}
                </div>

                {/* Title */}
                <h3 className="text-center text-sm font-bold text-pink-800 mb-3 tracking-wide">
                  {poem.title}
                </h3>

                {/* Poem lines */}
                <div className="space-y-2">
                  {poem.lines.map((line, i) => (
                    <motion.p
                      key={i}
                      className="text-sm text-pink-700/80 text-center leading-relaxed italic"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.12, duration: 0.4 }}
                    >
                      {line}
                    </motion.p>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-2 mt-4 pt-2 border-t border-pink-200/40">
                  <Wind className="w-3 h-3 text-pink-300/50" />
                  <span className="text-[9px] text-pink-400/50 tracking-wider">
                    Nosae · 週日の詩
                  </span>
                  <Wind className="w-3 h-3 text-pink-300/50" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
