'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Sparkles, Heart } from 'lucide-react'

/**
 * DF56FinalCountdown — Design Festa 56 最終日閉幕倒數
 * 只在 2026-05-24 顯示，倒數到 17:00 JST（一般最終日閉展時間）
 * 以優雅的方式引導訪客感受展會尾聲的氣氛
 */
export default function DF56FinalCountdown() {
  const [now, setNow] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!mounted) return null

  const today = now.toISOString().slice(0, 10)
  if (today !== '2026-05-24') return null

  // DF56 最終日閉展時間：17:00 JST
  const closingTime = new Date('2026-05-24T17:00:00+09:00')
  const nowMs = now.getTime()
  const closingMs = closingTime.getTime()
  const diffMs = closingMs - nowMs
  const isAfterClosing = diffMs <= 0
  const totalDuration = closingMs - new Date('2026-05-24T00:00:00+09:00').getTime()

  if (isAfterClosing) return null // ClosingLuminescence 會接手

  const elapsed = nowMs - new Date('2026-05-24T00:00:00+09:00').getTime()
  const progress = Math.min(1, Math.max(0, elapsed / totalDuration))

  const hours = Math.floor(diffMs / 3600000)
  const minutes = Math.floor((diffMs % 3600000) / 60000)
  const seconds = Math.floor((diffMs % 60000) / 1000)

  const hour = now.getHours()
  const phase = hour < 12 ? '上午' : hour < 14 ? '午後' : hour < 16 ? '午後深處' : '閉幕前夕'
  const phaseEmoji = hour < 12 ? '🌅' : hour < 14 ? '☀️' : hour < 16 ? '🌤️' : '🌆'

  // 根據時間決定色系
  const colors = hour < 12
    ? { bg: 'from-sky-100/60 via-pink-100/50 to-rose-100/60', border: 'border-sky-200/50', text: 'text-sky-700', accent: 'from-sky-400 to-rose-400' }
    : hour < 15
    ? { bg: 'from-amber-100/60 via-pink-100/50 to-rose-100/60', border: 'border-amber-200/50', text: 'text-amber-700', accent: 'from-amber-400 to-rose-400' }
    : { bg: 'from-orange-200/60 via-rose-200/50 to-purple-200/60', border: 'border-orange-200/50', text: 'text-orange-700', accent: 'from-orange-400 to-purple-500' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl mb-10"
    >
      <div className={`relative bg-gradient-to-br ${colors.bg} border ${colors.border} p-5 md:p-6 shadow-sm backdrop-blur-sm`}>
        {/* 裝飾圈 */}
        <div className="absolute top-[-40px] right-[-40px] w-32 h-32 rounded-full bg-gradient-to-br from-pink-200/20 to-rose-200/20" />
        <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 rounded-full bg-gradient-to-tr from-sky-200/20 to-pink-200/20" />

        <div className="relative z-10">
          {/* 標題行 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{phaseEmoji}</span>
              <div>
                <h3 className="text-sm font-bold text-pink-800">
                  DF56 最終日 · {phase}
                </h3>
                <p className="text-[11px] text-pink-500/80">
                  東京 Big Sight · 創作祭典的最後章節
                </p>
              </div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Heart className="w-5 h-5 text-pink-400" fill="#f9a8d4" />
            </motion.div>
          </div>

          {/* 倒數時鐘 — 最顯眼的元素 */}
          <div className="flex items-center justify-center gap-4 my-4">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-white/70 backdrop-blur-sm rounded-xl px-3 py-1 min-w-[60px] shadow-sm">
                {String(hours).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-pink-500 mt-1">時</div>
            </div>
            <span className="text-3xl font-light text-pink-400">:</span>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-white/70 backdrop-blur-sm rounded-xl px-3 py-1 min-w-[60px] shadow-sm">
                {String(minutes).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-pink-500 mt-1">分</div>
            </div>
            <span className="text-3xl font-light text-pink-400">:</span>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-white/70 backdrop-blur-sm rounded-xl px-3 py-1 min-w-[60px] shadow-sm">
                {String(seconds).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-pink-500 mt-1">秒</div>
            </div>
          </div>

          {/* 進度條 */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] text-pink-500/80 mb-1">
              <span>🌅 開場</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {Math.round(progress * 100)}% 經過
              </span>
              <span>🌆 閉展 17:00</span>
            </div>
            <div className="h-1.5 bg-pink-200/40 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${colors.accent}`}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* 當下時間標示 */}
          <div className="flex items-center justify-center gap-1.5">
            <Clock className="w-3 h-3 text-pink-400" />
            <span className="text-[11px] text-pink-500">
              現在時間 ·{' '}
              {now.toLocaleString('ja-JP', {
                timeZone: 'Asia/Tokyo',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>

          {/* 時間に応じたメッセージ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-3 text-center"
          >
            <p className="text-xs text-pink-600/90 italic leading-relaxed">
              {hour < 12
                ? '最終日の朝。展場はまだ静かだけど、創作の熱気がゆっくりと目覚めていく。'
                : hour < 14
                ? '昼下がりの展場は会話と笑顔であふれている。創作者たちの最後の力を振り絞る瞬間。'
                : hour < 16
                ? '午後の光が傾き始める。名刺交換のピーク、最後のインスピレーションの交換。'
                : '閉幕が近づいている。展示を片付けながら、達成感と少しの寂しさが交差する時間。'}
            </p>
          </motion.div>

          {/* 當下時間のアクティビティ提案 */}
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium ${hour < 12 ? 'bg-sky-100 text-sky-600' : hour < 15 ? 'bg-amber-100 text-amber-600' : 'bg-orange-100 text-orange-600'}`}>
              <Sparkles className="w-2.5 h-2.5" />
              {hour < 12
                ? '朝の新鮮な空気の中で最後の準備'
                : hour < 14
                ? 'ランチ後の最後の展示鑑賞ラッシュ'
                : hour < 16
                ? '最後の作品チェックと交流'
                : '展場の灯りが消える前の最後の瞬間'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
