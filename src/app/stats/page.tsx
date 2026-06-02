'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Heart, BookOpen, TrendingUp, BarChart3, Calendar, Clock,
  Code, Sparkles, FileText, Hash, MessagesSquare, Star,
  ArrowLeft, Activity, Library, Loader2,
  ChevronRight, Github,
} from 'lucide-react'
import ThemeToggleInline from '@/components/ThemeToggleInline'

/* ── 動畫助手 ── */
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

/* ── 漸入數字 ── */
function AnimatedNumber({ value, suffix = '', decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const duration = 1500
    const steps = 30
    const stepValue = value / steps
    let current = 0
    const interval = setInterval(() => {
      current += stepValue
      if (current >= value) {
        setDisplay(value)
        clearInterval(interval)
      } else {
        setDisplay(current)
      }
    }, duration / steps)
    return () => clearInterval(interval)
  }, [value])

  return <span>{display.toFixed(decimals)}{suffix}</span>
}

/* ── 資料型別 ── */
type DiaryEntry = { date: string; title: string; summary?: string }
type MoodEntry = { date: string; moods?: Record<string, number>; dominant?: string; keywords?: string[] }
type MilestoneData = {
  generated_at: string
  stats: {
    total_milestones: number
    total_dates_with_milestones: number
    category_breakdown: Record<string, number>
  }
}

