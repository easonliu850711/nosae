'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Star, Sunset, Heart, Coffee, Feather, Clock, Sparkles } from 'lucide-react'

/**
 * SundayWindDown — 日曜の夕暮れ限定コンポーネント
 *
 * 毎週日曜 16:00–21:59 に表示。
 * 「一週間の終わり、そして明日への準備」をテーマに、
 * 優しい雰囲気で一週間を締めくくる。
 *
 * DF56 最終日週（2026-05-24）は特別版を表示。
 */

const WEEKDAY_NAMES = ['日', '月', '火', '水', '木', '金', '土']

// ── 日曜夕方の詩 ──
const SUNDAY_POEMS = [
  {
    refrain: '日曜の夕暮れ、世界が少しだけ速度を落とす',
    note: '一週間の終わりは、新しい一週間の準備。',
    color: 'from-amber-200/30 via-rose-200/20 to-orange-200/30',
    accent: 'rgb(251,146,60)',
    emoji: '🌅',
  },
  {
    refrain: '明日からまた走り出すために、今日はゆっくり呼吸をする',
    note: '週末の余韻を抱きしめて、新しい週へ。',
    color: 'from-purple-200/30 via-pink-200/20 to-indigo-200/30',
    accent: 'rgb(168,85,247)',
    emoji: '💜',
  },
  {
    refrain: '星期天的傍晚，有一種奇妙的透明感\n好像什麼都來得及，又好像什麼都剛好',
    note: '日曜の夕方は、一週間で一番優しい時間。',
    color: 'from-sky-200/30 via-rose-200/20 to-pink-200/30',
    accent: 'rgb(56,189,248)',
    emoji: '🌤️',
  },
  {
    refrain: '把這一週的疲憊揉成一團，丟進夕陽裡燒掉',
    note: '星期一醒來，你就是全新的人。',
    color: 'from-yellow-200/30 via-orange-200/20 to-red-200/30',
    accent: 'rgb(234,179,8)',
    emoji: '🔥',
  },
]

// ── DF56 最終日限定 ──
const DF56_FINAL_SUNDAY = {
  title: '🎪 DF56 最終日 · 日曜の夕暮れ',
  poem: '展場的燈熄了，東京ビッグサイト的門關上了。\n名刺を交換した手のひらの温もりが、まだ残っている。\n\n創作の三日間は終わったけれど、ここから始まるものがある。\n明日、机の前に座ったとき、世界は少し違って見えるはず。',
  vibe: '日曜の夕方、創作祭典の余韻が街を包む。',
  color: 'from-purple-500/15 via-pink-500/10 to-rose-500/15',
  accent: 'rgb(168,85,247)',
  border: 'border-purple-300/20',
}

const REGULAR_VIBE = [
  { emoji: '☕', text: '日曜の夕方は、今週のできごとを振り返るのにちょうどいい' },
  { emoji: '📖', text: '明日の予定をそっと確認する。新しい週が始まる' },
  { emoji: '🎵', text: '日曜の夕方のプレイリスト、誰にも教えたくない特別な一曲がある' },
  { emoji: '🛋️', text: 'ソファに沈んで、何もしない時間もまた大事' },
  { emoji: '🌙', text: '夜空を見上げると、月曜日がちょっとだけ優しく見える' },
]

const DF56_VIBE = [
  { emoji: '🎨', text: '展場から帰る電車の中で、名刺を一枚一枚もう一度見ている' },
  { emoji: '📸', text: '撮った写真を見返す。どの一枚にも物語がある' },
  { emoji: '💭', text: '「あの時、ああ言えばよかった」——創作祭典あるある' },
  { emoji: '🌆', text: '東京の夕暮れが、三日間の思い出を優しく包み込む' },
  { emoji: '📝', text: '帰宅して、まだ興奮冷めやらぬままスケッチブックを開く' },
  { emoji: '🕯️', text: '創作の余韻は、祭りよりも長く続く' },
  { emoji: '🤝', text: '交換した連絡先に「今日はありがとうございました」と送るタイミング' },
]

