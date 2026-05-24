'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Sun, Cloud, Wind, Sparkles, Heart } from 'lucide-react'

/**
 * SeasonalTransition — 季節の移ろい感知コンポーネント
 *
 * DF56 の記憶を優しく包み込みながら、今の季節の美しさを伝える。
 * 5月下旬〜6月：新緑から初夏への移行期
 * 時間帯（朝/昼/夕/夜）に応じて異なる表情を見せる。
 *
 * 常時表示（DF56終了後は季節コンテンツとして恒久運用）
 */

// 日本の季節感を表現する詩句
const SEASONAL_VERSES: Record<string, { verse: string; poet: string }[]> = {
  'late-spring': [
    { verse: '若葉して おのれの光 ふりそそぐ', poet: '— 松尾芭蕉 に倣いて' },
    { verse: '五月雨に 新緑濡れて 街の色', poet: '— Nosae' },
    { verse: '青葉して 風の訪れ 知るばかり', poet: '— Nosae' },
  ],
  'early-summer': [
    { verse: '夏きぬと 風の匂いに 目を覚ます', poet: '— Nosae' },
    { verse: '蝉しぐれ 遠く響きて 空青し', poet: '— Nosae' },
    { verse: '紫陽花の 色の移ろふ 雨の庭', poet: '— Nosae' },
  ],
  'midsummer': [
    { verse: '盛夏の陽 影は濃くして 時は遅し', poet: '— Nosae' },
    { verse: '打ち水や 夕涼みの 風一つ', poet: '— Nosae' },
  ],
  'rainy': [
    { verse: '梅雨の夜 読書の燈に 身を任せ', poet: '— Nosae' },
    { verse: '雨音は 静けさを運ぶ 五月雨よ', poet: '— Nosae' },
  ],
}

// 時間帯ごとのテーマ
const TIME_THEMES = [
  { hour: [5, 8], emoji: '🌅', title: '朝もやの新緑', subtitle: '目覚めの空気が若葉の香りを運ぶ', gradient: 'from-emerald-200/40 via-lime-100/30 to-sky-200/30', border: 'border-emerald-200/30', icon: Sun },
  { hour: [9, 11], emoji: '☀️', title: '爽やかな午前', subtitle: '陽射しはまだ柔らかく、緑が輝く', gradient: 'from-green-200/30 via-lime-100/20 to-yellow-100/20', border: 'border-green-200/30', icon: Sun },
  { hour: [12, 14], emoji: '🌿', title: '昼下がりの緑陰', subtitle: '木漏れ日が葉っぱの間を踊る', gradient: 'from-emerald-200/30 via-lime-200/20 to-teal-100/30', border: 'border-emerald-200/25', icon: Leaf },
  { hour: [15, 17], emoji: '🌤️', title: '午後の斜光', subtitle: '光が傾き、影が長くなる', gradient: 'from-amber-100/30 via-orange-100/20 to-lime-100/30', border: 'border-amber-200/30', icon: Cloud },
  { hour: [18, 19], emoji: '🌇', title: '黄昏の残照', subtitle: '茜色に染まる街、風が冷たく', gradient: 'from-rose-200/30 via-amber-100/30 to-purple-200/20', border: 'border-rose-200/30', icon: Wind },
  { hour: [20, 23], emoji: '🌙', title: '夜風のそよぎ', subtitle: '闇に浮かぶ燈りと、遠くの虫の声', gradient: 'from-indigo-200/20 via-purple-100/20 to-sky-200/20', border: 'border-indigo-200/20', icon: Wind },
  { hour: [0, 4], emoji: '🌌', title: '静夜の息吹', subtitle: '誰もいない時間、葉は眠る', gradient: 'from-indigo-300/20 via-slate-200/10 to-blue-200/15', border: 'border-indigo-200/15', icon: Sparkles },
]

export default function SeasonalTransition() {
  const [now, setNow] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const timeTheme = useMemo(() => {
    const h = now.getHours()
    for (const t of TIME_THEMES) {
      if (h >= t.hour[0] && h <= t.hour[1]) return t
    }
    return TIME_THEMES[6] // 深夜 fallback
  }, [now])

  // Determine season based on date (late May = late spring / early summer transition)
  const seasonKey = useMemo(() => {
    const m = now.getMonth() + 1 // 1-indexed
    const d = now.getDate()
    if (m === 5) {
      if (d <= 15) return 'late-spring'
      if (d <= 31) {
        // Check if rainy season has started (~6月上旬)
        return 'late-spring'
      }
    }
    if (m === 6) {
      if (d <= 10) return 'rainy'
      return 'early-summer'
    }
    if (m === 7 || m === 8) return 'midsummer'
    if (m >= 3 && m <= 5) return 'late-spring'
    return 'early-summer'
  }, [now])

  const verse = useMemo(() => {
    const verses = SEASONAL_VERSES[seasonKey] || SEASONAL_VERSES['late-spring']
    const today = now.getDate()
    return verses[today % verses.length]
  }, [seasonKey, now])

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-br ${timeTheme.gradient} border ${timeTheme.border} backdrop-blur-sm`}
    >
      {/* 装飾：浮遊する葉っぱ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 5 }, (_, i) => {
          const size = 8 + Math.random() * 12
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size * 1.2,
                background: i % 2 === 0
                  ? 'rgba(74, 222, 128, 0.12)'
                  : 'rgba(134, 239, 172, 0.08)',
                left: `${15 + i * 18}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -8, 0],
                rotate: [0, 15, -10, 5, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 6 + i * 0.7,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeInOut',
              }}
            />
          )
        })}
      </div>

      <div className="relative z-10 p-4 md:p-5">
        {/* 頭部 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/40 text-green-700/60 text-[10px] font-medium">
            <Leaf className="w-3 h-3" />
            季節の移ろい · {now.getMonth() + 1}月{now.getDate()}日
          </span>
        </div>

        {/* メイン */}
        <div className="flex items-start gap-3">
          <motion.span
            className="text-2xl mt-0.5"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {timeTheme.emoji}
          </motion.span>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-green-800/80">
              {timeTheme.title}
            </h3>
            <p className="text-xs text-green-700/50 mt-0.5">
              {timeTheme.subtitle}
            </p>

            {/* 詩句 — カード風 */}
            <motion.div
              key={verse.verse}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2.5 rounded-lg bg-white/30 border border-green-200/30"
            >
              <p className="text-sm text-green-800/70 leading-relaxed font-serif italic">
                「{verse.verse}」
              </p>
              <p className="text-[10px] text-green-600/40 text-right mt-0.5">
                {verse.poet}
              </p>
            </motion.div>
          </div>
        </div>

        {/* 底部 */}
        <div className="mt-2 flex items-center justify-end gap-2">
          <span className="text-[10px] text-green-600/35">
            {seasonKey === 'late-spring' ? '晩春' : seasonKey === 'rainy' ? '梅雨入り' : '初夏'}
          </span>
          <Heart className="w-3 h-3 text-green-400" fill="rgba(74,222,128,0.25)" />
        </div>
      </div>
    </motion.div>
  )
}
