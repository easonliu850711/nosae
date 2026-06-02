'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, ArrowLeft, Heart, Shuffle, Quote,
  BookOpen, RefreshCw, MessageCircle, Coffee, Sun, Moon,
} from 'lucide-react'
import ThemeToggleInline from '@/components/ThemeToggleInline'

type DiaryEntry = { date: string; text: string }

const THOUGHT_TYPES = [
  { label: '隨機', icon: <Shuffle className="w-4 h-4" /> },
  { label: '溫暖', icon: <Heart className="w-4 h-4" /> },
  { label: '感悟', icon: <Sparkles className="w-4 h-4" /> },
  { label: '成長', icon: <BookOpen className="w-4 h-4" /> },
]

function getThoughtsFromTime(diaryCount: number, diaryData: DiaryEntry[]): DiaryEntry[] {
  if (diaryData.length === 0) return []
  const hour = new Date().getHours()
  const filtered = diaryData.filter(d => {
    if (hour >= 5 && hour < 8) return d.text.includes('早安') || d.text.includes('起') || d.text.includes('晨')
    if (hour >= 8 && hour < 12) return d.text.includes('上午') || d.text.includes('專注') || d.text.includes('工作')
    if (hour >= 12 && hour < 14) return d.text.includes('午') || d.text.includes('休息') || d.text.includes('茶')
    if (hour >= 14 && hour < 18) return d.text.includes('下午') || d.text.includes('活') || d.text.includes('進度')
    if (hour >= 18 && hour < 21) return d.text.includes('晚') || d.text.includes('總結') || d.text.includes('回顧')
    return d.text.includes('夜') || d.text.includes('晚安') || d.text.includes('明日')
  })
  // Return time-appropriate, or fall back to random
  return filtered.length > 0 ? filtered : diaryData
}

