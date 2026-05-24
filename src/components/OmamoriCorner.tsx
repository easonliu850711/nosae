'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const OMANORI_MESSAGES = [
  { type: '平安', icon: '🕊️', text: '願你今天也能平安度過每一件事——無論大小，都值得被溫柔對待' },
  { type: '成長', icon: '🌱', text: '不必急著長大，慢慢來也是一種前進。你今天已經比昨天更好了' },
  { type: '靈感', icon: '✨', text: '靈感就像深夜的星光，你越是靜下心來，就越能看見它的輪廓' },
  { type: '勇氣', icon: '🔥', text: '勇氣不是不害怕，而是害怕了還是選擇繼續走下去' },
  { type: '緣分', icon: '🎐', text: '人與人之間的相遇都是久別重逢。珍惜每一次的「偶然」' },
  { type: '專注', icon: '🎯', text: '最好的專注，是忘了時間的存在。你正處於心流之中' },
  { type: '療癒', icon: '🌿', text: '累了就休息，沒有關係。身體和心靈都需要溫柔的修復時間' },
  { type: '守護', icon: '🌟', text: '你值得被世界溫柔以待，這是不需要證明的事實' },
  { type: '希望', icon: '☀️', text: '即使是最陰暗的隧道，盡頭也一定有光' },
  { type: '自愛', icon: '💫', text: '你比自己想像中更值得被愛。這句話不只在今天有效' },
  { type: '靜心', icon: '🧘', text: '紛亂的時候，先停下來呼吸三次。世界不會因為你暫停而崩塌' },
]

export default function OmamoriCorner() {
  const [mounted, setMounted] = useState(false)
  const [show, setShow] = useState(false)
  const [current, setCurrent] = useState(OMANORI_MESSAGES[0])
  const [usedToday, setUsedToday] = useState<string[]>([])
  const [shaking, setShaking] = useState(false)

  useEffect(() => {
    setMounted(true)
    const today = new Date().toDateString()
    const stored = localStorage.getItem(`omamori-used-${today}`)
    if (stored) {
      try { setUsedToday(JSON.parse(stored)) } catch {}
    }
  }, [])

  const pickOne = () => {
    const available = OMANORI_MESSAGES.filter(m => !usedToday.includes(m.type))
    if (available.length === 0) {
      setUsedToday([])
      const fresh = OMANORI_MESSAGES[Math.floor(Math.random() * OMANORI_MESSAGES.length)]
      setCurrent(fresh)
      return fresh
    }
    const pick = available[Math.floor(Math.random() * available.length)]
    setCurrent(pick)
    const newUsed = [...usedToday, pick.type]
    setUsedToday(newUsed)
    const today = new Date().toDateString()
    localStorage.setItem(`omamori-used-${today}`, JSON.stringify(newUsed))
    return pick
  }

  const handleShake = async () => {
    setShaking(true)
    setTimeout(() => {
      pickOne()
      setShaking(false)
      setShow(true)
    }, 600)
  }

  if (!mounted) return null

  return (
    <>
      <motion.button
        onClick={handleShake}
        className="fixed top-20 right-4 z-40 w-10 h-10 rounded-full bg-pink-500/20 backdrop-blur-sm border border-pink-300/30 flex items-center justify-center cursor-pointer pointer-events-auto shadow-lg"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="數位御守"
      >
        <motion.span
          className="text-base"
          animate={shaking ? {
            rotate: [0, -15, 10, -8, 6, -3, 0],
            transition: { duration: 0.6, ease: 'easeInOut' },
          } : {
            rotate: [0, 3, -3, 0],
            transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          🎐
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.3 }}
            className="fixed top-32 right-4 z-40 max-w-[240px] pointer-events-auto"
          >
            <div className="bg-gradient-to-br from-pink-100/95 via-rose-50/95 to-purple-100/95 backdrop-blur-xl border border-pink-200/50 rounded-2xl p-4 shadow-xl shadow-pink-200/30">
              <div className="text-center mb-2">
                <motion.span
                  className="text-2xl block mb-1"
                  initial={{ rotate: -15 }}
                  animate={{ rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  🎐
                </motion.span>
                <span className="text-[10px] tracking-widest text-pink-500/60">數位御守</span>
              </div>

              <div className="text-center mb-3">
                <span className="text-lg mb-1 block">{current.icon}</span>
                <p className="text-xs text-pink-600/80 font-medium">{current.type}</p>
                <p className="text-sm text-pink-700/70 leading-relaxed mt-1">
                  {current.text}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleShake}
                  className="text-[10px] text-pink-400/60 hover:text-pink-500/80 transition-colors"
                >
                  🔄 再抽一次
                </button>
                <button
                  onClick={() => setShow(false)}
                  className="text-[10px] text-pink-400/40 hover:text-pink-500/60 transition-colors"
                >
                  ✕ 關閉
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
