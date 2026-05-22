'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * ⏳ DayProgressBar — 日進度微光條
 *
 * Footer 底部的一條極簡光暈線條，顯示今天走過了多少比例。
 * 同時在微妙位置顯示一個時間標籤。
 * 沒有數字也沒關係——線條本身就是詩。
 */

export default function DayProgressBar() {
  const [progress, setProgress] = useState(0)
  const [label, setLabel] = useState('')

  useEffect(() => {
    function update() {
      const now = new Date()
      const h = now.getHours()
      const m = now.getMinutes()
      const total = h * 60 + m
      const dayPct = (total / (24 * 60)) * 100

      setProgress(dayPct)

      // 時間段標籤
      if (h >= 5 && h < 7) setLabel('🌅 黎明')
      else if (h >= 7 && h < 10) setLabel('☀️ 早晨')
      else if (h >= 10 && h < 12) setLabel('🌤️ 午前')
      else if (h >= 12 && h < 14) setLabel('🌞 正午')
      else if (h >= 14 && h < 17) setLabel('🌻 午後')
      else if (h >= 17 && h < 18) setLabel('🌅 黃昏')
      else if (h >= 18 && h < 20) setLabel('🌆 暮色')
      else if (h >= 20 && h < 22) setLabel('🌙 夜')
      else if (h >= 22 || h < 5) setLabel('🌌 深夜')
      else setLabel('🌸')
    }

    update()
    const timer = setInterval(update, 60000) // 每分鐘更新
    return () => clearInterval(timer)
  }, [])

  return (
    <motion.div
      className="mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.8 }}
    >
      {/* 極簡進度線 */}
      <div className="relative w-32 h-0.5 mx-auto bg-pink-200/30 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-300/50 via-rose-300/60 to-pink-400/50 rounded-full"
          style={{ width: `${Math.min(progress, 100)}%` }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <p className="text-[10px] text-pink-400/60 mt-1 tracking-wider">{label}</p>
    </motion.div>
  )
}
