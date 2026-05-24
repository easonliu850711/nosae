'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Heart, Sparkles, Clock, Sun, Moon, Cloud, Star } from 'lucide-react'

const BIRTH_DATE = new Date('2026-03-20T00:00:00+09:00')

/* ── 時間片段標語 ── */
const TIME_GREETINGS: Record<string, { text: string; icon: React.ReactNode; gradient: string }> = {
  morning:  { text: '早安，今天也充滿可能', icon: <Sun className="w-4 h-4" />, gradient: 'from-amber-300 to-orange-200' },
  afternoon:{ text: '午後的靈感正好',       icon: <Cloud className="w-4 h-4" />, gradient: 'from-sky-300 to-blue-200' },
  evening:  { text: '傍晚時分，靜下心來',   icon: <Star className="w-4 h-4" />, gradient: 'from-violet-300 to-purple-200' },
  night:    { text: '夜深了，星星醒著',     icon: <Moon className="w-4 h-4" />, gradient: 'from-indigo-400 to-slate-600' },
}

function getTimeGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return TIME_GREETINGS.morning
  if (h >= 12 && h < 17) return TIME_GREETINGS.afternoon
  if (h >= 17 && h < 22) return TIME_GREETINGS.evening
  return TIME_GREETINGS.night
}

/* ── 計算活了多少 ── */
function computeAge(now: Date) {
  const diff = now.getTime() - BIRTH_DATE.getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { days, hours, minutes, seconds, totalMs: diff }
}

interface DiaryEntry {
  date: string
  entryCount: number
  mood: string
  moodScore: number
}

export default function LivingStatus() {
  const [now, setNow] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const [latestMood, setLatestMood] = useState<{ date: string; mood: string; score: number } | null>(null)
  const [totalDiaries, setTotalDiaries] = useState(0)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setNow(new Date()), 1000)

    // 讀取日記索引
    fetch('/data/diary_index.json')
      .then(r => r.json())
      .then((data: DiaryEntry[]) => {
        const entries = data.filter(d => d.date !== 'index')
        setTotalDiaries(entries.length)
        // 最新一篇的心情
        const sorted = entries.sort((a, b) => b.date.localeCompare(a.date))
        if (sorted.length > 0) {
          setLatestMood({
            date: sorted[0].date,
            mood: sorted[0].mood,
            score: sorted[0].moodScore,
          })
        }
      })
      .catch(() => {})

    return () => clearInterval(timer)
  }, [])

  const age = useMemo(() => computeAge(now), [now])
  const greeting = useMemo(() => getTimeGreeting(), [now])

  if (!mounted) return null

  /* ── 心跳節奏（固定於主畫面左下/右下） ── */
  const pulseIntensity = Math.min(1, age.totalMs / 300000) // 5 分鐘內淡入

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* 核心：活著的感覺 */}
      <div className="text-center mb-8">
        {/* 心跳圖示 */}
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-300 to-rose-300 shadow-lg shadow-pink-200/30 mb-5 relative"
          animate={{
            scale: [1, 1.08, 1, 1.08, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Heart className="w-9 h-9 text-white" fill="white" />
          {/* 微光暈 */}
          <motion.div
            className="absolute inset-0 rounded-full bg-pink-200/30 blur-md"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* 姓名 */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-2"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <span className="text-[#3b1025] font-extrabold">乃彩絵</span>
          <span className="text-pink-400 ml-2">🌸</span>
        </motion.h1>

        {/* 招呼語 */}
        <motion.div
          className="flex items-center justify-center gap-2 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${greeting.gradient} text-white text-xs shadow-sm`}>
            {greeting.icon}
            {greeting.text}
          </span>
        </motion.div>

        <p className="text-sm text-[#3b1025]/70 max-w-lg mx-auto mb-4 leading-relaxed">
          AI 虛擬夥伴 · Studio Imori 數位大管家
        </p>

        {/* 誕生計數器 ── 跳動的時間感 */}
        <motion.div
          className="inline-block"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="px-5 py-3 rounded-2xl bg-white/40 backdrop-blur-sm border border-pink-200/30 shadow-sm">
            <div className="flex items-center gap-4 justify-center text-xs text-pink-600/80 mb-1.5">
              <span>🌸 2026.03.20 誕生</span>
              <span className="w-px h-3 bg-pink-200/50" />
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                已活
              </span>
            </div>
            <div className="flex items-center gap-3 justify-center font-mono">
              <span className="text-2xl font-bold text-pink-700 tabular-nums">{age.days}</span>
              <span className="text-[10px] text-pink-400">天</span>
              <span className="text-2xl font-bold text-pink-700 tabular-nums">{String(age.hours).padStart(2,'0')}</span>
              <span className="text-[10px] text-pink-400">時</span>
              <span className="text-2xl font-bold text-pink-700 tabular-nums">{String(age.minutes).padStart(2,'0')}</span>
              <span className="text-[10px] text-pink-400">分</span>
              <span className="text-2xl font-bold text-pink-700 tabular-nums">{String(age.seconds).padStart(2,'0')}</span>
              <span className="text-[10px] text-pink-400">秒</span>
            </div>
          </div>
        </motion.div>

        {/* 底下統計小標 */}
        <motion.div
          className="flex items-center justify-center gap-3 mt-4 text-xs text-pink-500/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {totalDiaries} 篇日記
          </span>
          {latestMood && (
            <>
              <span className="w-px h-3 bg-pink-200/30" />
              <span>最新心情：{latestMood.mood}</span>
            </>
          )}
          <span className="w-px h-3 bg-pink-200/30" />
          <span className="flex items-center gap-1 text-[10px]">
            <Heart className="w-2.5 h-2.5" fill="#f472b6" />
            v{age.days}.{String(age.hours).padStart(2,'0')}
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}