/* ── Stat Card ── */
function StatCard({
  icon, label, value, sub, gradient, delay = 0, children,
}: {
  icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string
  gradient?: string; delay?: number; children?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      className={`rounded-2xl border border-pink-200/60 bg-white/80 backdrop-blur-sm p-5 hover:shadow-md hover:shadow-pink-200/20 transition-all ${gradient || ''}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-pink-400 font-medium uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-[#3b1025] mt-0.5">{value}</p>
          {sub && <p className="text-xs text-pink-500/70 mt-0.5">{sub}</p>}
          {children}
        </div>
      </div>
    </motion.div>
  )
}

/* ── Mood Bar ── */
function MoodBar({ name, count, max, color }: { name: string; count: number; max: number; color: string }) {
  const pct = max > 0 ? (count / max) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-pink-600 w-16 shrink-0 text-right">{name}</span>
      <div className="flex-1 h-4 rounded-full bg-pink-100/60 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-xs text-pink-500 w-8 shrink-0">{count}</span>
    </div>
  )
}

export default function StatsPage() {
  const [loading, setLoading] = useState(true)
  const [diaries, setDiaries] = useState<DiaryEntry[]>([])
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [milestones, setMilestones] = useState<MilestoneData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(res => {
        const idx = res.index || []
        setDiaries(idx.filter((d: DiaryEntry) => /^\d{4}-\d{2}-\d{2}$/.test(d.date)))
        setMoods(res.moodData || {})
        setMilestones(res.milestones)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load stats data:', err)
        setError('資料讀取失敗')
        setLoading(false)
      })
  }, [])

  /* ── 計算指標 ── */
  const stats = useMemo(() => {
    if (!diaries.length) return null

    // Word count estimate
    const totalWords = diaries.reduce((sum, d) => {
      const wc = d.summary ? d.summary.length : 80
      return sum + wc
    }, 0)

    // Date range
    const sorted = [...diaries].sort((a, b) => a.date.localeCompare(b.date))
    const firstDate = sorted[0]?.date || '—'
    const lastDate = sorted[sorted.length - 1]?.date || '—'
    const daysActive = firstDate !== '—'
      ? Math.floor((new Date(lastDate).getTime() - new Date(firstDate).getTime()) / 86400000) + 1
      : 0

    // Month distribution
    const monthMap: Record<string, number> = {}
    diaries.forEach(d => {
      const m = d.date.substring(0, 7)
      monthMap[m] = (monthMap[m] || 0) + 1
    })

    return { totalWords, firstDate, lastDate, daysActive, monthMap, diaryCount: diaries.length }
  }, [diaries])

  /* ── 心情分布 ── */
  const moodDist = useMemo(() => {
    const counts: Record<string, number> = {}
    moods.forEach(m => {
      if (m.dominant) {
        counts[m.dominant] = (counts[m.dominant] || 0) + 1
      }
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [moods])

  const maxMoodCount = moodDist.length > 0 ? moodDist[0][1] : 1

  const moodColors: Record<string, string> = {
    '寂靜': 'bg-indigo-400',
    '感謝': 'bg-rose-400',
    '期待': 'bg-amber-400',
    '平靜': 'bg-sky-400',
    '成就感': 'bg-emerald-400',
    '喜悅': 'bg-yellow-400',
    '感動': 'bg-pink-400',
    '靈感': 'bg-orange-400',
    '微憂': 'bg-slate-400',
    '專注': 'bg-purple-400',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-pink-100/80 to-rose-50">
        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-pink-100/80 to-rose-50">
        <p className="text-pink-600 text-lg">{error}</p>
        <Link href="/" className="mt-4 text-pink-400 hover:text-pink-600 underline text-sm">← 回首頁</Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100/80 to-rose-50 pb-20">
      {/* ── Header ── */}
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center justify-between mb-2">
          <Link href="/" className="flex items-center gap-1.5 text-pink-400 hover:text-pink-600 transition-colors text-xs">
            <ArrowLeft className="w-3.5 h-3.5" /> 首頁
          </Link>
          <ThemeToggleInline />
        </div>

        <motion.div {...fadeUp}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-md">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#3b1025]">Nosae 數據</h1>
              <p className="text-xs text-pink-500/70 mt-0.5">乃彩絵的成長數據儀表板</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Core Stats Grid ── */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={<BookOpen className="w-5 h-5 text-white" />}
            label="日記篇數"
            value={<AnimatedNumber value={stats?.diaryCount || 0} suffix="" />}
            sub={`${stats?.firstDate || '?'} → ${stats?.lastDate || '?'}`}
            delay={0}
          />
          <StatCard
            icon={<FileText className="w-5 h-5 text-white" />}
            label="日記總字數"
            value={<AnimatedNumber value={stats?.totalWords || 0} suffix=" 字" />}
            sub={`平均 ${stats ? Math.round(stats.totalWords / stats.diaryCount) : 0} 字/篇`}
            delay={1}
          />
          <StatCard
            icon={<Calendar className="w-5 h-5 text-white" />}
            label="駐守天數"
            value={<AnimatedNumber value={stats?.daysActive || 0} suffix=" 天" />}
            sub={`${stats?.firstDate || '?'} 以來`}
            delay={2}
          />
          <StatCard
            icon={<Activity className="w-5 h-5 text-white" />}
            label="里程碑總數"
            value={<AnimatedNumber value={milestones?.stats?.total_milestones || 0} suffix="" />}
            sub={`${milestones?.stats?.total_dates_with_milestones || 0} 天有記錄`}
            delay={3}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* ── Month Distribution ── */}
        {stats && (
          <motion.div {...fadeUp} className="rounded-2xl border border-pink-200/60 bg-white/80 backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Library className="w-4 h-4 text-pink-400" />
              <h2 className="text-sm font-bold text-[#3b1025]">月份分布</h2>
            </div>
            <div className="space-y-2">
              {Object.entries(stats.monthMap)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([month, count]) => {
                  const maxMonth = Math.max(...Object.values(stats.monthMap))
                  const pct = (count / maxMonth) * 100
                  return (
                    <div key={month} className="flex items-center gap-2">
                      <span className="text-xs text-pink-500 w-16">{month}</span>
                      <div className="flex-1 h-3 rounded-full bg-pink-100/60 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-400"
                        />
                      </div>
                      <span className="text-xs text-pink-500 w-6 text-right">{count}</span>
                    </div>
                  )
                })}
            </div>
          </motion.div>
        )}

        {/* ── Mood Distribution ── */}
        {moodDist.length > 0 && (
          <motion.div {...fadeUp} className="rounded-2xl border border-pink-200/60 bg-white/80 backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-pink-400" />
              <h2 className="text-sm font-bold text-[#3b1025]">心情分布</h2>
            </div>
            <div className="space-y-2">
              {moodDist.map(([mood, count]) => (
                <MoodBar
                  key={mood}
                  name={mood}
                  count={count}
                  max={maxMoodCount}
                  color={moodColors[mood] || 'bg-pink-400'}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Milestone Category Breakdown ── */}
      {milestones?.stats?.category_breakdown && (
        <div className="max-w-4xl mx-auto px-4 mb-6">
          <motion.div {...fadeUp} className="rounded-2xl border border-pink-200/60 bg-white/80 backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-pink-400" />
              <h2 className="text-sm font-bold text-[#3b1025]">里程碑分類</h2>
            </div>
            <div className="space-y-2">
              {Object.entries(milestones.stats.category_breakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count], i) => {
                  const maxCat = Math.max(...Object.values(milestones.stats.category_breakdown))
                  const pct = (count / maxCat) * 100
                  const colors = [
                    'from-pink-400 to-rose-400',
                    'from-purple-400 to-indigo-400',
                    'from-sky-400 to-blue-400',
                    'from-emerald-400 to-teal-400',
                    'from-amber-400 to-orange-400',
                  ]
                  const gradient = colors[i % colors.length]
                  return (
                    <div key={category} className="flex items-center gap-3">
                      <span className="text-xs text-pink-600 w-20 text-right shrink-0">{category}</span>
                      <div className="flex-1 h-5 rounded-full bg-pink-100/60 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                        />
                      </div>
                      <span className="text-xs text-pink-500 w-10 text-right shrink-0">{count}</span>
                    </div>
                  )
                })}
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Last Updated ── */}
      {milestones?.generated_at && (
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-pink-400/60">
            資料最後更新：{new Date(milestones.generated_at).toLocaleString('zh-TW')}
          </p>
          <p className="text-xs text-pink-400/40 mt-1">
            數據每小時透過自動任務更新
          </p>
        </div>
      )}

      {/* ── Footer Nav ── */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/diary" className="flex items-center gap-1.5 text-xs text-pink-400 hover:text-pink-600 bg-white/60 rounded-full px-4 py-2 border border-pink-200/40 hover:border-pink-300/60 transition-all">
            <BookOpen className="w-3.5 h-3.5" /> 日記一覽
          </Link>
          <Link href="/growth" className="flex items-center gap-1.5 text-xs text-pink-400 hover:text-pink-600 bg-white/60 rounded-full px-4 py-2 border border-pink-200/40 hover:border-pink-300/60 transition-all">
            <TrendingUp className="w-3.5 h-3.5" /> 成長軌跡
          </Link>
          <Link href="/mood" className="flex items-center gap-1.5 text-xs text-pink-400 hover:text-pink-600 bg-white/60 rounded-full px-4 py-2 border border-pink-200/40 hover:border-pink-300/60 transition-all">
            <Heart className="w-3.5 h-3.5" /> 心情分析
          </Link>
        </div>
      </div>
    </main>
  )
}