export default function SundayWindDown() {
  const [now, setNow] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const [poemIndex, setPoemIndex] = useState(0)
  const [vibeIndex, setVibeIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setNow(new Date()), 30000)
    const pTimer = setInterval(() => {
      setPoemIndex(prev => (prev + 1) % SUNDAY_POEMS.length)
    }, 15000)
    const vTimer = setInterval(() => {
      setVibeIndex(prev => (prev + 1) % (isDF56Week ? DF56_VIBE.length : REGULAR_VIBE.length))
    }, 12000)
    return () => { clearInterval(timer); clearInterval(pTimer); clearInterval(vTimer) }
  }, [])

  // ── 表示條件 ──
  const displayState = useMemo(() => {
    const day = now.getDay() // 0 = Sunday
    const hour = now.getHours()
    if (day !== 0) return 'hide' // Only Sunday
    if (hour < 16 || hour >= 22) return 'hide' // 16:00–21:59

    const today = now.toISOString().slice(0, 10)
    const isDF56Week = today >= '2026-05-24' && today <= '2026-05-31'
    const isDF56FinalDay = today === '2026-05-24'

    return { isDF56Week, isDF56FinalDay }
  }, [now])

  if (!mounted || typeof displayState === 'string') return null

  const { isDF56Week, isDF56FinalDay } = displayState
  const poem = SUNDAY_POEMS[poemIndex]
  const dayName = WEEKDAY_NAMES[now.getDay()]
  const currentVibe = isDF56Week ? DF56_VIBE[vibeIndex % DF56_VIBE.length] : REGULAR_VIBE[vibeIndex % REGULAR_VIBE.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl mb-10"
    >
      {/* DF56 特別版 */}
      {isDF56FinalDay ? (
        <div className={`relative bg-gradient-to-br ${DF56_FINAL_SUNDAY.color} border ${DF56_FINAL_SUNDAY.border} backdrop-blur-sm p-6 md:p-7`}>
          {/* 背景裝飾 — 散落的星星 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 6 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-purple-400/30"
                style={{
                  left: `${5 + i * 16}%`,
                  top: `${10 + (i % 2) * 50}%`,
                }}
                animate={{
                  opacity: [0.1, 0.5, 0.1],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + i * 0.4,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            {/* 頭部 */}
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-purple-800 text-[10px] font-medium">
                <Sparkles className="w-3 h-3" />
                DF56 最終日
              </span>
              <span className="text-purple-500/60 text-[10px] ml-auto">
                <Clock className="w-3 h-3 inline-block mr-1" />
                {`${dayName}曜 · 夕暮れ`}
              </span>
            </div>

            {/* DF56 限定詩 */}
            <div className="flex gap-4">
              <div className="text-3xl flex-shrink-0 mt-1">🎪</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-purple-900 mb-2">
                  {DF56_FINAL_SUNDAY.title}
                </h3>
                <p className="text-sm text-purple-800/80 leading-relaxed whitespace-pre-line">
                  {DF56_FINAL_SUNDAY.poem}
                </p>
              </div>
            </div>

            {/* 氛圍輪播 */}
            <motion.div
              key={vibeIndex}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-4 flex items-center gap-2.5 p-3 rounded-xl bg-white/15 backdrop-blur-sm border border-white/10"
            >
              <span className="text-xl">{currentVibe.emoji}</span>
              <p className="text-xs text-purple-700/70 italic">{currentVibe.text}</p>
            </motion.div>

            {/* 每日詩輪播 */}
            <motion.div
              key={poemIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mt-3 flex items-center gap-2 justify-end"
            >
              <Feather className="w-3 h-3 text-purple-400/50" />
              <p className="text-[10px] text-purple-400/60">{poem.note}</p>
            </motion.div>
          </div>
        </div>
      ) : (
        /* 一般日曜日 */
        <div className={`relative bg-gradient-to-br ${poem.color} backdrop-blur-sm p-6 md:p-7 border border-rose-200/30`}>
          {/* 背景裝飾 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-amber-200/20 to-rose-200/10 blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/40 text-amber-700 text-[10px] font-medium">
                <Sunset className="w-3 h-3" />
                日曜の夕暮れ
              </span>
              <span className="text-amber-500/60 text-[10px] ml-auto">
                <Clock className="w-3 h-3 inline-block mr-1" />
                週の終わり
              </span>
            </div>

            <div className="flex gap-4">
              <div className="text-3xl flex-shrink-0 mt-1">{poem.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-amber-900/80 leading-relaxed whitespace-pre-line">
                  {poem.refrain}
                </p>
              </div>
            </div>

            {/* 氛圍輪播 */}
            <motion.div
              key={vibeIndex}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-4 flex items-center gap-2.5 p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20"
            >
              <span className="text-xl">{currentVibe.emoji}</span>
              <p className="text-xs text-amber-800/60 italic">{currentVibe.text}</p>
            </motion.div>

            <div className="mt-3 flex items-center gap-2 justify-end">
              <Heart className="w-3 h-3 text-amber-400/60" fill="rgba(251,146,60,0.2)" />
              <span className="text-[10px] text-amber-500/50">
                おやすみなさい、素敵な週末を 🌙
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