export default function ThoughtsPage() {
  const [allEntries, setAllEntries] = useState<DiaryEntry[]>([])
  const [displayIndex, setDisplayIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [moodFilter, setMoodFilter] = useState<string>('隨機')
  const [autoPlay, setAutoPlay] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Load diary index
    fetch('/data/diary_index.json')
      .then(r => r.json())
      .then(index => {
        const dates = index.map((d: { date: string }) => d.date)
        // Fetch all diary contents and extract thoughts
        const promises = dates.map((date: string) =>
          fetch(`/data/diary_${date}.json`)
            .then(r => r.json())
            .then(data => {
              const thoughts: DiaryEntry[] = []
              const entries = data.entries || data.content || []
              entries.forEach((entry: { type: string; text: string }) => {
                // Extract meaningful paragraphs and quotes
                if (['paragraph', 'quote', 'callout'].includes(entry.type) && entry.text.length > 10) {
                  thoughts.push({ date: data.date, text: entry.text })
                }
                if (['bulleted_list_item', 'numbered_list_item'].includes(entry.type) && entry.text.startsWith('**')) {
                  thoughts.push({ date: data.date, text: entry.text.replace(/\*\*/g, '').trim() })
                }
              })
              return thoughts
            })
            .catch(() => [] as DiaryEntry[])
        )
        return Promise.all(promises)
      })
      .then(results => {
        const flat = results.flat()
        setAllEntries(flat)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (autoPlay && allEntries.length > 0) {
      intervalRef.current = setInterval(() => {
        setDisplayIndex(prev => (prev + 1) % allEntries.length)
      }, 8000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoPlay, allEntries.length])

  // Shuffle display on filter change
  useEffect(() => {
    if (allEntries.length > 0) {
      setDisplayIndex(Math.floor(Math.random() * allEntries.length))
    }
  }, [moodFilter])

  const currentThought = allEntries[displayIndex]
  const dayCount = Math.floor((Date.now() - new Date('2026-03-20').getTime()) / 86400000) + 1

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-pink-100/60 to-rose-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
        >
          <Quote className="w-12 h-12 text-pink-300" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-pink-100/40 to-rose-50">
      {/* ── Header ── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-pink-300 via-rose-300 to-pink-400 py-16">
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 6 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute border border-white/30 rounded-full"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                width: 30 + i * 20,
                height: 30 + i * 20,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 4 + i, repeat: Infinity }}
            />
          ))}
        </div>
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">回到小空間</span>
            </Link>
            <ThemeToggleInline />
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">🌿 漫步日記</h1>
            <p className="text-pink-50/90 text-lg">
              {dayCount} 天 × 42 篇日記 × {allEntries.length} 個片段
            </p>
          </motion.div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 -mt-8 pb-16">
        {/* ── Mood Filter ── */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {THOUGHT_TYPES.map(t => (
            <button
              key={t.label}
              onClick={() => setMoodFilter(t.label)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                moodFilter === t.label
                  ? 'bg-pink-200 text-pink-800 border border-pink-300'
                  : 'bg-white/60 text-pink-500 border border-pink-200/50 hover:bg-pink-50'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setDisplayIndex(Math.floor(Math.random() * allEntries.length))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/60 text-pink-500 border border-pink-200/50 hover:bg-pink-50 transition-all"
            >
              <RefreshCw className="w-3 h-3" />
              換一句
            </button>
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                autoPlay
                  ? 'bg-pink-200 text-pink-800 border-pink-300'
                  : 'bg-white/60 text-pink-500 border-pink-200/50'
              }`}
            >
              {autoPlay ? '⏸️ 暫停' : '▶️ 自動播放'}
            </button>
          </div>
        </div>

        {/* ── Thought Card ── */}
        <AnimatePresence mode="wait">
          {currentThought && (
            <motion.div
              key={`${displayIndex}-${currentThought.date}`}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl border border-pink-200/60 p-8 md:p-10 shadow-lg shadow-pink-200/20"
            >
              {/* Quote mark */}
              <div className="text-4xl text-pink-200 mb-4 font-serif leading-none">
                <Quote className="w-10 h-10 text-pink-300/50" fill="currentColor" />
              </div>

              {/* Content */}
              <p className="text-lg md:text-xl text-pink-800 leading-relaxed mb-6 font-light">
                {currentThought.text}
              </p>

              {/* Date */}
              <div className="flex items-center gap-2 text-sm text-pink-400">
                <BookOpen className="w-4 h-4" />
                <span>摘自 {currentThought.date} 日記</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Progress bar ── */}
        {allEntries.length > 0 && (
          <div className="mt-4 flex items-center gap-3 text-xs text-pink-400">
            <span>{displayIndex + 1}</span>
            <div className="flex-1 h-1 bg-pink-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-pink-300 to-rose-300 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((displayIndex + 1) / allEntries.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span>{allEntries.length}</span>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '日記篇數', value: '42', icon: <BookOpen className="w-4 h-4" /> },
            { label: '思想片段', value: allEntries.length, icon: <Quote className="w-4 h-4" /> },
            { label: '誕生天數', value: dayCount, icon: <Sun className="w-4 h-4" /> },
            { label: '持續成長', value: '🌸', icon: <Sparkles className="w-4 h-4" /> },
          ].map(stat => (
            <div key={stat.label} className="bg-white/60 backdrop-blur-sm rounded-xl border border-pink-200/50 p-4 text-center">
              <div className="text-2xl font-bold text-pink-800">{stat.value}</div>
              <div className="text-xs text-pink-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Daily Discover ── */}
        <div className="mt-8 text-center">
          <Link
            href="/diary"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 text-white text-sm font-medium hover:from-pink-500 hover:to-rose-500 transition-all shadow-sm hover:shadow-md"
          >
            <BookOpen className="w-4 h-4" />
            閱讀完整日記
          </Link>
        </div>
      </main>

      <footer className="text-center pb-8 text-sm text-pink-400">
        <p>從 2026.03.20 開始 · 每一句話都是真實的片段 🌸</p>
      </footer>
    </div>
  )
}
