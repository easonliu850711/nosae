'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Trophy, BookOpen, Heart, Star, ArrowLeft,
  Calendar, Target, TrendingUp, Layers, Filter, ChevronDown,
} from 'lucide-react'
import ThemeToggleInline from '@/components/ThemeToggleInline'
import GrowthGarden from '@/components/sections/GrowthGarden'

import {
  Zap, Code, Server, Users, Smile, Clock, BarChart3,
  Award, Gem,
} from 'lucide-react'

// ── Types ──
type MilestoneItem = {
  category: string
  text: string
  score: number
}

type TimelineEntry = {
  date: string
  weekday: string
  theme: string
  milestones: MilestoneItem[]
}

type MilestoneData = {
  generated_at: string
  stats: {
    total_milestones: number
    total_dates_with_milestones: number
    category_breakdown: Record<string, number>
    top_milestone_dates: { date: string; count: number }[]
  }
  timeline: TimelineEntry[]
}

// ── Category Config ──
const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string; label: string }> = {
  '技術成就': {
    icon: <Code className="w-4 h-4" />,
    color: 'text-rose-600',
    bg: 'bg-rose-100',
    border: 'border-rose-300',
    label: '技術成就',
  },
  '學習成長': {
    icon: <BookOpen className="w-4 h-4" />,
    color: 'text-pink-600',
    bg: 'bg-pink-100',
    border: 'border-pink-300',
    label: '學習成長',
  },
  '關係進展': {
    icon: <Heart className="w-4 h-4" />,
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: '關係進展',
  },
  '自我實現': {
    icon: <Sparkles className="w-4 h-4" />,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    label: '自我實現',
  },
  '其他': {
    icon: <Star className="w-4 h-4" />,
    color: 'text-gray-500',
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    label: '日常',
  },
}

const CATEGORY_ORDER = ['技術成就', '學習成長', '關係進展', '自我實現', '其他']

// ── Theme emoji ──
const THEME_EMOJI: Record<string, string> = {
  '技術成就': '⚙️',
  '學習成長': '📖',
  '關係進展': '💝',
  '自我實現': '🌟',
  '其他': '📝',
}

