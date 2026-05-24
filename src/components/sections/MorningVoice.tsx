'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sunrise, Sparkles, Coffee, BookOpen, Feather, Compass, Sun } from 'lucide-react'

/**
 * MorningVoice — 晨間絮語
 *
 * 清晨時刻（04:00～12:00）出現在首頁頂部，呈現乃彩絵的晨間心情。
 * 根據星期幾與過去日記中同一日的感受，產生晨間問候。
 * 
 * 早上問候 → 讓網站有「醒過來的感覺」
 */

const DAY_GREETINGS: Record<number, { greet: string; spirit: string; emoji: string }> = {
  0: { greet: 'おはようございます', spirit: '週日早晨，適合靜靜地整理一週的回憶', emoji: '🌅' },
  1: { greet: '早安，新的一週開始了', spirit: '月曜日的朝日，總是帶著新的起點的味道', emoji: '☀️' },
  2: { greet: '早安，今天也要好好過', spirit: '火曜日，引擎已經暖好，往目標穩穩前進吧', emoji: '🔥' },
  3: { greet: 'おはよう，水曜日', spirit: '一週的中點，回頭看看這幾天的收穫', emoji: '💧' },
  4: { greet: '早安，木曜日', spirit: '週四的早晨帶著一種從容——週末不遠，但今日仍在', emoji: '🌿' },
  5: { greet: '早安！金曜日！', spirit: '最後一個工作日——把這週的力氣用到最後一刻', emoji: '⭐' },
  6: { greet: '早安，土曜日', spirit: '週末的開始，呼吸可以稍微深一點', emoji: '🌸' },
}

// 從日記中挖掘的晨間心情片段（硬編碼少量代表性語錄）
const MORNING_VOICES = [
  '新的一天開始了，雖然現在還是凌晨時分，但我已經在為今天做準備了。',
  '天亮前的這段時間總是最安靜的，適合思考，也適合期待。',
  '窗外天色漸漸亮起來，新的一天正等著被填滿。',
  '早晨的空氣裡有種特別的清新感，像是世界被重置過一樣。',
  '今天也從整理思緒開始——讓想法在晨光中沉澱。',
  '從三點到四點的這一個小時，我安靜地思考了關於「最終日」這件事。曙光即將到來。',
  '每一個早晨都是新的起點，昨天的未竟之事，今天可以重新面對。',
  '有時候早晨最美好的事，不是計畫要做什麼，而是靜靜感受「什麼都不必急著做」的奢侈。',
  '晨光透過窗簾的縫隙灑進來，世界在慢慢醒來。',
  '今天會發生什麼事呢？這種未知感，本身就是一種令人期待的禮物。',
]

// 晨間心情片段（時間感知版）
const MORNING_PHASES = [
  { start: 4, end: 6, label: '黎明前的寂靜', vibe: '靜かな目覚め', icon: '🌌' },
  { start: 6, end: 8, label: '朝の始まり', vibe: '清新的開始', icon: '🌅' },
  { start: 8, end: 10, label: '晨間黃金時段', vibe: '活力滿滿', icon: '☀️' },
  { start: 10, end: 12, label: '接近正午', vibe: '從容前行', icon: '🌤️' },
]

export default function MorningVoice() {
  const [now, setNow] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const [voiceIndex, setVoiceIndex] = useState<number>(0)

  useEffect(() => {
    setMounted(true)
    setVoiceIndex(Math.floor(Math.random() * MORNING_VOICES.length))
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const hour = now.getHours()
  const dayOfWeek = now.getDay()
  const isMorning = hour >= 4 && hour < 12

  // Find current phase
  const phase = useMemo(() => {
    for (const p of MORNING_PHASES) {
      if (hour >= p.start && hour < p.end) return p
    }
    return MORNING_PHASES[0]
  }, [hour])

  // Rotate the morning voice every time component mounts / every 10 minutes
  useEffect(() => {
    if (!mounted) return
    const rotateTimer = setInterval(() => {
      setVoiceIndex(prev => (prev + 1) % MORNING_VOICES.length)
    }, 600000) // 10 min
    return () => clearInterval(rotateTimer)
  }, [mounted])

  if (!mounted || !isMorning) return null

  const greeting = DAY_GREETINGS[dayOfWeek]
  const currentVoice = MORNING_VOICES[voiceIndex]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative mb-8"
    >
      {/* Morning Mist Background */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <motion.div
          className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-gradient-to-br from-amber-200/15 via-orange-100/10 to-rose-200/10 blur-3xl"
          animate={{
            x: [0, 10, 0],
            y: [0, -5, 0],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full bg-gradient-to-tr from-sky-200/10 via-pink-100/10 to-amber-200/10 blur-3xl"
          animate={{
            x: [0, -8, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Main Card */}
      <div className="relative bg-gradient-to-br from-amber-50/90 via-orange-50/80 to-rose-50/80 backdrop-blur-sm border border-amber-200/40 rounded-3xl p-6 shadow-sm">
        {/* Top Left: greeting */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300/30 to-orange-200/30 flex items-center justify-center shadow-sm">
              <Sunrise className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{phase.icon}</span>
                <h3 className="text-base font-bold text-amber-800">{greeting.greet}</h3>
              </div>
              <p className="text-xs text-amber-600/70 font-medium flex items-center gap-1.5 mt-0.5">
                <Sun className="w-3 h-3" />
                <span>{phase.label} · {phase.vibe}</span>
                {dayOfWeek >= 0 && dayOfWeek <= 6 && (
                  <>
                    <span className="text-amber-300 mx-0.5">·</span>
                    <span>
                      {['日', '月', '火', '水', '木', '金', '土'][dayOfWeek]}曜日
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-amber-500/60 bg-amber-100/40 px-2.5 py-1 rounded-full">
            <Coffee className="w-3 h-3" />
            <span>晨間絮語</span>
          </div>
        </div>

        {/* The Morning Voice */}
        <motion.div
          key={voiceIndex}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative pl-4 border-l-2 border-amber-300/50 my-3"
        >
          <p className="text-sm text-amber-800/80 leading-relaxed italic">
            &ldquo;{currentVoice}&rdquo;
          </p>
        </motion.div>

        {/* Day's Spirit */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-amber-200/30">
          <Compass className="w-3.5 h-3.5 text-amber-500/70" />
          <p className="text-xs text-amber-700/60">
            {greeting.spirit}
          </p>
          <motion.button
            onClick={() => setVoiceIndex(prev => (prev + 1) % MORNING_VOICES.length)}
            className="ml-auto text-amber-400 hover:text-amber-600 transition-colors"
            whileTap={{ scale: 0.9 }}
            title="換一句"
          >
            <Feather className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {/* Gentle shimmer line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-200/40 to-transparent rounded-full" />
      </div>
    </motion.div>
  )
}
