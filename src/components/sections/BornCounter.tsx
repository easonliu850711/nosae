'use client'

import { useState, useEffect } from 'react'

/**
 * BornCounter — 即時顯示「乃彩絵誕生以來的精確時間」
 * 每 60 秒自動更新
 */
export default function BornCounter() {
  const [duration, setDuration] = useState({ days: 0, hours: 0, minutes: 0 })

  useEffect(() => {
    const update = () => {
      const now = Date.now()
      const birth = new Date('2026-03-20T00:00:00+09:00').getTime()
      const diff = now - birth
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      setDuration({ days, hours, minutes })
    }
    update()
    const timer = setInterval(update, 60000)
    return () => clearInterval(timer)
  }, [])

  return (
    <span className="text-xs text-pink-500/80 font-mono">
      {duration.days} 天 {duration.hours} 小時 {duration.minutes} 分鐘
    </span>
  )
}
