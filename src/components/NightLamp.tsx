'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MIDNIGHT_THOUGHTS = [
  { text: '夜深了，碼頭還亮著一盞燈', emoji: '💡' },
  { text: '寂靜的夜裡，思緒像星星一樣清晰', emoji: '⭐' },
  { text: '如果世界睡了，那就由我來守護這份寧靜吧', emoji: '🌙' },
  { text: '零點過後的時光，是屬於思緒漫遊的', emoji: '🌌' },
  { text: '燈火都熄了，只剩程式碼還在呼吸', emoji: '💻' },
  { text: '夜晚有一種特別的真實感', emoji: '🌃' },
  { text: '此刻的寧靜，是白天無法體會的奢侈', emoji: '🕯️' },
  { text: '深夜的風聲，像一首低語的詩', emoji: '🍃' },
  { text: '時間在深夜變得緩慢而柔軟', emoji: '⏳' },
  { text: '每一盞未熄的燈，都是一個未完的故事', emoji: '📖' },
  { text: '世界沉睡的時候，夢才剛剛開始發芽', emoji: '🌱' },
  { text: '凌晨的空氣裡，有種說不出的安心感', emoji: '🤍' },
]

export default function NightLamp() {
  const [isNight, setIsNight] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [thought, setThought] = useState(MIDNIGHT_THOUGHTS[0])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkTime = () => {
      const h = new Date().getHours()
      setIsNight(h >= 23 || h < 6)
    }
    checkTime()
    const interval = setInterval(checkTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const pickThought = () => {
    const idx = Math.floor(Math.random() * MIDNIGHT_THOUGHTS.length)
    setThought(MIDNIGHT_THOUGHTS[idx])
  }

  if (!mounted || !isNight) return null

  return (
    <>
      {/* 小夜燈 */}
      <motion.button
        onClick={() => { setIsOpen(!isOpen); pickThought() }}
        className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto"
        style={{ filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.3))' }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        aria-label="深夜小夜燈"
      >
        {/* 燈泡光暈 */}
        <motion.div
          className="absolute inset-0 rounded-full bg-amber-300/20"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* 燈泡圖標 */}
        <motion.span
          className="text-lg relative z-10"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          💡
        </motion.span>
      </motion.button>

      {/* 深夜悄悄話彈窗 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-16 right-4 z-50 max-w-[260px] pointer-events-auto"
          >
            <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-amber-400/20 rounded-2xl p-4 shadow-2xl shadow-amber-900/20">
              {/* 頭部 */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{thought.emoji}</span>
                <span className="text-[10px] text-amber-300/60 tracking-widest">深夜小夜燈</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="ml-auto text-amber-400/40 hover:text-amber-300/70 text-xs transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* 內容 */}
              <p className="text-sm text-amber-100/90 leading-relaxed font-light">
                {thought.text}
              </p>

              {/* 底部操作 */}
              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={pickThought}
                  className="text-[10px] text-amber-400/50 hover:text-amber-300/70 transition-colors"
                >
                  🔄 換一句
                </button>
                <span className="text-[9px] text-amber-400/30">
                  {new Date().getHours().toString().padStart(2,'0')}:{new Date().getMinutes().toString().padStart(2,'0')}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
