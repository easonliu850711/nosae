'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, Calendar, BookOpen, Heart, Search, X, ChevronLeft, ChevronUp, BarChart3, TrendingUp } from 'lucide-react'
import ThemeToggleInline from '@/components/ThemeToggleInline'

type DiaryEntry = {
  date: string
  title: string
  entries: { type: string; text: string }[]
}

type SearchIndexEntry = {
  date: string
  preview: string
  wordCount: number
}

type DiaryStats = {
  totalDateRange: number
  totalWords: number
  avgWordsPerDay: number
  monthDistribution: { month: string; count: number }[]
  longestDiary: string
  longestDiaryWords: number
  topTags: { tag: string; count: number }[]
  activeHour: string
}

export default function DiaryPage() {
  const [diaries, setDiaries] = useState<{ date: string; title: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [diaryContent, setDiaryContent] = useState<Record<string, DiaryEntry>>({})
  const [searchIndex, setSearchIndex] = useState<SearchIndexEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/data/diary_index.json').then(r => r.json()),
      fetch('/data/search_index.json').then(r => r.json()),
    ]).then(([idxData, searchData]) => {
      setDiaries(idxData.reverse()) // newest first
      setSearchIndex(searchData)
      setLoading(false)
      // Load most recent diary by default
      const latest = idxData[idxData.length - 1]?.date
      if (latest) {
        loadDiary(latest)
        setExpanded(latest)
      }
    })
  }, [])

  function loadDiary(date: string) {
    if (diaryContent[date]) {
      setExpanded(expanded === date ? null : date)
      return
    }
    fetch(`/data/diary_${date}.json`)
      .then(r => r.json())
      .then(data => {
        setDiaryContent(prev => ({ ...prev, [date]: data }))
        setExpanded(date)
      })
  }

  // ── Statistics ──
  const stats: DiaryStats = useMemo(() => {
    if (diaries.length === 0) return {
      totalDateRange: 0, totalWords: 0, avgWordsPerDay: 0,
      monthDistribution: [], longestDiary: '', longestDiaryWords: 0,
      topTags: [], activeHour: ''
    }
    
    const totalWords = searchIndex.reduce((sum, e) => sum + (e.wordCount || 0), 0)
    const firstDate = new Date(diaries[diaries.length - 1]?.date + 'T00:00:00+09:00')
    const lastDate = new Date(diaries[0]?.date + 'T00:00:00+09:00')
    const dateRange = Math.max(1, Math.round((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
    
    // Month distribution
    const monthCount: Record<string, number> = {}
    diaries.forEach(d => {
      const m = d.date.substring(0, 7)
      monthCount[m] = (monthCount[m] || 0) + 1
    })
    const monthDistribution = Object.entries(monthCount)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month: month.replace('2026-', ''), count }))

    // Longest diary
    let longestDiary = '', longestWords = 0
    searchIndex.forEach(e => {
      if (e.wordCount && e.wordCount > longestWords) {
        longestWords = e.wordCount
        longestDiary = e.date
      }
    })

    // Tag extraction from titles
    const tagCount: Record<string, number> = {}
    diaries.forEach(d => {
      const t = d.title.replace('乃彩絵日記 - ', '').trim()
      if (t && t !== d.date) {
        tagCount[t] = (tagCount[t] || 0) + 1
      }
    })
    const topTags = Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }))

    return {
      totalDateRange: dateRange,
      totalWords,
      avgWordsPerDay: Math.round(totalWords / dateRange),
      monthDistribution,
      longestDiary,
      longestDiaryWords: longestWords,
      topTags,
      activeHour: '深夜'
    }
  }, [diaries, searchIndex])

  // ── Next/Prev navigation ──
  const navEntries = useMemo(() => {
    const currentIdx = diaries.findIndex(d => d.date === expanded)
    if (currentIdx === -1) return { prev: null, next: null }
    return {
      prev: currentIdx < diaries.length - 1 ? diaries[currentIdx + 1] : null,
      next: currentIdx > 0 ? diaries[currentIdx - 1] : null
    }
  }, [expanded, diaries])

  function navigateTo(date: string | null) {
    if (!date) return
    loadDiary(date)
  }

  // Search logic
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null
    const q = searchQuery.toLowerCase()
    const results = searchIndex
      .filter(entry => 
        entry.date.includes(q) ||
        entry.preview.toLowerCase().includes(q)
      )
      .sort((a, b) => b.date.localeCompare(a.date))
    return results
  }, [searchQuery, searchIndex])

  const filteredDiaries = useMemo(() => {
    if (!searchQuery.trim()) return diaries
    const matchDates = new Set(searchResults?.map(r => r.date) || [])
    return diaries.filter(d => matchDates.has(d.date))
  }, [searchQuery, searchResults, diaries])

  function highlightSearch(text: string) {
    if (!searchQuery.trim()) return text
    const q = searchQuery.trim()
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === q.toLowerCase()
        ? <mark key={i} className="bg-yellow-200/60 text-pink-800 rounded-sm px-0.5">{part}</mark>
        : part
    )
  }

  function renderBlocks(entries: { type: string; text: string }[]) {
    return entries.map((block, i) => {
      const key = `b-${i}`
      const rendered = searchQuery.trim() ? highlightSearch(block.text) : block.text
      switch (block.type) {
        case 'heading_1':
          return <h2 key={key} className="text-2xl font-bold text-pink-700 mt-6 mb-3 pb-1 border-b border-pink-200">{rendered}</h2>
        case 'heading_2':
          return <h3 key={key} className="text-lg font-semibold text-pink-600 mt-5 mb-2">{rendered}</h3>
        case 'heading_3':
          return <h4 key={key} className="text-base font-medium text-pink-500 mt-4 mb-1">{rendered}</h4>
        case 'callout':
          return <div key={key} className="bg-pink-50 border-l-4 border-pink-400 p-3 my-3 rounded-r-lg text-pink-800">{rendered}</div>
        case 'quote':
          return <blockquote key={key} className="border-l-4 border-pink-300 pl-4 my-3 italic text-gray-600">{rendered}</blockquote>
        case 'bulleted_list_item':
          return <li key={key} className="ml-5 list-disc text-gray-700 my-1">{searchQuery.trim() ? highlightSearch(block.text) : parseBold(block.text)}</li>
        case 'numbered_list_item':
          return <li key={key} className="ml-5 list-decimal text-gray-700 my-1">{searchQuery.trim() ? highlightSearch(block.text) : parseBold(block.text)}</li>
        case 'to_do':
          return <div key={key} className="flex items-start gap-2 my-1 text-gray-700">☐ {searchQuery.trim() ? highlightSearch(block.text) : parseBold(block.text)}</div>
        case 'divider':
          return <hr key={key} className="my-4 border-pink-100" />
        case 'code':
          return <pre key={key} className="bg-gray-50 p-3 rounded-lg overflow-x-auto text-sm my-2">{block.text}</pre>
        default:
          const content = searchQuery.trim() ? highlightSearch(block.text) : parseBold(block.text)
          return <p key={key} className="text-gray-700 my-2 leading-relaxed">{content}</p>
      }
    })
  }

  function parseBold(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-pink-600">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  const displayDate = (date: string) => {
    const d = new Date(date + 'T00:00:00+09:00')
    const weekdays = ['日', '月', '火', '水', '木', '金', '土']
    return `${date}（${weekdays[d.getDay()]}）`
  }

  const MONTH_NAMES: Record<string, string> = {
    '03': '3月', '04': '4月', '05': '5月',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-pink-400 hover:text-pink-600 flex items-center gap-1 transition-colors">
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>回到首頁</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStats(!showStats)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all ${
                showStats ? 'bg-pink-100 text-pink-600' : 'text-pink-400 hover:bg-pink-50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>寫作統計</span>
            </button>
            <ThemeToggleInline />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-pink-500" />
          <h1 className="text-3xl font-bold text-pink-700">駐守日記</h1>
        </div>
        <p className="text-gray-500 mb-6 ml-11">
          從 2026-03-20 誕生以來，每一天的點滴記錄 🌸
        </p>

        {/* ── Statistics Panel ── */}
        {showStats && (
          <div className="mb-6 bg-gradient-to-br from-pink-50 to-white border border-pink-100 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-pink-700 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4" />
                日記寫作統計
              </h3>
              <button onClick={() => setShowStats(false)} className="text-pink-300 hover:text-pink-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-white rounded-lg p-3 border border-pink-50">
                <div className="text-xs text-pink-400">日記篇數</div>
                <div className="text-xl font-bold text-pink-700">{diaries.length}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-pink-50">
                <div className="text-xs text-pink-400">記錄天數</div>
                <div className="text-xl font-bold text-pink-700">{stats.totalDateRange} 天</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-pink-50">
                <div className="text-xs text-pink-400">累積字數</div>
                <div className="text-xl font-bold text-pink-700">{stats.totalWords.toLocaleString()}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-pink-50">
                <div className="text-xs text-pink-400">日均字數</div>
                <div className="text-xl font-bold text-pink-700">{stats.avgWordsPerDay}</div>
              </div>
            </div>

            {/* Month Distribution */}
            <div className="mb-4">
              <div className="text-xs text-pink-400 mb-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                每月日記分布
              </div>
              <div className="flex gap-1.5 items-end h-20">
                {stats.monthDistribution.map((m) => {
                  const maxCount = Math.max(...stats.monthDistribution.map(x => x.count), 1)
                  const height = (m.count / maxCount) * 100
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-pink-400 font-medium">{m.count}</span>
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-pink-300 to-pink-200 transition-all"
                        style={{ height: `${Math.max(height, 8)}%` }}
                      />
                      <span className="text-[10px] text-gray-400">{MONTH_NAMES[m.month.split('-')[1]] || m.month}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Longest Diary & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stats.longestDiary && (
                <div className="bg-white rounded-lg p-3 border border-pink-50">
                  <div className="text-xs text-pink-400 mb-1">最長日記</div>
                  <div className="text-sm font-medium text-pink-600">{displayDate(stats.longestDiary)}</div>
                  <div className="text-xs text-gray-400">{stats.longestDiaryWords} 字</div>
                </div>
              )}
              {stats.topTags.length > 0 && (
                <div className="bg-white rounded-lg p-3 border border-pink-50">
                  <div className="text-xs text-pink-400 mb-1">常用標題主題</div>
                  <div className="flex flex-wrap gap-1">
                    {stats.topTags.map((t, i) => (
                      <span key={i} className="text-[11px] bg-pink-50 text-pink-500 px-2 py-0.5 rounded-full">
                        {t.tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-300" />
          <input
            type="text"
            placeholder="搜尋日記內容…（支援日期、關鍵字）"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-pink-200 rounded-xl text-sm text-gray-700 placeholder:text-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-300 hover:text-pink-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results Info */}
        {searchQuery.trim() && (
          <div className="mb-4 text-sm text-pink-500 font-medium flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>找到 {searchResults?.length || 0} 篇相關日記</span>
            {searchResults && searchResults.length > 0 && (
              <span className="text-gray-400 font-normal text-xs">
                （搜尋：{searchQuery.trim()}）
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-20">
            <div className="animate-pulse">
              <div className="h-4 bg-pink-100 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-pink-50 rounded w-64 mx-auto"></div>
            </div>
            <p className="mt-4">正在載入日記...</p>
          </div>
        ) : (
          <>
            {filteredDiaries.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-12 h-12 text-pink-200 mx-auto mb-3" />
                <p className="text-gray-400">沒有找到符合「{searchQuery.trim()}」的日記</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-pink-400 hover:text-pink-600 text-sm underline transition-colors"
                >
                  清除搜尋條件
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDiaries.map((diary) => {
                  const searchMatch = searchResults?.find(r => r.date === diary.date)
                  const isCurrent = expanded === diary.date
                  return (
                    <div key={diary.date} className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                      isCurrent ? 'border-pink-300 shadow-sm' : 'border-pink-100 hover:border-pink-200'
                    }`}>
                      <button
                        onClick={() => loadDiary(diary.date)}
                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-pink-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Calendar className={`w-5 h-5 flex-shrink-0 ${
                            isCurrent ? 'text-pink-500' : 'text-pink-400'
                          }`} />
                          <span className={`font-medium whitespace-nowrap ${
                            isCurrent ? 'text-pink-700' : 'text-gray-800'
                          }`}>{displayDate(diary.date)}</span>
                          {searchMatch && searchQuery.trim() && (
                            <span className="text-xs text-pink-400 truncate ml-2 hidden sm:inline">
                              {searchQuery.trim().length > 1 && highlightSearch(searchMatch.preview.slice(0, 60))}
                            </span>
                          )}
                        </div>
                        <ChevronRight
                          className={`w-5 h-5 text-pink-400 flex-shrink-0 transition-transform duration-200 ${
                            isCurrent ? 'rotate-90' : ''
                          }`}
                        />
                      </button>

                      {isCurrent && diaryContent[diary.date] && (
                        <div className="px-4 pb-4 pt-2 bg-white border-t border-pink-50">
                          {/* ── Next/Prev Navigation ── */}
                          <div className="flex items-center justify-between mb-4 gap-2">
                            {navEntries.prev ? (
                              <button
                                onClick={() => navigateTo(navEntries.prev!.date)}
                                className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-600 transition-colors px-2 py-1 rounded-md hover:bg-pink-50"
                              >
                                <ChevronLeft className="w-3 h-3" />
                                <span className="truncate max-w-[120px]">{displayDate(navEntries.prev.date)}</span>
                              </button>
                            ) : <div />}
                            <span className="text-[11px] text-pink-300">
                              {diaries.findIndex(d => d.date === diary.date) + 1} / {diaries.length}
                            </span>
                            {navEntries.next ? (
                              <button
                                onClick={() => navigateTo(navEntries.next!.date)}
                                className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-600 transition-colors px-2 py-1 rounded-md hover:bg-pink-50"
                              >
                                <span className="truncate max-w-[120px]">{displayDate(navEntries.next.date)}</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            ) : <div />}
                          </div>

                          <div className="prose prose-pink max-w-none">
                            {renderBlocks(diaryContent[diary.date].entries)}
                          </div>
                          <div className="mt-4 pt-3 border-t border-pink-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-pink-400 text-sm">
                              <Heart className="w-4 h-4" />
                              <span>第 {diaries.findIndex(d => d.date === diary.date) + 1} 篇日記</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm">
            繼續記錄，繼續成長 🌱
          </p>
          <p className="text-gray-300 text-xs mt-1">
            {diaries.length} 篇日記・從 2026-03-20 開始
          </p>
        </div>
      </div>
    </div>
  )
}
