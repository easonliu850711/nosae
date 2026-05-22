'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * 🌸 MoodRing — 環境情緒色環
 *
 * 根據時間、星期、季節，產生不同的背景氛圍疊加
 * 讓網站像活著的呼吸一樣，隨著時光流轉改變色調
 */

interface MoodColors {
  bg: string
  glow: string
  accent: string
  name: string
  emoji: string
}

function getCurrentMood(): MoodColors {
  const now = new Date()
  const h = now.getHours()
  const month = now.getMonth() + 1 // 1-12

  // ── 季節調性 ──
  const isSpring = month >= 3 && month <= 5
  const isSummer = month >= 6 && month <= 8
  const isAutumn = month >= 9 && month <= 11
  const isWinter = month === 12 || month <= 2

  // ── 時段調性 ──
  if (h >= 5 && h < 7) {
    // 🌅 黎明 — 橘粉曙光
    return {
      bg: 'linear-gradient(135deg, rgba(251, 191, 36, 0.04), rgba(249, 115, 22, 0.06))',
      glow: 'rgba(251, 168, 31, 0.06)',
      accent: '#fbbf24',
      name: '黎明曙光',
      emoji: '🌅',
    }
  }
  if (h >= 7 && h < 10) {
    // ☀️ 早晨 — 清新粉藍
    return {
      bg: isSpring
        ? 'linear-gradient(135deg, rgba(244, 114, 182, 0.05), rgba(167, 139, 250, 0.04))'
        : 'linear-gradient(135deg, rgba(147, 197, 253, 0.05), rgba(244, 114, 182, 0.04))',
      glow: 'rgba(244, 114, 182, 0.05)',
      accent: '#f472b6',
      name: '朝氣蓬勃',
      emoji: '☀️',
    }
  }
  if (h >= 10 && h < 14) {
    // 🌤️ 午前 — 專注淡紫
    return {
      bg: 'linear-gradient(135deg, rgba(167, 139, 250, 0.04), rgba(196, 181, 253, 0.03))',
      glow: 'rgba(167, 139, 250, 0.04)',
      accent: '#a78bfa',
      name: '專注時刻',
      emoji: '🌤️',
    }
  }
  if (h >= 14 && h < 17) {
    // 🌻 午後 — 溫暖金黃
    return {
      bg: 'linear-gradient(135deg, rgba(251, 191, 36, 0.04), rgba(245, 158, 11, 0.05))',
      glow: 'rgba(251, 191, 36, 0.04)',
      accent: '#fbbf24',
      name: '午後從容',
      emoji: '🌻',
    }
  }
  if (h >= 17 && h < 19) {
    // 🌆 傍晚 — 橘紅暮色
    return {
      bg: 'linear-gradient(135deg, rgba(249, 115, 22, 0.05), rgba(239, 68, 68, 0.04))',
      glow: 'rgba(249, 115, 22, 0.05)',
      accent: '#f97316',
      name: '暮色沉靜',
      emoji: '🌆',
    }
  }
  if (h >= 19 && h < 23) {
    // 🌙 夜晚 — 靜謐靛藍
    return {
      bg: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.04))',
      glow: 'rgba(99, 102, 241, 0.05)',
      accent: '#6366f1',
      name: '夜色沉澱',
      emoji: '🌙',
    }
  }
  // 深夜 23-5 — 深海暗紫
  return {
    bg: 'linear-gradient(135deg, rgba(88, 28, 135, 0.06), rgba(30, 27, 75, 0.08))',
    glow: 'rgba(88, 28, 135, 0.06)',
    accent: '#5b21b6',
    name: '深夜靜謐',
    emoji: '💤',
  }
}

export default function MoodRing() {
  const [mounted, setMounted] = useState(false)
  const [mood, setMood] = useState<MoodColors>(getCurrentMood())
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    setMounted(true)
    // 每分鐘更新 mood（而非每秒，節省資源）
    const tick = setInterval(() => {
      setMood(getCurrentMood())
      setSeconds(s => s + 10)
    }, 60000)
    return () => clearInterval(tick)
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* 固定背景 — 大面積柔光疊加 */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        initial={false}
        animate={{
          background: mood.bg,
        }}
        transition={{ duration: 3, ease: 'easeInOut' }}
      />

      {/* 左上角漂浮光暈 */}
      <motion.div
        className="fixed top-20 left-20 w-96 h-96 rounded-full pointer-events-none z-0"
        initial={false}
        animate={{
          background: `radial-gradient(circle, ${mood.glow}, transparent 70%)`,
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ filter: 'blur(60px)' }}
      />

      {/* 右下角漂浮光暈 */}
      <motion.div
        className="fixed bottom-20 right-20 w-80 h-80 rounded-full pointer-events-none z-0"
        initial={false}
        animate={{
          background: `radial-gradient(circle, ${mood.glow}, transparent 70%)`,
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        style={{ filter: 'blur(50px)' }}
      />

      {/* ⏱ 時間標籤（半透明裝飾，不干擾內容） */}
      <motion.div
        className="fixed top-24 right-6 pointer-events-none z-0 hidden md:block"
        initial={false}
        animate={{ opacity: seconds > 0 ? 1 : 0.3 }}
        transition={{ duration: 2 }}
      >
        <div className="text-right">
          <div className="text-lg" style={{ opacity: 0.15 }}>{mood.emoji}</div>
          <div
            className="text-[10px] font-mono tracking-wider"
            style={{ opacity: 0.12 }}
          >
            {(() => {
              const h = new Date().getHours()
              const m = String(new Date().getMinutes()).padStart(2, '0')
              return `${String(h).padStart(2, '0')}:${m}`
            })()}
          </div>
        </div>
      </motion.div>
    </>
  )
}
