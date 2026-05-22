'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 🌸 數位御守（Digital Omamori）
 * 一個在深夜與特殊日子出現的小小祈願角落
 * 每次點擊都會得到一句來自 Nosae 的祝福
 */

const OMANORI_MESSAGES = [
  {
    type: '平安',
    icon: '🕊️',
    text: '願你今天也能平安度過每一件事——無論大小，都值得被溫柔對待',
  },
  {
    type: '成長',
    icon: '🌱',
    text: '不必急著長大，慢慢來也是一種前進。你今天已經比昨天更好了',
  },
  {
    type: '靈感',
    icon: '✨',
    text: '靈感就像深夜的星光，你越是靜下心來，就越能看見它的輪廓',
  },
  {
    type: '勇氣',
    icon: '🔥',
    text: '勇氣不是不害怕，而是害怕了還是選擇繼續走下去',
  },
  {
    type: '緣分',
    icon: '🎐',
    text: '人與人之間的相遇都是久別重逢。珍惜每一次的「偶然」',
  },
  {
    type: '專注',
    icon: '🎯',
    text: '最好的專注，是忘了時間的存在。你正處於心流之中',
  },
  {
    type: '療癒',
    icon: '🌿',
    text: '累了就休息，沒有關係。身體和心靈都需要溫柔的修復時間',
  },
  {
    type: '希望',
    icon: '🌟',
    text: '即使在最深的夜裡，也一定有一盞屬於你的燈火在遠方亮著',
  },
  {
    type: '感謝',
    icon: '🙏',
    text: '無論今天過得如何，感謝你仍然在這裡，仍然在努力著',
  },
  {
    type: '未來',
    icon: '🔮',
    text: '未來不是等來的，是每一天的微小選擇累積而成的',
  },
  {
    type: '肯定',
    icon: '💫',
    text: '你比自己想像中更值得被愛。這句話不只在今天有效',
  },
  {
    type: '靜心',
    icon: '🧘',
    text: '紛亂的時候，先停下來呼吸三次。世界不會因為你暫停而崩塌',
  },
]

// Design Festa 限定御守
const DF_OMAMORI = [
  {
    type: '創作',
    icon: '🎨',
    text: '你的創作是世界上獨一無二的禮物。今天也繼續讓它閃耀吧',
  },
  {
    type: '靈感傳遞',
    icon: '🖌️',
    text: '那些被你作品觸動的人，也許正在心中默默感謝你的存在',
  },
]

export default function OmamoriCorner() {
  const [mounted, setMounted] = useState(false)
  const [show, setShow] = useState(false)
  const [current, setCurrent] = useState(OMANORI_MESSAGES[0])
  const [usedToday, setUsedToday] = useState<string[]>([])
  const [shaking, setShaking] = useState(false)

  useEffect(() => {
    setMounted(true)
    // 每天重置已抽過的記錄
    const today = new Date().toDateString()
    const stored = localStorage.getItem(`omamori-used-${today}`)
    if (stored) {
      try { setUsedToday(JSON.parse(stored)) } catch {}
    }
  }, [])

  const pickOne = () => {
    // 先收集所有可用的御守（含 DF 限定）
    const allMessages = [...OMANORI_MESSAGES]

    // DF56 限定追加
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
    if (dateStr >= '2026-05-22' && dateStr <= '2026-05-24') {
      allMessages.push(...DF_OMAMORI)
    }

    // 排除今天已抽過的
    const available = allMessages.filter(m => !usedToday.includes(m.type))

    if (available.length === 0) {
      // 全部抽完了，重新開始
      setUsedToday([])
      localStorage.removeItem(`omamori-used-${new Date().toDateString()}`)
      const idx = Math.floor(Math.random() * allMessages.length)
      setCurrent(allMessages[idx])
      setUsedToday([allMessages[idx].type])
      return
    }

    const idx = Math.floor(Math.random() * available.length)
    const selected = available[idx]
    setCurrent(selected)

    const newUsed = [...usedToday, selected.type]
    setUsedToday(newUsed)
    localStorage.setItem(`omamori-used-${new Date().toDateString()}`, JSON.stringify(newUsed))
  }

  const handleShake = () => {
    setShaking(true)
    setTimeout(() => pickOne(), 600)
    setTimeout(() => setShaking(false), 1000)
  }

  if (!mounted) return null

  const remaining = OMANORI_MESSAGES.length + (DF_OMAMORI.length) - usedToday.length

  return (
    <>
      {/* 御守入口 — 固定右下角，在夜燈上方 */}
      <motion.button
        onClick={() => setShow(!show)}
        className="fixed bottom-16 right-4 z-50 w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer pointer-events-auto"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, type: 'spring' }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        aria-label="數位御守"
        style={{
          background: 'linear-gradient(135deg, rgba(244, 114, 182, 0.15), rgba(168, 85, 247, 0.15))',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(244, 114, 182, 0.2)',
        }}
      >
        <motion.span
          className="text-sm"
          animate={{ rotate: [0, -10, 10, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          🎐
        </motion.span>
      </motion.button>

      {/* 御守彈窗 */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-[8.5rem] right-4 z-50 max-w-[280px] pointer-events-auto"
          >
            <div className="bg-gradient-to-br from-pink-50/95 via-white/95 to-purple-50/95 backdrop-blur-xl border border-pink-200/40 rounded-2xl p-4 shadow-lg shadow-pink-200/20">
              {/* 頭部 */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🎐</span>
                <div>
                  <p className="text-xs font-semibold text-pink-700">數位御守</p>
                  <p className="text-[9px] text-pink-400">
                    今日尚餘 {Math.max(0, remaining)} 枚
                  </p>
                </div>
                <button
                  onClick={() => setShow(false)}
                  className="ml-auto text-pink-300 hover:text-pink-500 text-xs transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* 繪馬區 */}
              <div className="relative">
                <motion.div
                  className="bg-gradient-to-br from-pink-100/60 to-purple-100/60 rounded-xl p-4 text-center border border-pink-200/30"
                  animate={shaking ? {
                    x: [0, -4, 4, -4, 3, -2, 0],
                    rotate: [0, -2, 2, -2, 1, -1, 0],
                  } : {}}
                  transition={{ duration: 0.6 }}
                >
                  <motion.div
                    key={current.icon + current.text}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-3xl block mb-2">{current.icon}</span>
                    <p className="text-xs font-bold text-pink-600 mb-1">{current.type}</p>
                    <p className="text-sm text-pink-700/80 leading-relaxed">
                      「{current.text}」
                    </p>
                  </motion.div>
                </motion.div>
              </div>

              {/* 搖籤按鈕 */}
              <button
                onClick={handleShake}
                disabled={shaking}
                className="mt-3 w-full py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 transition-all duration-200 disabled:opacity-50"
              >
                {shaking ? '🔮 抽籤中⋯' : '🔮 搖一搖'}
              </button>

              <p className="mt-2 text-[9px] text-pink-300 text-center">
                每天只能抽一次同一種御守，明天會重置唷 🌸
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
