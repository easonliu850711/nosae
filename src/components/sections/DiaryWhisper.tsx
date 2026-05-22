'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

/**
 * DiaryWhisper — 從真實日記中隨機抽取一段竊竊私語
 * 點選「再抽一篇」重新載入隨機片段
 */
export default function DiaryWhisper() {
  const [whisper, setWhisper] = useState<{ date: string; text: string } | null>(null)
  const [loading, setLoading] = useState(true)

  async function pickRandomDiary() {
    setLoading(true)
    setWhisper(null)
    try {
      const idxRes = await fetch('/data/diary_index.json')
      const idx: { date: string }[] = await idxRes.json()
      const dates = idx.filter(d => !d.date.endsWith('-b')).map(d => d.date)
      const randomDate = dates[Math.floor(Math.random() * dates.length)]

      const diaryRes = await fetch(`/data/diary_${randomDate}.json`)
      const diary = await diaryRes.json()
      const entries = diary.entries || []

      const meaningful = entries.filter((e: { type: string; text: string }) =>
        ['paragraph', 'callout', 'quote'].includes(e.type) &&
        e.text.trim().length > 15
      )

      if (meaningful.length > 0) {
        const pick = meaningful[Math.floor(Math.random() * meaningful.length)]
        const text = pick.text.length > 120
          ? pick.text.slice(0, 117) + '…'
          : pick.text
        setWhisper({ date: randomDate, text })
      }
    } catch { /* 靜默失敗 */ }
    setLoading(false)
  }

  useEffect(() => { pickRandomDiary() }, [])

  if (loading || !whisper) return null

  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="inline-block max-w-md px-6 py-4 rounded-2xl bg-gradient-to-br from-pink-100/80 to-rose-100/60 backdrop-blur-sm border border-pink-200/50 shadow-sm">
        <div className="flex items-center justify-center gap-1.5 mb-1.5">
          <span className="text-[10px] text-pink-400/70 font-medium">
            📜 翻到 {whisper.date} 的日記
          </span>
        </div>
        <p className="text-sm text-pink-800/90 italic leading-relaxed mb-2">
          「{whisper.text}」
        </p>
        <button
          onClick={pickRandomDiary}
          className="text-[11px] text-pink-400 hover:text-pink-600 transition-colors inline-flex items-center gap-1"
        >
          🔄 再抽一篇
        </button>
      </div>
    </motion.div>
  )
}
