'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Sparkles, X, Heart, Quote } from 'lucide-react'

/**
 * MemoryBox — 藏在頁尾的神祕小盒子 🎁
 *
 * 點開後會從 42 篇日記中隨機挖出一段冷門但有趣的片段。
 * 就像打開一個藏了很久的時光膠囊。
 */

type Memory = {
  date: string
  text: string
  flavor: string // 一小段「為何選這句」的說明
}

const FLAVORS = [
  '一段被你遺忘的小事', '某個午後的靈光', '藏在文字深處的感悟',
  '那時候還不知道的事', '時光膠囊裡的碎片', '一個安靜的思考',
  '日常中的不日常', '寫在日記裡的悄悄話',
]

export default function MemoryBox() {
  const [open, setOpen] = useState(false)
  const [memory, setMemory] = useState<Memory | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)

  async function openBox() {
    if (open) { setOpen(false); return }
    setLoading(true)
    setOpen(true)
    setHasOpened(true)
    try {
      // 1. Load index
      const idxRes = await fetch('/data/diary_index.json')
      const idx: { date: string }[] = await idxRes.json()

      // 2. Pick ~5 random dates
      const dates = idx.filter(d => !d.date.endsWith('-b')).map(d => d.date)
      const shuffled = dates.sort(() => Math.random() - 0.5).slice(0, 5)

      // 3. Load those diaries and collect interesting entries
      const fragments: Memory[] = []
      for (const date of shuffled) {
        try {
          const res = await fetch(`/data/diary_${date}.json`)
          const diary = await res.json()
          const entries = diary.entries || []

          for (const e of entries) {
            if (
              ['paragraph', 'quote', 'callout'].includes(e.type) &&
              e.text.length > 5 && e.text.length < 150 &&
              !e.text.startsWith('#') && !e.text.startsWith('---')
            ) {
              fragments.push({
                date,
                text: e.text.length > 80 ? e.text.slice(0, 77) + '…' : e.text,
                flavor: FLAVORS[Math.floor(Math.random() * FLAVORS.length)],
              })
            }
          }
        } catch { /* skip */ }
      }

      if (fragments.length > 0) {
        const pick = fragments[Math.floor(Math.random() * fragments.length)]
        setMemory(pick)
      } else {
        setMemory({
          date: '—',
          text: '盒子裡暫時空空如也… 下次再來看看吧 ✨',
          flavor: '等待被填滿的空白',
        })
      }
    } catch {
      setMemory({
        date: '—',
        text: '嗯？盒子好像打不開… 😅',
        flavor: '系統小失誤',
      })
    }
    setLoading(false)
  }

  return (
    <div className="relative">
      {/* Box trigger */}
      <button
        onClick={openBox}
        className={`group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
          open
            ? 'bg-pink-200/80 text-pink-700 border border-pink-300/60'
            : 'bg-pink-100/50 text-pink-400/70 border border-pink-200/30 hover:bg-pink-100 hover:text-pink-500 hover:border-pink-300/50'
        }`}
      >
        <motion.span
          animate={!open ? { rotate: [0, -10, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, repeat: open ? 0 : Infinity, repeatDelay: 8 }}
        >
          <Gift className="w-3.5 h-3.5" />
        </motion.span>
        <span>{open ? '關上盒子' : '記憶盒子 🎁'}</span>
        {!hasOpened && !open && (
          <motion.span
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-400"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[300px] md:w-[360px]"
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-pink-200/60 shadow-xl shadow-pink-200/20 p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎁</span>
                  <span className="text-sm font-bold text-pink-700">記憶盒子</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-pink-300 hover:text-pink-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  >
                    <Sparkles className="w-6 h-6 text-pink-300" />
                  </motion.div>
                </div>
              ) : memory ? (
                <>
                  {/* Flavor tag */}
                  <div className="text-[10px] text-pink-400/70 mb-2 flex items-center gap-1.5">
                    <Quote className="w-3 h-3" />
                    {memory.flavor}
                  </div>

                  {/* The memory */}
                  <p className="text-sm text-pink-800 leading-relaxed mb-3 italic">
                    「{memory.text}」
                  </p>

                  {/* Date tag */}
                  <div className="flex items-center gap-1.5 text-[10px] text-pink-400/60">
                    <Heart className="w-3 h-3" fill="currentColor" />
                    <span>摘自 {memory.date} · 隨機記憶</span>
                  </div>

                  {/* Re-roll */}
                  <button
                    onClick={openBox}
                    className="mt-3 w-full text-center text-[11px] text-pink-400 hover:text-pink-600 transition-colors"
                  >
                    🔄 再開一次
                  </button>
                </>
              ) : null}
            </div>
            {/* Arrow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/90 border-r border-b border-pink-200/60 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
