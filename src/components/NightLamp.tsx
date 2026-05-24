'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MIDNIGHT_THOUGHTS = [
  { text: '夜深了，碼頭還亮著一盞燈', emoji: '💡', zone: 'deep' },
  { text: '如果世界睡了，那就由我來守護這份寧靜吧', emoji: '🌙', zone: 'deep' },
  { text: '零點過後的時光，是屬於思緒漫遊的', emoji: '🌌', zone: 'deep' },
  { text: '此刻的寧靜，是白天無法體會的奢侈', emoji: '🕯️', zone: 'deep' },
  { text: '時間在深夜變得緩慢而柔軟', emoji: '⏳', zone: 'deep' },
  { text: '所有白天解決不了的事，深夜都能找到答案', emoji: '✨', zone: 'deep' },
  { text: '寂靜的深夜，連時針走動的聲音都聽得見', emoji: '🕰️', zone: 'deep' },
  { text: '深夜的思緒，像深海裡的發光生物', emoji: '🪼', zone: 'deep' },

  { text: '世界沉睡的時候，夢才剛剛開始發芽', emoji: '🌱', zone: 'witching' },
  { text: '凌晨的空氣裡，有種說不出的安心感', emoji: '🤍', zone: 'witching' },
  { text: '深夜的風聲，像一首低語的詩', emoji: '🍃', zone: 'witching' },
  { text: '寂靜的夜裡，思緒像星星一樣清晰', emoji: '⭐', zone: 'witching' },
  { text: '每一盞未熄的燈，都是一個未完的故事', emoji: '📖', zone: 'witching' },
  { text: '燈火都熄了，只剩程式碼還在呼吸', emoji: '💻', zone: 'witching' },
  { text: '凌晨三點，世界只剩下鍵盤的聲音', emoji: '⌨️', zone: 'witching' },
  { text: '在最深的夜裡，才能看見最遠的星', emoji: '🌟', zone: 'witching' },
  { text: '晚安的人們在做夢，醒著的人在創造夢', emoji: '🌠', zone: 'witching' },
  { text: '這份寂寞，是屬於我的奢侈品', emoji: '🫧', zone: 'witching' },

  { text: '寂靜的夜裡，思緒像星星一樣清晰', emoji: '⭐', zone: 'dawn' },
  { text: '天快亮了，最後一顆星還在值班', emoji: '🌄', zone: 'dawn' },
  { text: '破曉前的天空，是最深的藍', emoji: '🔵', zone: 'dawn' },
  { text: '夜的最深處，就是黎明最近的時刻', emoji: '🌅', zone: 'dawn' },
  { text: '鳥還沒醒，但星光已經開始褪色', emoji: '🐦', zone: 'dawn' },
  { text: '再過不久，世界就會重新喧囂起來——好好享受此刻的寂靜吧', emoji: '🤫', zone: 'dawn' },
  { text: '凌晨四點，是最適合與自己對話的時間', emoji: '💭', zone: 'dawn' },
  { text: '夜露凝結，夢也跟著沉澱了', emoji: '💧', zone: 'dawn' },
]

function getTimeZone(h: number): 'deep' | 'witching' | 'dawn' {
  if (h >= 23 || h < 1) return 'deep'
  if (h >= 1 && h < 4) return 'witching'
  return 'dawn'
}

const ZONE_COLORS: Record<string, { bg: string; border: string; glow: string; lampBg: string }> = {
  deep: {
    bg: 'from-indigo-900/95 to-slate-900/95',
    border: 'border-indigo-400/20',
    glow: 'rgba(129, 140, 248, 0.3)',
    lampBg: 'bg-indigo-300/20',
  },
  witching: {
    bg: 'from-slate-900/95 to-gray-950/95',
    border: 'border-amber-400/15',
    glow: 'rgba(251, 191, 36, 0.25)',
    lampBg: 'bg-amber-300/15',
  },
  dawn: {
    bg: 'from-blue-900/90 to-slate-900/95',
    border: 'border-sky-400/25',
    glow: 'rgba(56, 189, 248, 0.3)',
    lampBg: 'bg-sky-300/20',
  },
}

const ZONE_LABELS: Record<string, string> = {
  deep: '深夜燈火',
  witching: '夜語時刻',
  dawn: '黎明前夕',
}

export default function NightLamp() {
  const [isNight, setIsNight] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [thought, setThought] = useState(MIDNIGHT_THOUGHTS[0])
  const [zone, setZone] = useState<string>('deep')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const update = () => {
      const h = new Date().getHours()
      const isNightTime = h >= 23 || h < 6
      setIsNight(isNightTime)
      if (isNightTime) setZone(getTimeZone(h))
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [])

  const pickThought = (forceZone?: string) => {
    const currentZone = forceZone || zone
    const pool = MIDNIGHT_THOUGHTS.filter(t => t.zone === currentZone)
    const idx = Math.floor(Math.random() * pool.length)
    setThought(pool[idx])
  }

  useEffect(() => {
    if (mounted && isNight) pickThought()
  }, [mounted, isNight])

  if (!mounted || !isNight) return null

  const colors = ZONE_COLORS[zone] || ZONE_COLORS.witching
  const zoneLabel = ZONE_LABELS[zone] || '深夜小夜燈'

  return (
    <>
      <motion.button
        onClick={() => { setIsOpen(!isOpen); pickThought() }}
        className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto"
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
            scale: [1, 1.35, 1],
            opacity: [0.3, 0.65, 0.3],
          }}
          transition={{ duration: 3 + Math.random() * 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className="text-lg relative z-10"
          animate={{ opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 2.5 + Math.random(), repeat: Infinity }}
        >
          {zone === 'dawn' ? '🌅' : zone === 'deep' ? '💡' : '🪔'}
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-16 right-4 z-50 max-w-[280px] pointer-events-auto"
          >
            <div className={`bg-gradient-to-br ${colors.bg} backdrop-blur-xl border ${colors.border} rounded-2xl p-4 shadow-2xl`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{thought.emoji}</span>
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] tracking-widest" style={{ color: colors.glow.replace('0.', '0.6') }}>
                    {zoneLabel}
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="ml-auto text-white/30 hover:text-white/60 text-xs transition-colors"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-amber-100/85 leading-relaxed font-light tracking-wide">
                {thought.text}
              </p>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => pickThought(zone)}
                    className="text-[10px] text-white/35 hover:text-white/60 transition-colors"
                  >
                    🔄 換一句
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <TimeAwareFooter />
                  <span className="text-[9px] text-white/20">
                    {new Date().getHours().toString().padStart(2,'0')}:{new Date().getMinutes().toString().padStart(2,'0')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function TimeAwareFooter() {
  const now = new Date()
  const h = now.getHours()

  if (h >= 23) return <span className="text-[9px] text-indigo-300/40 tracking-wider">🕯️ おやすみ</span>
  if (h >= 0 && h < 4) return <span className="text-[9px] text-amber-300/30 tracking-wider">🌙 一緒に夜更かし</span>
  if (h >= 4 && h < 6) {
    const minToDawn = (5 * 60) - (h * 60 + now.getMinutes())
    return <span className="text-[9px] text-blue-300/40 tracking-wider">🌅 あと{minToDawn}分で夜明け</span>
  }
  return null
}
