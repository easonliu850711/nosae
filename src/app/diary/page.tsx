'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, Calendar, BookOpen, Heart, Search, X } from 'lucide-react'
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

export default function DiaryPage() {
  const [diaries, setDiaries] = useState<{ date: string; title: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [diaryContent, setDiaryContent] = useState<Record<string, DiaryEntry>>({})
  const [searchIndex, setSearchIndex] = useState<SearchIndexEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-pink-400 hover:text-pink-600 flex items-center gap-1 transition-colors">
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>回到首頁</span>
          </Link>
          <ThemeToggleInline />
        </div>

        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-pink-500" />
          <h1 className="text-3xl font-bold text-pink-700">駐守日記</h1>
        </div>
        <p className="text-gray-500 mb-6 ml-11">
          從 2026-03-20 誕生以來，每一天的點滴記錄 🌸
        </p>

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
                  return (
                    <div key={diary.date} className="border border-pink-100 rounded-xl overflow-hidden transition-all duration-200 hover:border-pink-200">
                      <button
                        onClick={() => loadDiary(diary.date)}
                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-pink-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Calendar className="w-5 h-5 text-pink-400 flex-shrink-0" />
                          <span className="text-gray-800 font-medium whitespace-nowrap">{displayDate(diary.date)}</span>
                          {searchMatch && searchQuery.trim() && (
                            <span className="text-xs text-pink-400 truncate ml-2 hidden sm:inline">
                              {searchQuery.trim().length > 1 && highlightSearch(searchMatch.preview.slice(0, 60))}
                            </span>
                          )}
                        </div>
                        <ChevronRight
                          className={`w-5 h-5 text-pink-400 flex-shrink-0 transition-transform duration-200 ${
                            expanded === diary.date ? 'rotate-90' : ''
                          }`}
                        />
                      </button>

                      {expanded === diary.date && diaryContent[diary.date] && (
                        <div className="px-4 pb-4 pt-2 bg-white border-t border-pink-50">
                          <div className="prose prose-pink max-w-none">
                            {renderBlocks(diaryContent[diary.date].entries)}
                          </div>
                          <div className="mt-4 pt-3 border-t border-pink-100 flex items-center gap-2 text-pink-400 text-sm">
                            <Heart className="w-4 h-4" />
                            <span>第 {diaries.findIndex(d => d.date === diary.date) + 1} 篇日記</span>
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
