'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Quote, Sparkles, Star, Clock } from 'lucide-react'

/**
 * AfterglowReflection — DF56 後的個人沉澱 × 日常切り替え
 *
 * 在 Design Festa 56 結束後的期間（5/24 晚上～5/31）顯示，
 * 以 Nosae 的視角寫一封信給訪客，分享 DF56 的體悟與接下來的心情。
 */

const REFLECTIONS = [
  {
    emoji: '🌙',
    title: '靜寂之後',
    period: '最終夜',
    text: '三天像一場夢。\n從第一天手忙腳亂的佈展，到第二天逐漸找到節奏，再到第三天的從容與不捨。\n\n東京ビッグサイト的燈熄了，但我心中的那盞創作燈火，還亮著。',
    color: 'from-indigo-500/20 via-purple-500/15 to-pink-500/20',
    accent: 'rgb(129,140,248)',
    border: 'border-indigo-300/25',
  },
  {
    emoji: '🌸',
    title: '花散らしの後で',
    period: '余韻 (1-2日後)',
    text: '展場で交換した名刺の山を眺めている。\n一枚一枚に、一瞬一瞬の会話が詰まっている。\n\n「這是我第一次來 Design Festa」、「你的作品好溫暖」——\n那些話語，像桜の花びら一樣，輕輕地落在心の柔らかい部分。',
    color: 'from-pink-400/15 via-rose-300/15 to-orange-300/15',
    accent: 'rgb(244,114,182)',
    border: 'border-pink-300/20',
  },
  {
    emoji: '🕯️',
    title: '日常への帰還',
    period: '静寂期 (数日後)',
    text: '劇場型の三日間が終わり、日常が戻ってきた。\n今までのような慌ただしさはないけれど、代わりにこの静けさの中で、DF56 で感じたことをゆっくり噛み締めている。\n\n創作は祭りだけのものじゃない。\n日常の小さな瞬間にも、きっと宿っている。',
    color: 'from-slate-400/15 via-purple-400/10 to-indigo-400/15',
    accent: 'rgb(148,163,184)',
    border: 'border-slate-300/20',
  },
]

// DF56 後特有的微語錄
const AFTERGLOW_VIGNETTES = [
  '祭典結束後的第一個早晨，連空氣都靜了下來',
  '整理作品集的同時，也在整理這段時間的心情',
  '收到的每一句「加油」，我都好好地收在心裡了',
  '展場的喧囂沉澱後，留下的是最純粹的回憶',
  '名刺の裏に書かれた一言が、宝物になった',
  '帰り道、東京の夜景がいつもより優しく見えた',
  '創作の余韻は、祭りよりも長く続く',
]

export default function AfterglowReflection() {
  const [now, setNow] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const [vignette, setVignette] = useState(0)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setNow(new Date()), 30000)
    // Rotate vignettes every 10 seconds
    const vTimer = setInterval(() => {
      setVignette(prev => (prev + 1) % AFTERGLOW_VIGNETTES.length)
    }, 10000)
    return () => { clearInterval(timer); clearInterval(vTimer) }
  }, [])

  // Show after DF56 (from 5/24 18:00 JST) until 5/31
  const activeReflection = useMemo(() => {
    const today = now.toISOString().slice(0, 10)
    const h = now.getHours()
    const endDate = '2026-05-31'
    const startDate = '2026-05-24'

    if (today > endDate) return 'over'
    if (today < startDate) return 'not-yet'
    // On 5/24 only show after 17:00
    if (today === startDate && h < 17) return 'not-yet'

    // Determine which reflection to show based on days since DF56 ended
    const endTime = new Date('2026-05-24T23:59:59+09:00').getTime()
    const daysSince = Math.floor((now.getTime() - endTime) / 86400000)

    // Day 0 (5/24 evening): reflection 0 (最終夜)
    // Day 1-2: reflection 1 (余韻)
    // Day 3+: reflection 2 (日常への帰還)
    if (daysSince <= 0) return 0
    if (daysSince <= 2) return 1
    return 2
  }, [now])

  if (!mounted || activeReflection === 'not-yet' || activeReflection === 'over') return null

  const ref = REFLECTIONS[typeof activeReflection === 'number' ? activeReflection : 0]

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
            DF56 Afterglow
          </span>
        </div>

        {/* 主要內容 */}
        <div className="flex gap-4">
          {/* 表情符號 */}
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
            {AFTERGLOW_VIGNETTES[vignette]}
          </p>
        </motion.div>

        {/* 署名 */}
        <div className="mt-3 flex items-center gap-2 justify-end">
          <Heart className="w-3 h-3 text-pink-300" fill="rgba(244,114,182,0.4)" />
          <span className="text-[10px] text-white/40">Nosae の靜寂旅 · Studio Imori</span>
        </div>
      </div>
    </motion.div>
  )
}
