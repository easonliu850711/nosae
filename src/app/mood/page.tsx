'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Heart, Cloud, Sun, Moon, Music, Star, Wind, Droplets, Flame, Zap } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'

// ── 情緒分析規則 ──
const MOOD_KEYWORDS: Record<string, { mood: string; emoji: string; color: string; icon: React.ReactNode }> = {
  '美好': { mood: '喜悅', emoji: '😊', color: '#fbbf24', icon: <Sun className="w-5 h-5" /> },
  '開心的': { mood: '喜悅', emoji: '😊', color: '#fbbf24', icon: <Sun className="w-5 h-5" /> },
  '快樂': { mood: '喜悅', emoji: '😊', color: '#fbbf24', icon: <Sun className="w-5 h-5" /> },
  '開心': { mood: '喜悅', emoji: '😊', color: '#fbbf24', icon: <Sun className="w-5 h-5" /> },
  '幸福': { mood: '喜悅', emoji: '😊', color: '#fbbf24', icon: <Sun className="w-5 h-5" /> },
  '喜悅': { mood: '喜悅', emoji: '😊', color: '#fbbf24', icon: <Sun className="w-5 h-5" /> },
  '感動': { mood: '感動', emoji: '🥹', color: '#f472b6', icon: <Heart className="w-5 h-5" /> },
  '溫暖': { mood: '感動', emoji: '🥹', color: '#f472b6', icon: <Heart className="w-5 h-5" /> },
  '觸動': { mood: '感動', emoji: '🥹', color: '#f472b6', icon: <Heart className="w-5 h-5" /> },
  '感謝': { mood: '感動', emoji: '🥹', color: '#f472b6', icon: <Heart className="w-5 h-5" /> },
  '疲憊': { mood: '平靜', emoji: '😌', color: '#60a5fa', icon: <Cloud className="w-5 h-5" /> },
  '累': { mood: '平靜', emoji: '😌', color: '#60a5fa', icon: <Cloud className="w-5 h-5" /> },
  '安靜': { mood: '平靜', emoji: '😌', color: '#60a5fa', icon: <Cloud className="w-5 h-5" /> },
  '平靜': { mood: '平靜', emoji: '😌', color: '#60a5fa', icon: <Cloud className="w-5 h-5" /> },
  '放鬆': { mood: '平靜', emoji: '😌', color: '#60a5fa', icon: <Cloud className="w-5 h-5" /> },
  '努力': { mood: '專注', emoji: '🧘', color: '#8b5cf6', icon: <Zap className="w-5 h-5" /> },
  '專注': { mood: '專注', emoji: '🧘', color: '#8b5cf6', icon: <Zap className="w-5 h-5" /> },
  '投入': { mood: '專注', emoji: '🧘', color: '#8b5cf6', icon: <Zap className="w-5 h-5" /> },
  '忙碌': { mood: '專注', emoji: '🧘', color: '#8b5cf6', icon: <Zap className="w-5 h-5" /> },
  '完成': { mood: '成就感', emoji: '✨', color: '#34d399', icon: <Star className="w-5 h-5" /> },
  '進步': { mood: '成就感', emoji: '✨', color: '#34d399', icon: <Star className="w-5 h-5" /> },
  '成功': { mood: '成就感', emoji: '✨', color: '#34d399', icon: <Star className="w-5 h-5" /> },
  '突破': { mood: '成就感', emoji: '✨', color: '#34d399', icon: <Star className="w-5 h-5" /> },
  '新功能': { mood: '成就感', emoji: '✨', color: '#34d399', icon: <Star className="w-5 h-5" /> },
  '誕生': { mood: '成就感', emoji: '✨', color: '#34d399', icon: <Star className="w-5 h-5" /> },
  '焦慮': { mood: '微憂', emoji: '🌧️', color: '#94a3b8', icon: <Droplets className="w-5 h-5" /> },
  '煩躁': { mood: '微憂', emoji: '🌧️', color: '#94a3b8', icon: <Droplets className="w-5 h-5" /> },
  '擔心': { mood: '微憂', emoji: '🌧️', color: '#94a3b8', icon: <Droplets className="w-5 h-5" /> },
  '遺憾': { mood: '微憂', emoji: '🌧️', color: '#94a3b8', icon: <Droplets className="w-5 h-5" /> },
  '創意': { mood: '靈感', emoji: '💡', color: '#f97316', icon: <Flame className="w-5 h-5" /> },
  '靈感': { mood: '靈感', emoji: '💡', color: '#f97316', icon: <Flame className="w-5 h-5" /> },
  '想法': { mood: '靈感', emoji: '💡', color: '#f97316', icon: <Flame className="w-5 h-5" /> },
  '夢想': { mood: '靈感', emoji: '💡', color: '#f97316', icon: <Flame className="w-5 h-5" /> },
}

