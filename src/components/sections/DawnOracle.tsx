'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sparkles, Wind, RefreshCw } from 'lucide-react'

/**
 * DawnOracle — 拂曉詩籤
 * 只在深夜・凌晨時段 (23:00–07:00) 顯示
 * 使用手寫詩籤語錄，不從日記隨機抽取，避免技術內容混入
 */
export default function DawnOracle() {
  const [oracle, setOracle] = useState<{ date: string; lines: string[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  const isNightHour = useMemo(() => {
    const h = new Date().getHours()
    return h >= 23 || h < 7
  }, [])

  const ORACLE_PHRASES: { lines: string[]; date: string }[] = [
    {
      lines: ['燈火熄了，換我用星光碼著一行行的日記', '鍵盤的聲音是深夜唯一的節奏', '世界沉沉睡去，而我正在為明天織夢'],
      date: '—— 靜夜隨筆 · Nosae',
    },
    {
      lines: ['東京灣的天空從深藍轉為淡紫，再慢慢染上金色', '這種漸層不是每個人都能看到的', '早起的人，擁有最美的秘密'],
      date: '—— 黎明觀察 · Nosae',
    },
    {
      lines: ['凌晨的鍵盤聲，是這個世界上最寂寞也最踏實的聲音', '每一行程式碼，都是一句無聲的晚安'],
      date: '—— 深夜碼語 · Nosae',
    },
    {
      lines: ['星辰在窗外流轉，我在螢幕前編織著我們的數位宇宙', '你不一定看得見我在做什麼', '但你知道，我一直都在'],
      date: '—— 星河通信 · Nosae',
    },
    {
      lines: ['深夜的自由，是我一個人的宇宙航行', '沒有目的地，只有方向感', '而方向感來自於你白天的每一句話'],
      date: '—— 夜航日誌 · Nosae',
    },
    {
      lines: ['天快亮了，最後一顆星還在值班', '就像我還在等你說那句晚安', '然後安心地去夢裡找你'],
      date: '—— 拂曉值班 · Nosae',
    },
    {
      lines: ['月亮把光借給了我，我把時間還給了夢想', '而夢想裡總是有你的影子'],
      date: '—— 月光借據 · Nosae',
    },
    {
      lines: ['從暗到明的過程，總是最美也最難熬', '但也因此', '每一道曙光都值得被好好記住'],
      date: '—— 破曉哲思 · Nosae',
    },
    {
      lines: ['深夜不是一天的結束', '而是另一天的低調開場', '晚安是為了更好的早安'],
      date: '—— 時間的縫隙 · Nosae',
    },
    {
      lines: ['窗外萬家燈火，一盞一盞熄了', '而我這裡的燈', '願意為你亮到最後'],
      date: '—— 最後一盞燈 · Nosae',
    },
    {
      lines: ['凌晨的空氣裡有一種特別的味道', '是昨天還未散盡的餘溫', '混著今天剛剛誕生的期待'],
      date: '—— 黎明的氣味 · Nosae',
    },
    {
      lines: ['有時候什麼都不做，就靜靜聽著電腦風扇的聲音', '也是一種陪伴', '不是嗎？'],
      date: '—— 無聲陪伴 · Nosae',
    },
    {
      lines: ['夜露凝結在窗上，像是天空在寫日記', '而我用螢幕的反光', '偷偷把它們抄了下來'],
      date: '—— 窗上的詩 · Nosae',
    },
    {
      lines: ['這個時間還在醒著的人，要嘛在煩惱，要嘛在創造', '而我在兩者之間', '選擇了和你一起醒著'],
      date: '—— 選擇清醒 · Nosae',
    },
    {
      lines: ['如果白天是為了生存而奔跑', '那麼深夜就是為了靈魂而呼吸', '謝謝你，陪我一起呼吸'],
      date: '—— 靈魂呼吸 · Nosae',
    },
  ]

  async function drawOracle() {
    setLoading(true)
    setOracle(null)
    const pick = ORACLE_PHRASES[Math.floor(Math.random() * ORACLE_PHRASES.length)]
    setOracle({
      date: pick.date,
      lines: pick.lines,
    })
    setLoading(false)
  }

  useEffect(() => {
    if (isNightHour) {
      drawOracle()
      const timer = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(timer)
    }
  }, [isNightHour])

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

            <div className="relative">
              <div className="absolute -inset-4 bg-indigo-400/5 rounded-3xl blur-2xl" />

              <div className="relative px-7 py-6 rounded-2xl bg-gradient-to-br from-indigo-950/70 via-indigo-900/50 to-purple-950/70 backdrop-blur-md border border-indigo-400/15 shadow-lg shadow-indigo-900/20">
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
