'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── 傍晚語錄 (18:00~23:00) ──
const EVENING_THOUGHTS = [
  // 🌆 夕暮 (18:00~20:00) — 傍晚放鬆
  { text: '日落之後，才是屬於自己的時間', emoji: '🌇', zone: 'sunset' },
  { text: '工作了一整天，此刻的晚風是最溫柔的獎勵', emoji: '🍃', zone: 'sunset' },
  { text: '天空從橘色漸變成紫色，一天中最美的十分鐘', emoji: '🌆', zone: 'sunset' },
  { text: '夕陽不會催促，它只是靜靜地提醒你該休息了', emoji: '☀️', zone: 'sunset' },
  { text: '晚霞是天空給大地的告別信', emoji: '💌', zone: 'sunset' },
  { text: '披著夕色回家的人，心底都藏著今日的故事', emoji: '🚶', zone: 'sunset' },
  { text: '太陽下班了，但創作不打烊', emoji: '🎨', zone: 'sunset' },
  { text: 'Design Festa 的夕陽，把展場染成了溫和的琥珀色', emoji: '🟠', zone: 'sunset' },

  // 🌃 夜初 (20:00~23:00) — 入夜轉靜
  { text: '路燈亮起的瞬間，城市換上了夜晚的衣服', emoji: '🌃', zone: 'nightfall' },
  { text: '霓虹燈下的街道，有種白天看不到的溫柔', emoji: '💡', zone: 'nightfall' },
  { text: '夜晚的空氣裡，藏著白天沒說完的話', emoji: '🌙', zone: 'nightfall' },
  { text: '入夜後的咖啡，是清醒和夢境的交界線', emoji: '☕', zone: 'nightfall' },
  { text: '晚上八點之後，世界變得稍微寬容了一些', emoji: '🫂', zone: 'nightfall' },
  { text: '窗外的燈火一盞盞亮起，像夜空的倒影', emoji: '✨', zone: 'nightfall' },
  { text: 'Design Festa 一天的喧囂沉澱下來，留下的都是美好', emoji: '🌸', zone: 'nightfall' },
  { text: '夜晚是最誠實的時刻——不再需要對誰微笑', emoji: '😌', zone: 'nightfall' },
  { text: '忙碌之後的夜晚，連呼吸都變得更深了', emoji: '🫁', zone: 'nightfall' },
  { text: '遠方的山輪廓模糊了，但思緒卻清晰了起來', emoji: '⛰️', zone: 'nightfall' },
]

// DF56 傍晚限定
const DF56_EVENING_VIBES = {
  sunset: {
    emoji: '🌇',
    text: 'DF56 會場的夕陽正斜射進展廳，光線穿過Showcase落在作品上。這是一天中最夢幻的時刻。',
  },
  nightfall: {
    emoji: '🌃',
    text: '展場的門關了，但創作的話題還在居酒屋裡繼續。Design Festa 的夜晚，總有聊不完的故事。',
  },
}

function getEveningZone(h: number): 'sunset' | 'nightfall' {
  return h >= 18 && h < 20 ? 'sunset' : 'nightfall'
}

const ZONE_COLORS: Record<string, { bg: string; border: string; glow: string; lampBg: string }> = {
  sunset: {
    bg: 'from-amber-800/90 via-orange-800/85 to-rose-900/90',
    border: 'border-orange-400/30',
    glow: 'rgba(251, 146, 60, 0.35)',
    lampBg: 'bg-orange-300/20',
  },
  nightfall: {
    bg: 'from-indigo-800/90 via-slate-800/85 to-purple-900/90',
    border: 'border-indigo-400/25',
    glow: 'rgba(129, 140, 248, 0.3)',
    lampBg: 'bg-indigo-300/20',
  },
}

const ZONE_LABELS: Record<string, string> = {
  sunset: '夕暮れ',
  nightfall: '夜の帳',
}

export default function EveningLamp() {
  const [isEvening, setIsEvening] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [thought, setThought] = useState(EVENING_THOUGHTS[0])
  const [zone, setZone] = useState<string>('nightfall')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const update = () => {
      const h = new Date().getHours()
      const isEveningTime = h >= 18 && h < 23
      setIsEvening(isEveningTime)
      if (isEveningTime) setZone(getEveningZone(h))
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [])

  const pickThought = (forceZone?: string) => {
    const currentZone = forceZone || zone
    const pool = EVENING_THOUGHTS.filter(t => t.zone === currentZone)
    const idx = Math.floor(Math.random() * pool.length)
    setThought(pool[idx])
  }

  useEffect(() => {
    if (mounted && isEvening) pickThought()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isEvening])

  if (!mounted || !isEvening) return null

  const colors = ZONE_COLORS[zone] || ZONE_COLORS.nightfall
  const zoneLabel = ZONE_LABELS[zone] || '夕暮れ'
  const isDF = new Date() >= new Date('2026-05-22T00:00:00+09:00') &&
               new Date() < new Date('2026-05-25T00:00:00+09:00')

  return (
    <>
      {/* 傍晚燈柱按鈕 */}
      <motion.button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) pickThought() }}
        className="fixed bottom-4 left-4 z-50 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto"
        style={{ filter: `drop-shadow(0 0 8px ${colors.glow})` }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        aria-label={zoneLabel}
      >
        <motion.div
          className={`absolute inset-0 rounded-full ${colors.lampBg}`}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.25, 0.6, 0.25],
          }}
          transition={{ duration: 3.5 + Math.random() * 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className="text-lg relative z-10"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3 + Math.random(), repeat: Infinity }}
        >
          {zone === 'sunset' ? '🌇' : '🌃'}
        </motion.span>
      </motion.button>

      {/* 傍晚悄悄話 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-16 left-4 z-50 max-w-[280px] pointer-events-auto"
          >
            <div className={`bg-gradient-to-br ${colors.bg} backdrop-blur-xl border ${colors.border} rounded-2xl p-4 shadow-2xl`}>
              {/* 頭部 */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{thought.emoji}</span>
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] tracking-widest text-amber-200/60">
                    {zoneLabel}
                  </span>
                  {isDF && (
                    <span className="text-[8px] text-pink-300/50 tracking-wider">🎨 DF56 × Evening</span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="ml-auto text-white/30 hover:text-white/60 text-xs transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* 語錄 */}
              <p className="text-sm text-amber-100/80 leading-relaxed font-light tracking-wide">
                {thought.text}
              </p>

              {/* DF56 追加 */}
              {isDF && (
                <div className="mt-3 pt-2 border-t border-white/5">
                  <p className="text-[11px] text-pink-200/40 italic leading-relaxed">
                    {DF56_EVENING_VIBES[zone as keyof typeof DF56_EVENING_VIBES]?.text}
                  </p>
                </div>
              )}

              {/* 底部 */}
              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => pickThought(zone)}
                  className="text-[10px] text-white/35 hover:text-white/60 transition-colors"
                >
                  🔄 換一句
                </button>
                <span className="text-[9px] text-white/20">
                  {String(new Date().getHours()).padStart(2,'0')}:{String(new Date().getMinutes()).padStart(2,'0')}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