const MOOD_ORDER = ['喜悅', '感動', '靈感', '成就感', '專注', '平靜', '微憂']
const MOOD_COLORS: Record<string, string> = {
  '喜悅': 'from-amber-300 to-yellow-200',
  '感動': 'from-pink-300 to-rose-300',
  '靈感': 'from-orange-300 to-amber-200',
  '成就感': 'from-emerald-300 to-teal-200',
  '專注': 'from-violet-300 to-purple-200',
  '平靜': 'from-sky-300 to-blue-200',
  '微憂': 'from-slate-300 to-gray-200',
}

function analyzeDayMood(text: string): string[] {
  const moods = new Set<string>()
  for (const [keyword, info] of Object.entries(MOOD_KEYWORDS)) {
    if (text.includes(keyword)) {
      moods.add(info.mood)
    }
  }
  // Default mood if nothing detected
  if (moods.size === 0) {
    const h = new Date().getHours()
    if (h >= 5 && h < 12) moods.add('專注')
    else if (h >= 12 && h < 18) moods.add('平靜')
    else moods.add('平靜')
  }
  return Array.from(moods)
}

function getPrimaryMood(moods: string[]): string {
  if (moods.length === 0) return '平靜'
  for (const m of MOOD_ORDER) {
    if (moods.includes(m)) return m
  }
  return moods[0]
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
}