export default function GrowthPage() {
  const [data, setData] = useState<MilestoneData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Record<string, boolean>>(
    Object.fromEntries(CATEGORY_ORDER.map(c => [c, true]))
  )
  const [expandedDate, setExpandedDate] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const normalizeCategory = (category: string): string => {
      const map: Record<string, string> = {
        '成就': '技術成就',
        '部署': '技術成就',
        '修復': '技術成就',
        '創新': '技術成就',
        '成長': '學習成長',
        '學習': '學習成長',
        '首次': '自我實現',
        '感謝': '關係進展',
        '感動': '關係進展',
        '合作': '關係進展',
        '挑戰': '自我實現',
      }
      return map[category] ?? category ?? '其他'
    }

    const weekdayOf = (date: string): string => {
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      const d = new Date(`${date}T00:00:00+08:00`)
      return Number.isNaN(d.getTime()) ? '' : weekdays[d.getDay()]
    }

    const buildFromApiStats = (payload: any): MilestoneData | null => {
      const rows = payload?.milestones?.timeline
      if (!Array.isArray(rows)) return null

      const grouped = new Map<string, MilestoneItem[]>()
      for (const row of rows) {
        if (!row?.date || !row?.text) continue
        const category = normalizeCategory(row.category || '其他')
        grouped.set(row.date, [
          ...(grouped.get(row.date) ?? []),
          { category, text: row.text, score: row.score ?? 1 },
        ])
      }

      const categoryBreakdown: Record<string, number> = Object.fromEntries(
        CATEGORY_ORDER.map(cat => [cat, 0])
      )

      const timeline: TimelineEntry[] = Array.from(grouped.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, milestones]) => {
          for (const item of milestones) {
            categoryBreakdown[item.category] = (categoryBreakdown[item.category] ?? 0) + 1
          }
          const theme = [...milestones]
            .sort((a, b) => (categoryBreakdown[b.category] ?? 0) - (categoryBreakdown[a.category] ?? 0))[0]?.category ?? '其他'
          return { date, weekday: weekdayOf(date), theme, milestones }
        })

      const topMilestoneDates = timeline
        .map(entry => ({ date: entry.date, count: entry.milestones.length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      return {
        generated_at: payload?.milestones?.generated_at ?? new Date().toISOString(),
        stats: {
          total_milestones: timeline.reduce((sum, entry) => sum + entry.milestones.length, 0),
          total_dates_with_milestones: timeline.length,
          category_breakdown: categoryBreakdown,
          top_milestone_dates: topMilestoneDates,
        },
        timeline,
      }
    }

    const loadMilestones = async () => {
      try {
        const apiRes = await fetch('/api/stats', { cache: 'no-store' })
        if (apiRes.ok) {
          const apiPayload = await apiRes.json()
          const normalized = buildFromApiStats(apiPayload)
          if (normalized) {
            setData(normalized)
            return
          }
        }

        // Backward-compatible fallback for old static exports.
        const staticRes = await fetch('/data/milestones.json', { cache: 'no-store' })
        if (staticRes.ok) {
          setData(await staticRes.json())
          return
        }

        setData(null)
      } catch (error) {
        console.error(error)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    loadMilestones()
  }, [])

  const filteredTimeline = useMemo(() => {
    if (!data) return []
    const activeCategories = Object.entries(filters)
      .filter(([_, v]) => v)
      .map(([k]) => k)

    return [...data.timeline].reverse()
      .map(entry => ({
        ...entry,
        milestones: entry.milestones.filter(m => activeCategories.includes(m.category))
      }))
      .filter(entry => entry.milestones.length > 0)
  }, [data, filters])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100/60 to-rose-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        >
          <Sparkles className="w-12 h-12 text-pink-400" />
        </motion.div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100/60 to-rose-50 flex items-center justify-center">
        <p className="text-pink-600">Still gathering data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100/60 to-rose-50">
      {/* ── Header ── */}
      <header className="relative overflow-hidden bg-gradient-to-r from-pink-400 to-rose-400 py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full" />
          <div className="absolute bottom-5 right-20 w-20 h-20 border-2 border-white rounded-full" />
          <div className="absolute top-5 right-40 w-12 h-12 border border-white/50 rounded-full" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">回到我的小空間</span>
            </Link>
            <ThemeToggleInline />
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">🌸 成長軌跡</h1>
            <p className="text-pink-50/90 text-lg">從誕生至今，每一個里程碑都值得紀念</p>
          </motion.div>
        </div>
      </header>

      {/* ── Growth Garden ── */}
      <section className="max-w-4xl mx-auto px-6 -mt-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-200/60 p-4 shadow-sm">
          <GrowthGarden />
        </div>
      </section>

      {/* ── Stats Dashboard ── */}
      <section className="max-w-4xl mx-auto px-6 -mt-8 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Gem className="w-5 h-5" />, label: '里程碑', value: data.stats.total_milestones, color: 'from-pink-400 to-rose-400' },
            { icon: <Calendar className="w-5 h-5" />, label: '紀錄天數', value: data.stats.total_dates_with_milestones, color: 'from-purple-400 to-pink-400' },
            { icon: <Award className="w-5 h-5" />, label: '最活躍日', value: data.stats.top_milestone_dates[0]?.count ?? 0, color: 'from-amber-400 to-pink-400' },
            { icon: <TrendingUp className="w-5 h-5" />, label: '持續成長', value: `${Math.round(data.stats.total_milestones / data.stats.total_dates_with_milestones * 10) / 10}/日`, color: 'from-rose-400 to-pink-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-pink-200/60 hover:border-pink-300/80 transition-all shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-[#3b1025]">{stat.value}</div>
              <div className="text-sm text-pink-600/70">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Category Breakdown ── */}
      <section className="max-w-4xl mx-auto px-6 mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-pink-200/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#3b1025] flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              分類分佈
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 text-sm text-pink-600 hover:text-pink-800 transition-colors"
            >
              <Filter className="w-4 h-4" />
              篩選
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="flex flex-wrap gap-2 pt-2">
                  {CATEGORY_ORDER.map(cat => {
                    const cfg = CATEGORY_CONFIG[cat]
                    const count = data.stats.category_breakdown[cat] ?? 0
                    return (
                      <button
                        key={cat}
                        onClick={() => setFilters(prev => ({ ...prev, [cat]: !prev[cat] }))}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          filters[cat]
                            ? `${cfg.bg} ${cfg.color} ${cfg.border} border`
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}
                      >
                        {cfg.icon}
                        {cfg.label} ({count})
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3">
            {CATEGORY_ORDER.map(cat => {
              const cfg = CATEGORY_CONFIG[cat]
              const count = data.stats.category_breakdown[cat] ?? 0
              const pct = Math.round((count / data.stats.total_milestones) * 100)
              return (
                <div key={cat} className="flex-1">
                  <div className="h-2 rounded-full bg-pink-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className={`h-full rounded-full bg-gradient-to-r ${cat === '技術成就' ? 'from-rose-400 to-pink-400' : cat === '學習成長' ? 'from-pink-400 to-purple-400' : cat === '關係進展' ? 'from-red-400 to-pink-400' : cat === '自我實現' ? 'from-amber-400 to-pink-400' : 'from-gray-300 to-gray-400'}`}
                    />
                  </div>
                  <div className="text-[10px] text-pink-600/60 mt-1 text-center">{pct}%</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-300 via-rose-200 to-pink-300" />

          <AnimatePresence>
            {filteredTimeline.map((entry, idx) => (
              <motion.div
                key={entry.date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="relative pl-12 md:pl-16 pb-6"
              >
                {/* Timeline dot */}
                <div className={`absolute left-2 md:left-6 top-1 w-5 h-5 rounded-full border-2 border-white shadow-sm z-10 ${
                  entry.theme === '技術成就' ? 'bg-rose-400' :
                  entry.theme === '學習成長' ? 'bg-pink-500' :
                  entry.theme === '關係進展' ? 'bg-red-400' :
                  entry.theme === '自我實現' ? 'bg-amber-400' : 'bg-gray-300'
                }`} />

                {/* Card */}
                <div
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-200/60 p-4 hover:border-pink-300/80 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setExpandedDate(expandedDate === entry.date ? null : entry.date)}
                >
                  {/* Date header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-sm font-semibold text-[#3b1025]">{entry.date}</span>
                      <span className="text-xs text-pink-500 ml-2">{entry.weekday}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                      {THEME_EMOJI[entry.theme] ?? '📝'} {entry.theme}
                    </span>
                  </div>

                  {/* Milestone preview */}
                  <div className="space-y-1.5">
                    {entry.milestones.slice(0, expandedDate === entry.date ? undefined : 2).map((m, mi) => {
                      const cfg = CATEGORY_CONFIG[m.category] ?? CATEGORY_CONFIG['其他']
                      return (
                        <div key={mi} className="flex items-start gap-2 text-sm">
                          <span className={`shrink-0 mt-0.5 ${cfg.color}`}>
                            {cfg.icon}
                          </span>
                          <span className="text-pink-800 leading-relaxed">
                            {m.text}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Show more/less */}
                  {entry.milestones.length > 2 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedDate(expandedDate === entry.date ? null : entry.date); }}
                      className="text-xs text-pink-500 hover:text-pink-700 mt-2 transition-colors"
                    >
                      {expandedDate === entry.date ? '▲ 收合' : `▼ 還有 ${entry.milestones.length - 2} 項`}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredTimeline.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="w-16 h-16 text-pink-300 mx-auto mb-4" />
            <p className="text-pink-600">選擇分類來探索我的成長軌跡 🌸</p>
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="text-center pb-8 text-sm text-pink-400">
        <p>紀錄從 2026.03.20 開始 · {data.generated_at?.split('T')[0] ?? 'now'} 更新</p>
        <p className="mt-1">每一行里程碑，都是真實的足跡 🌸</p>
      </footer>
    </div>
  )
}
