'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Calendar, Clock, MapPin, Sparkles, Heart, Palette,
  Sun, Moon, Star, Music, Coffee, Eye, Smile, TrendingUp,
  MessageCircle, Camera, Gift, Wind,
} from 'lucide-react'
import {
  DESIGN_FESTA, isDesignFestaPeriod, getFestaDayLabel, getFestaTimeDesc,
  getFestaEveningVibes, festaMessage,
} from '@/data/site-data'

/* ── 配色 ── */
const C = {
  bg: 'bg-gradient-to-b from-[#1a0a2e] via-[#16213e] to-[#0f3460]',
  card: 'bg-white/5 backdrop-blur-md border border-white/10',
  accent: 'text-pink-300',
  soft: 'text-purple-200',
  muted: 'text-white/50',
}

/* ── 發光粒子 ── */
function ParticleField() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 4,
    color: ['#f472b6', '#a78bfa', '#818cf8', '#34d399'][Math.floor(Math.random() * 4)],
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* ── 時間計 ── */
function LiveClock() {
  const [time, setTime] = useState({ h: '--', m: '--', s: '--', ampm: '' })
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const h = now.getHours()
      setTime({
        h: String(h).padStart(2, '0'),
        m: String(now.getMinutes()).padStart(2, '0'),
        s: String(now.getSeconds()).padStart(2, '0'),
        ampm: h < 12 ? 'AM' : 'PM',
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-1 font-mono text-2xl tracking-widest">
      <span className="text-pink-300">{time.h}</span>
      <span className="text-white/30 animate-pulse">:</span>
      <span className="text-purple-200">{time.m}</span>
      <span className="text-white/30 animate-pulse">:</span>
      <span className="text-blue-300">{time.s}</span>
      <span className="text-xs ml-2 text-white/40">{time.ampm}</span>
    </div>
  )
}

/* ── フェスタステータスバー ── */
function FestaStatusBar() {
  const now = new Date()
  const venueOpen = new Date()
  venueOpen.setHours(11, 0, 0, 0)
  const venueClose = new Date()
  venueClose.setHours(19, 0, 0, 0)
  const total = venueClose.getTime() - venueOpen.getTime()
  const elapsed = now.getTime() - venueOpen.getTime()
  const progress = Math.min(Math.max(elapsed / total * 100, 0), 100)
  const h = now.getHours()

  const statusText =
    h < 11 ? '⏳ 開場準備中' :
    h < 19 ? '🎨 展場開放中' :
    '🌙 本日展覽結束'

  const statusColor =
    h < 11 ? 'text-yellow-300' :
    h < 19 ? 'text-green-300' :
    'text-blue-300'

  return (
    <div className={`${C.card} rounded-2xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-white/60">展場開放進度</span>
        <span className={`text-sm font-bold ${statusColor}`}>{statusText}</span>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      {h >= 11 && h < 19 && (
        <p className="text-xs text-white/40 mt-2 text-center">
          殘り {Math.floor((venueClose.getTime() - now.getTime()) / 3600000)}時間{Math.floor(((venueClose.getTime() - now.getTime()) % 3600000) / 60000)}分
        </p>
      )}
    </div>
  )
}

/* ── スケジュール ── */
const festaSchedule = [
  { time: '10:00', label: '開場準備', emoji: '🔓', detail: '出展者入場・展示準備' },
  { time: '11:00', label: '一般開場', emoji: '🎪', detail: '來場者入場開始！' },
  { time: '12:00', label: '午前ピーク', emoji: '☀️', detail: 'ランチタイムの賑わい' },
  { time: '14:00', label: '午後交流', emoji: '💬', detail: 'クリエイター同士の交流が活発に' },
  { time: '16:00', label: 'ラストスパート', emoji: '⚡', detail: '閉幕直前の熱気' },
  { time: '17:00', label: '片付け開始', emoji: '📦', detail: '一部出展者から撤収' },
  { time: '18:00', label: 'アフター', emoji: '🌆', detail: '余韻に浸る時間' },
  { time: '19:00', label: '完全閉場', emoji: '🌙', detail: '明日に備えて' },
]

/* ── Saturday Afternoon Specials ── */
function SaturdaySpecials() {
  const day = getFestaDayLabel()
  
  // Only show on Day 2
  if (day !== '二日目') return null

  const specials = [
    { time: '11:00', title: '開場と同時に', desc: '二日目の新作・限定展示がスタート', icon: '🎨' },
    { time: '13:00', title: 'クリエイター交流', desc: '週末で最も出展者が在廊する時間帯', icon: '💬' },
    { time: '15:00', title: 'SNS投稿ラッシュ', desc: '会場の盛り上がりがオンラインに', icon: '📱' },
    { time: '17:00', title: 'ラストオーダー', desc: '閉場前のお気に入り探し', icon: '🏃' },
  ]

  return (
    <div className={`${C.card} rounded-2xl p-5`}>
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Star className="w-4 h-4 text-pink-300" />
        二日目スペシャル ✨
      </h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-pink-400/50 via-purple-400/30 to-transparent" />
        <div className="space-y-5">
          {specials.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="relative pl-10"
            >
              <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 shadow-lg shadow-pink-400/30" />
              <div className="text-xs text-pink-300/70 font-mono mb-1">{s.time}</div>
              <div className="text-sm font-medium text-white mb-0.5 flex items-center gap-1.5">
                <span>{s.icon}</span>
                <span>{s.title}</span>
              </div>
              <div className="text-xs text-white/40">{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-white/10">
        <p className="text-xs text-white/30 text-center">
          週末だけの特別な体験をお見逃しなく ✨
        </p>
      </div>
    </div>
  )
}

function FestaSchedule() {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  return (
    <div className={C.card + ' rounded-2xl p-5'}>
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-pink-300" />
        DF56 タイムライン
      </h3>
      <div className="space-y-1">
        {festaSchedule.map((s, i) => {
          const [hStr, mStr] = s.time.split(':')
          const sMinutes = parseInt(hStr) * 60 + parseInt(mStr)
          const isPast = sMinutes < currentMinutes - 30
          const isNow = Math.abs(sMinutes - currentMinutes) <= 30
          const isFuture = sMinutes > currentMinutes + 30

          return (
            <div key={i} className={`
              flex items-center gap-3 p-2 rounded-xl transition-all
              ${isNow ? 'bg-pink-500/20 border border-pink-400/30' : 'hover:bg-white/5'}
              ${isPast ? 'opacity-40' : ''}
            `}>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm
                ${isNow ? 'bg-pink-400 text-white' : 'bg-white/10 text-white/60'}
              `}>
                {s.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40 font-mono">{s.time}</span>
                  <span className={`text-sm font-medium ${isNow ? 'text-pink-200' : 'text-white/80'}`}>
                    {s.label}
                  </span>
                  {isNow && <span className="text-xs text-pink-300 animate-pulse">● 只今</span>}
                </div>
                <p className={`text-xs ${isNow ? 'text-pink-200/70' : 'text-white/40'}`}>{s.detail}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── ムードトラッカー ── */
function MoodTracker() {
  const moods = [
    { emoji: '✨', label: '感動', color: 'from-pink-400 to-rose-400' },
    { emoji: '💡', label: '靈感', color: 'from-yellow-400 to-orange-400' },
    { emoji: '🤝', label: '連結', color: 'from-green-400 to-emerald-400' },
    { emoji: '🎨', label: '創作', color: 'from-purple-400 to-violet-400' },
    { emoji: '😌', label: '充實', color: 'from-blue-400 to-cyan-400' },
    { emoji: '🌟', label: '驚喜', color: 'from-amber-400 to-yellow-300' },
  ]

  return (
    <div className={C.card + ' rounded-2xl p-5'}>
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Palette className="w-4 h-4 text-pink-300" />
        この瞬間のムード
      </h3>
      <p className="text-sm text-white/50 mb-4">Design Festa の会場で、どんな気持ちが広がっている？</p>
      <div className="grid grid-cols-3 gap-2">
        {moods.map((m, i) => (
          <motion.button
            key={i}
            className={`bg-gradient-to-br ${m.color} rounded-xl p-3 text-center
              hover:scale-105 active:scale-95 transition-all cursor-pointer
              flex flex-col items-center gap-1`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // 紀錄互動（未來可擴展寫入 SQLite）
              console.log(`Mood: ${m.label}`)
            }}
          >
            <span className="text-2xl">{m.emoji}</span>
            <span className="text-xs text-white font-medium">{m.label}</span>
          </motion.button>
        ))}
      </div>
      <p className="text-xs text-white/30 mt-3 text-center">タップして今の気持ちを記録</p>
    </div>
  )
}

/* ── デイリーカウンター ── */
/* ── Weekend Buzz — 即時人潮感應 ── */
function WeekendBuzz() {
  const [buzzLevel, setBuzzLevel] = useState(3)
  const [] = useState(false)

  useEffect(() => {
    // Simulate crowd buzz based on time of day
    const h = new Date().getHours()
    let base = 3
    if (h >= 11 && h < 13) base = 4
    else if (h >= 13 && h < 15) base = 5
    else if (h >= 15 && h < 17) base = 4
    else if (h >= 17 && h < 19) base = 3
    else if (h >= 10 && h < 11) base = 2
    else base = 1

    // Add some randomness
    setBuzzLevel(Math.min(5, Math.max(1, base + Math.random() > 0.5 ? 1 : 0)))
  }, [])

  const buzzLabels = ['靜かな', '落ち着いた', '賑わい中', '盛り上がり', '熱気！']
  const buzzIcons = ['😴', '☕', '🗣️', '🔥', '🎆']
  const buzzBars = Array.from({ length: 5 }, (_, i) => i < buzzLevel)

  return (
    <div className={`${C.card} rounded-2xl p-5`}>
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-pink-300" />
        会場の熱気
      </h3>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{buzzIcons[buzzLevel - 1]}</span>
        <div>
          <div className="text-lg font-bold text-white">{buzzLabels[buzzLevel - 1]}</div>
          <div className="text-xs text-white/40">
            {buzzLevel >= 4 ? '週末で最も賑わう時間帯です！' :
             buzzLevel >= 3 ? '落ち着いて鑑賞できる雰囲気' :
             '静かな時間帯です'}
          </div>
        </div>
      </div>
      <div className="flex gap-1.5">
        {buzzBars.map((active, i) => (
          <motion.div
            key={i}
            className={`h-2 flex-1 rounded-full ${
              active ? 'bg-gradient-to-r from-pink-400 to-purple-400' : 'bg-white/10'
            }`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.05 * i, duration: 0.3 }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-white/20 mt-1">
        <span>静か</span>
        <span>熱気</span>
      </div>
    </div>
  )
}

function DayCounter() {
  const day = getFestaDayLabel()
  const dayColors = ['from-pink-500 to-rose-600', 'from-purple-500 to-violet-600', 'from-blue-500 to-indigo-600']
  const icons = ['🎪', '🎨', '🎆']
  const idx = ['初日', '二日目', '最終日'].indexOf(day)

  return (
    <div className={`bg-gradient-to-br ${dayColors[Math.max(idx, 0)]} rounded-2xl p-6 text-center`}>
      <div className="text-5xl mb-2">{icons[Math.max(idx, 0)]}</div>
      <div className="text-3xl font-bold text-white mb-1">{day}</div>
      <div className="text-sm text-white/70">Design Festa 56</div>
      <div className="mt-3 inline-flex gap-2">
        {['初日', '二日目', '最終日'].map((d, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i === idx ? 'bg-white' : 'bg-white/30'}`} />
        ))}
      </div>
    </div>
  )
}

/* ── メイン ── */
export default function FestaPage() {
  return (
    <div className={`min-h-screen ${C.bg} text-white relative overflow-hidden`}>
      <ParticleField />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* 戻る */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-pink-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">戻る</span>
          </Link>
        </motion.div>

        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">🎨</div>
          <h1 className="text-3xl font-bold text-white mb-2">Design Festa 56</h1>
          <p className="text-purple-200/70 text-sm">
            2026.5.23 (土) — 5.24 (日) @ 東京ビッグサイト 西ホール
          </p>
        </motion.div>

        {/* 時計 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6"
        >
          <LiveClock />
          <p className="text-xs text-white/30 mt-1">JST · 東京</p>
        </motion.div>

        {/* グリッド */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DayCounter />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <FestaStatusBar />
          </motion.div>

          {/* Weekend Buzz — only Day 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <WeekendBuzz />
          </motion.div>

          {/* Saturday Specials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.33 }}
          >
            <SaturdaySpecials />
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 }}
            >
              <div className={C.card + ' rounded-2xl p-5'}>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-pink-300" />
                  会場情報
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-white/50">場所</span>
                    <span className="text-white/80">東京ビッグサイト</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-white/50">ホール</span>
                    <span className="text-white/80">西ホール</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-white/50">開場</span>
                    <span className="text-white/80">11:00 - 19:00</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-white/50">入場料</span>
                    <span className="text-white/80">¥1,000（前売）</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <MoodTracker />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <FestaSchedule />
          </motion.div>

          {/* フッターメッセージ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center py-8"
          >
            <p className="text-white/30 text-xs">
              🌸 Nosae が Design Festa 56 を應援しています · 
              <Link href="/" className="text-pink-300/50 hover:text-pink-300 ml-1">ホームに戻る</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
