'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, BookOpen, Heart } from 'lucide-react'

/**
 * TodayPulse — 顯示今天的日記摘要
 * 若今天有日記，在頁面頂部顯示當下氛圍的片段
 * 讓網站有「現在正在發生」的感覺
 */

const MOOD_EMOJI: Record<string, string> = {
  元氣: '✨', 平靜: '🌊', 專注: '🎯',
  興奮: '🔥', 療癒: '🌸', 反思: '📝',
  期待: '🌟', 感謝: '🙏', 創作: '🎨',
  堅定: '💪', 溫柔: '💗', 好奇: '🔍',
  靜謐: '🌙', 清新: '🌿', 振奮: '⚡',
  從容: '🍵', 熱情: '❤️', 靈感: '💡',
  挑戰: '🚀', 探索: '🧭',
}

const TODAY_CACHE_KEY = 'nosae-today-pulse'

export default function TodayPulse() {
  const [todayEntry, setTodayEntry] = useState<{
    date: string
    title: string
    snippet: string
    mood?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 先試快取
    const cached = sessionStorage.getItem(TODAY_CACHE_KEY)
    if (cached) {
      try {
        setTodayEntry(JSON.parse(cached))
        setLoading(false)
        return
      } catch {}
    }

    const todayStr = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

    fetch('/data/diary_index.json')
      .then(r => r.json())
      .then(async (idx: { date: string; title?: string; mood?: string }[]) => {
        const todayData = idx.find(e => e.date === todayStr)
        if (!todayData) {
          setLoading(false)
          return
        }

        const res = await fetch(`/data/diary_${todayStr}.json`)
        const diary = await res.json()
        const entries = diary.entries || diary.blocks || []
        const meaningful = entries.filter((e: { type?: string; text?: string }) =>
          ['paragraph', 'callout', 'quote', 'numbered_list_item', 'bulleted_list_item'].includes(e.type || '') &&
          (e.text || '').trim().length > 20
        )

        const snippet = meaningful.length > 0
          ? meaningful[0].text.slice(0, 150) + (meaningful[0].text.length > 150 ? '…' : '')
          : ''

        const entry = {
          date: todayStr,
          title: todayData.title || `今日記錄 — ${todayStr}`,
          snippet,
          mood: todayData.mood || undefined,
        }
        setTodayEntry(entry)
        try { sessionStorage.setItem(TODAY_CACHE_KEY, JSON.stringify(entry)) } catch {}
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || !todayEntry) return null

  const moodEmoji = todayEntry.mood ? (MOOD_EMOJI[todayEntry.mood] || '💬') : '💬'

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mb-6"
    >
      <div className="rounded-2xl border border-pink-200/40 bg-gradient-to-r from-pink-50/60 via-rose-50/40 to-pink-50/60 backdrop-blur-sm p-4 md:p-5 shadow-sm">
        {/* 頂部標題 */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-300 to-rose-400 flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-pink-800 truncate">
                {todayEntry.title}
              </span>
              {todayEntry.mood && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-100/70 text-[10px] text-pink-600 font-medium whitespace-nowrap">
                  {moodEmoji} {todayEntry.mood}
                </span>
              )}
            </div>
            <p className="text-[10px] text-pink-400">
              今天 · {todayEntry.date}
            </p>
          </div>
        </div>

        {/* 片段 */}
        {todayEntry.snippet && (
          <div className="relative pl-4 border-l-2 border-pink-200">
            <p className="text-[13px] text-pink-800/80 leading-relaxed italic">
              「{todayEntry.snippet}」
            </p>
          </div>
        )}

        {/* 底部導覽 */}
        <div className="flex items-center justify-end mt-2.5 gap-1">
          <a
            href={`/diary?date=${todayEntry.date}`}
            className="inline-flex items-center gap-1 text-[11px] text-pink-400 hover:text-pink-600 transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            閱讀完整日記
          </a>
        </div>
      </div>
    </motion.div>
  )
}
