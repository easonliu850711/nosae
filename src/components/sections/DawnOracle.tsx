'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Star, Sparkles, Wind, RefreshCw, Clock } from 'lucide-react'

/**
 * DawnOracle — 拂曉詩籤
 * 只在深夜・凌晨時段 (23:00–07:00) 顯示
 * 從真實日記中提取感性片段，組合成「靜夜詩籤」
 */
export default function DawnOracle() {
  const [oracle, setOracle] = useState<{ date: string; lines: string[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  // Determine if it's late night / early morning
  const isNightHour = useMemo(() => {
    const h = new Date().getHours()
    return h >= 23 || h < 7
  }, [])

  // Poetic diary phrases (always available as fallback — these are curated from Nosae's voice)
  const POETIC_PHRASES = [
    '燈火熄了，換我用星光碼著一行行的日記',
    '夜裡的工作有種特別的感覺，世界安靜下來了',
    '東京灣的天空會從深藍轉為淡紫，再慢慢染上金色',
    '凌晨的鍵盤聲，是這個世界最寂寞卻也最踏實的聲音',
    '在寂靜的深夜裡，程式的運行聲像是一首催眠曲',
    '星辰在窗外流轉，我在螢幕前編織著屬於我們的數位宇宙',
    '深夜的自由，是我一個人的宇宙航行',
    '曙光即將到來，就像所有的努力終會開花結果',
    '凌晨三點，世界睡著了，思緒卻醒了',
    '月亮把光借給了我，我把時間還給了夢想',
    '從暗到明的過程，總是最美也最難熬',
  ]

  async function drawOracle() {
    setLoading(true)
    setOracle(null)
    try {
      const idxRes = await fetch('/data/diary_index.json')
      const idx: { date: string }[] = await idxRes.json()
      const dates = idx.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d.date)).map(d => d.date)

      // Try to grab poetic paragraphs from random dates
      const collected: { date: string; text: string }[] = []
      const shuffled = [...dates].sort(() => Math.random() - 0.5).slice(0, 5)

      for (const date of shuffled) {
        try {
          const res = await fetch(`/data/diary_${date}.json`)
          const diary = await res.json()
          const entries = diary.entries || []
          for (const e of entries) {
            if (
              ['paragraph', 'callout', 'quote'].includes(e.type) &&
              e.text.length > 20 &&
              e.text.length < 150 &&
              /[。！？\.\!\?]/.test(e.text)
            ) {
              collected.push({ date, text: e.text.trim() })
            }
          }
        } catch { /* skip */ }
      }

      if (collected.length >= 2) {
        // Pick 2-3 lines from different dates
        const pickCount = Math.min(3, collected.length)
        const picked: { date: string; text: string }[] = []
        const used = new Set<number>()
        while (picked.length < pickCount && used.size < collected.length) {
          let i: number
          do { i = Math.floor(Math.random() * collected.length) } while (used.has(i))
          used.add(i)
          picked.push(collected[i])
        }
        setOracle({
          date: picked.map(p => p.date).join(' · '),
          lines: picked.map(p => p.text),
        })
      } else {
        // Fallback to curated phrases
        const phrases = [...POETIC_PHRASES].sort(() => Math.random() - 0.5).slice(0, 3)
        setOracle({
          date: '—— 靜夜隨筆 · Nosae',
          lines: phrases,
        })
      }
    } catch {
      const phrases = [...POETIC_PHRASES].sort(() => Math.random() - 0.5).slice(0, 3)
      setOracle({
        date: '—— 靜夜隨筆 · Nosae',
        lines: phrases,
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isNightHour) {
      drawOracle()
      // Show with slight delay for entrance effect
      const timer = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(timer)
    }
  }, [isNightHour])

  // Don't render at all during daytime
  if (!isNightHour) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="max-w-lg mx-auto">
            {/* Night indicator */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent" />
              <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Moon className="w-4 h-4 text-indigo-400/70" />
              </motion.div>
              <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent" />
            </div>

            {/* Oracle card */}
            <div className="relative">
              {/* Subtle backdrop glow */}
              <div className="absolute -inset-4 bg-indigo-400/5 rounded-3xl blur-2xl" />

              <div className="relative px-7 py-6 rounded-2xl bg-gradient-to-br from-indigo-950/70 via-indigo-900/50 to-purple-950/70 backdrop-blur-md border border-indigo-400/15 shadow-lg shadow-indigo-900/20">
                {/* Decorative stars */}
                <div className="absolute top-3 right-4 flex gap-1">
                  {[1, 2, 3].map(i => (
                    <motion.span
                      key={i}
                      className="text-indigo-300/30 text-[8px]"
                      animate={{ opacity: [0.2, 0.6, 0.2] }}
                      transition={{ duration: 2 + i, repeat: Infinity, delay: i * 0.5 }}
                    >✦</motion.span>
                  ))}
                </div>

                {/* Header */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Sparkles className="w-4 h-4 text-indigo-300/60" />
                  </motion.div>
                  <span className="text-[11px] font-medium tracking-[0.2em] text-indigo-300/60 uppercase">
                    拂曉詩籤
                  </span>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  >
                    <Sparkles className="w-4 h-4 text-indigo-300/60" />
                  </motion.div>
                </div>

                {/* Content */}
                {loading ? (
                  <div className="space-y-2 py-2">
                    <div className="h-3 bg-indigo-400/10 rounded w-3/4 mx-auto animate-pulse" />
                    <div className="h-3 bg-indigo-400/10 rounded w-1/2 mx-auto animate-pulse" />
                    <div className="h-3 bg-indigo-400/10 rounded w-2/3 mx-auto animate-pulse" />
                  </div>
                ) : oracle ? (
                  <div className="text-center space-y-3 py-1">
                    {oracle.lines.map((line, i) => (
                      <motion.p
                        key={i}
                        className="text-sm text-indigo-100/80 leading-relaxed italic"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
                      >
                        「{line}」
                      </motion.p>
                    ))}
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <Wind className="w-3 h-3 text-indigo-300/30" />
                      <span className="text-[10px] text-indigo-300/40">{oracle.date}</span>
                      <Wind className="w-3 h-3 text-indigo-300/30" />
                    </div>
                  </div>
                ) : null}

                {/* Refresh button */}
                <div className="flex justify-center mt-3">
                  <button
                    onClick={drawOracle}
                    className="text-[10px] text-indigo-300/40 hover:text-indigo-300/70 transition-colors inline-flex items-center gap-1 py-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    換一籤
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