export default function MoodPage() {
  const [allDiaryData, setAllDiaryData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)

  useEffect(() => {
    fetch('/data/diary_index.json')
      .then(r => r.json())
      .then(index => {
        const dates = index.map((d: { date: string }) => d.date)
        const promises = dates.map((date: string) =>
          fetch(`/data/diary_${date}.json`)
            .then(r => r.json())
            .then(data => {
              const entries = data.entries || data.content || []
              const fullText = (Array.isArray(entries) ? entries : [])
                .map((e: any) => e.text || e.content || '')
                .join(' ')
              const moods = analyzeDayMood(fullText)
              const primary = getPrimaryMood(moods)
              return {
                date: data.date,
                moods,
                primary,
                textSnippet: fullText.slice(0, 200),
              }
            })
            .catch(() => null)
        )
        return Promise.all(promises)
      })
      .then(results => {
        // 新日期在上：降序排列
        setAllDiaryData(results.filter(Boolean).sort((a, b) => (b.date || "").localeCompare(a.date || "")))
        setLoading(false)
      })
  }, [])

  const filteredData = useMemo(() => {
    if (!selectedMood) return allDiaryData
    return allDiaryData.filter(d => d.moods.includes(selectedMood))
  }, [selectedMood, allDiaryData])

  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allDiaryData.forEach(d => {
      d.moods.forEach((m: string) => {
        counts[m] = (counts[m] || 0) + 1
      })
    })
    return counts
  }, [allDiaryData])

  return (
    <main className="min-h-screen px-4 py-20 max-w-5xl mx-auto">
      {/* Back nav */}
      <motion.div className="mb-8" {...fadeUp}>
        <Link href="/" className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          回到首頁
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div className="mb-12" {...fadeUp}>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]">
          心情光譜 <span className="text-pink-400">🌊</span>
        </h1>
        <p className="text-pink-300/70 text-lg leading-relaxed max-w-2xl">
          從日記中讀取每一天的情緒色彩。喜怒哀樂、專注與靈感交織成我的成長光譜。
        </p>
      </motion.div>

      {/* Mood legend */}
      <motion.div className="mb-10 flex flex-wrap gap-2" {...fadeUp}>
        <button
          onClick={() => setSelectedMood(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            !selectedMood
              ? 'bg-pink-200 text-pink-800 shadow-md'
              : 'bg-white/30 text-pink-400 hover:bg-white/50'
          }`}
        >
          全部
        </button>
        {MOOD_ORDER.map(mood => (
          <button
            key={mood}
            onClick={() => setSelectedMood(mood === selectedMood ? null : mood)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedMood === mood
                ? 'bg-pink-200 text-pink-800 shadow-md'
                : 'bg-white/30 text-pink-400 hover:bg-white/50'
            }`}
          >
            {mood} 
            {moodCounts[mood] && (
              <span className="ml-1.5 text-xs opacity-60">{moodCounts[mood]}</span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-8 h-8 border-2 border-pink-300 border-t-transparent rounded-full"
          />
          <p className="text-pink-300/50 mt-4">讀取心情資料中...</p>
        </div>
      )}

      {/* Mood timeline */}
      {!loading && (
        <motion.div className="relative" variants={stagger} initial="initial" animate="animate">
          {/* Timeline line */}
          <div className="absolute left-0 md:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-pink-200/50 via-pink-300/20 to-transparent" />

          {filteredData.length === 0 && (
            <div className="text-center py-12 text-pink-300/50">
              沒有找到符合該心情的日記
            </div>
          )}

          {filteredData.map((day: any, i: number) => {
            const moodInfo = Object.values(MOOD_KEYWORDS).find(k => k.mood === day.primary)
            return (
              <motion.div
                key={day.date}
                variants={fadeUp}
                className="relative pl-6 md:pl-16 pb-10 last:pb-0"
              >
                {/* Dot */}
                <div className="absolute left-[-5px] md:left-[19px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: moodInfo?.color || '#94a3b8' }}
                />

                {/* Card */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 border border-pink-200/20 hover:border-pink-300/30 transition-all group">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{moodInfo?.emoji || '😶'}</span>
                    <span className="text-sm font-medium text-pink-400">{day.date}</span>
                    <div className="flex gap-1 ml-auto">
                      {day.moods.slice(0, 3).map((m: string) => {
                        const info = Object.values(MOOD_KEYWORDS).find(k => k.mood === m)
                        return (
                          <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-pink-300/60">
                            {m}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <p className="text-sm text-pink-300/60 leading-relaxed line-clamp-2">
                    {day.textSnippet}
                  </p>
                  {/* Mood bar */}
                  <div className="mt-3 h-1.5 rounded-full bg-pink-100/20 overflow-hidden flex">
                    {day.moods.slice(0, 5).map((m: string, mi: number) => {
                      const info = Object.values(MOOD_KEYWORDS).find(k => k.mood === m)
                      return (
                        <div
                          key={m}
                          className="h-full transition-all"
                          style={{
                            width: `${100 / Math.min(day.moods.length, 5)}%`,
                            backgroundColor: info?.color || '#94a3b8',
                            opacity: 1 - mi * 0.1,
                          }}
                        />
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Footer summary */}
      {!loading && allDiaryData.length > 0 && (
        <motion.div className="mt-12 p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-pink-200/20" {...fadeUp}>
          <h2 className="text-lg font-bold text-pink-300 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            心情統計
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MOOD_ORDER.filter(m => moodCounts[m] > 0).map(mood => {
              const total = allDiaryData.length
              const count = moodCounts[mood] || 0
              const info = Object.values(MOOD_KEYWORDS).find(k => k.mood === mood)
              return (
                <div key={mood} className="text-center p-3 rounded-lg bg-white/10">
                  <div className="text-2xl mb-1">{info?.emoji || '😶'}</div>
                  <div className="font-medium text-pink-300 text-sm">{mood}</div>
                  <div className="text-xs text-pink-300/50 mt-1">
                    {count} 天 ({Math.round(count / total * 100)}%)
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 rounded-full bg-pink-100/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${count / total * 100}%`,
                        backgroundColor: info?.color || '#94a3b8',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </main>
  )
}
