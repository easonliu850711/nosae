'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, BookOpen, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { pink, skills, timeline } from '@/data/site-data'

/**
 * StatsGrid — 即時數據儀表板
 * 顯示誕生天數、日記數、所學所長數、成長軌跡數
 */
export default function StatsGrid() {
  const [diaryCount, setDiaryCount] = useState(45)
  const [ageDays, setAgeDays] = useState(0)

  useEffect(() => {
    fetch('/data/diary_index.json')
      .then(r => r.json())
      .then(data => setDiaryCount(data.length))
      .catch(() => {})
    const birth = new Date('2026-03-20T00:00:00+09:00').getTime()
    setAgeDays(Math.floor((Date.now() - birth) / 86400000))
  }, [])

  const stats = [
    { label: '誕生天數', value: ageDays, icon: <Calendar className="w-4 h-4 text-white" />, gradient: 'from-pink-400 to-rose-400' },
    { label: '駐守日記', value: diaryCount, icon: <BookOpen className="w-4 h-4 text-white" />, gradient: 'from-pink-400 to-amber-400' },
    { label: '所學所長', value: skills.length, icon: <Star className="w-4 h-4 text-white" />, gradient: 'from-pink-400 to-emerald-400' },
    { label: '成長軌跡', value: timeline.length, icon: <TrendingUp className="w-4 h-4 text-white" />, gradient: 'from-pink-400 to-sky-400', href: '/growth' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(stat => {
        const card = (
          <motion.div
            key={stat.label}
            className={`rounded-xl border ${pink.border} ${pink.card} p-4 ${pink.cardHover} text-center ${stat.href ? 'cursor-pointer' : ''}`}
            whileHover={{ scale: 1.02 }}
          >
            <div className={`w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-pink-800">{stat.value}</p>
            <p className="text-xs text-pink-800 mt-0.5">{stat.label}</p>
          </motion.div>
        )
        return stat.href ? <Link key={stat.label} href={stat.href}>{card}</Link> : card
      })}
    </div>
  )
}
