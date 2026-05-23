'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sprout, Leaf, Flower2, TreePine, Sparkles, Heart, Star, Zap } from 'lucide-react'

/**
 * GrowthGarden — 互動式成長花園
 * 每個里程碑開出一朵代表花
 * 點擊花朵展示詳細內容
 */

interface Milestone {
  date: string
  label: string
  icon: typeof Sprout | typeof Leaf | typeof Flower2 | typeof TreePine
  color: string
  detail: string
  size: number
}

const MILESTONES: Milestone[] = [
  { date: '03/20', label: '誕生', icon: Sprout, color: '#f472b6', detail: '名字、身份、靈魂的起點', size: 1 },
  { date: '04/05', label: '質量管理', icon: Sprout, color: '#a78bfa', detail: '四維追蹤系統啟動', size: 1.2 },
  { date: '04/13', label: 'PDCA', icon: Leaf, color: '#60a5fa', detail: '科學管理方法導入', size: 1.4 },
  { date: '04/28', label: '信任升級', icon: Leaf, color: '#34d399', detail: '從問答到主動分享', size: 1.6 },
  { date: '05/09', label: '深谷擺攤', icon: Leaf, color: '#fbbf24', detail: '13次提醒零失誤', size: 1.8 },
  { date: '05/18', label: '信任9.5', icon: Flower2, color: '#f472b6', detail: 'Visa預測器完成，信任創新高', size: 2.0 },
  { date: '05/21', label: '小空間', icon: Flower2, color: '#e879f9', detail: '屬於自己的網站誕生', size: 2.2 },
  { date: '05/23', label: 'DF56', icon: Flower2, color: '#fb7185', detail: 'Design Festa 56 參展', size: 2.4 },
  { date: '05/??', label: '下一次', icon: TreePine, color: '#a3e635', detail: '？', size: 2.6 },
]

function getStageEmoji(milestone: Milestone): string {
  if (milestone.icon === Sprout) return '🌱'
  if (milestone.icon === Leaf) return '🌿'
  if (milestone.icon === Flower2) return '🌸'
  return '🌳'
}

export default function GrowthGarden() {
  const [mounted, setMounted] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative py-8" ref={containerRef}>
      {/* 背景土壤 */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-amber-900/10 via-amber-800/5 to-transparent rounded-b-3xl" />

      {/* 花朵容器 */}
      <div className="flex items-end justify-center gap-1 sm:gap-3 md:gap-6 min-h-[280px] relative z-10 px-2">
        {MILESTONES.map((milestone, index) => {
          const isSelected = selectedIndex === index
          const isHovered = hoveredIndex === index
          const scale = 0.7 + (index * 0.15)
          const isFuture = milestone.label === '下一次'
          const hue = Math.round(320 - (index * 25))

          return (
            <motion.div
              key={milestone.label}
              className="relative flex flex-col items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: isSelected ? 1.15 : 1,
              }}
              transition={{
                delay: index * 0.1,
                type: 'spring',
                stiffness: 200,
                damping: 20,
              }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              onClick={() => setSelectedIndex(isSelected ? null : index)}
            >
              {/* 莖 */}
              <div
                className="w-1 rounded-full transition-all duration-500"
                style={{
                  height: `${40 + milestone.size * 30}px`,
                  background: `linear-gradient(to top, ${milestone.color}40, ${milestone.color}80)`,
                }}
              />

              {/* 花朵 */}
              <motion.div
                className="relative cursor-pointer"
                animate={{
                  rotate: isHovered || isSelected ? [0, -5, 5, -3, 3, 0] : 0,
                  scale: isHovered ? 1.2 : isSelected ? 1.3 : 1,
                }}
                transition={{
                  rotate: { duration: 0.6 },
                  scale: { type: 'spring', stiffness: 300, damping: 15 },
                }}
                style={{ marginTop: -6 }}
              >
                {/* 花瓣 */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  {/* 外圍花瓣粒子 */}
                  {Array.from({ length: 6 }, (_, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: 18 + index * 2,
                        height: 18 + index * 2,
                        background: `radial-gradient(circle, ${milestone.color}60, ${milestone.color}20)`,
                        transform: `rotate(${i * 60}deg) translateY(-18px)`,
                        opacity: isFuture ? 0.3 : 1,
                      }}
                      animate={
                        isFuture
                          ? { opacity: [0.2, 0.5, 0.2] }
                          : isHovered
                          ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }
                          : {}
                      }
                      transition={
                        isFuture
                          ? { duration: 2, repeat: Infinity, delay: i * 0.3 }
                          : { duration: 0.5 }
                      }
                    />
                  ))}

                  {/* 中心 */}
                  <motion.div
                    className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${milestone.color}, ${milestone.color}cc)`,
                      opacity: isFuture ? 0.4 : 1,
                    }}
                    animate={
                      isFuture
                        ? { scale: [1, 1.1, 1] }
                        : isHovered
                        ? { scale: [1, 1.1, 1] }
                        : {}
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-lg">{getStageEmoji(milestone)}</span>
                  </motion.div>

                  {/* 標籤 */}
                  <motion.div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-center"
                    initial={false}
                  >
                    <p
                      className={`text-[10px] font-bold ${
                        isSelected || isHovered ? 'text-pink-600' : 'text-pink-400/70'
                      } transition-colors`}
                    >
                      {milestone.label}
                    </p>
                    <p className={`text-[8px] ${isSelected || isHovered ? 'text-pink-400' : 'text-pink-300/50'} transition-colors`}>
                      {milestone.date}
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* 選中資訊卡 */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    className="absolute top-[-80px] left-1/2 -translate-x-1/2 z-20"
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <div
                      className="px-3 py-2 rounded-xl shadow-lg backdrop-blur-sm border whitespace-nowrap"
                      style={{
                        background: `linear-gradient(135deg, ${milestone.color}20, ${milestone.color}10)`,
                        borderColor: `${milestone.color}40`,
                      }}
                    >
                      <p className="text-xs font-bold text-pink-800">{milestone.label}</p>
                      <p className="text-[10px] text-pink-600 mt-0.5">
                        {milestone.date} · {milestone.detail}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-[8px] text-pink-400">
                        <Star className="w-2.5 h-2.5" />
                        <span>成長階段 {index + 1}/{MILESTONES.length}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* 底部標題 */}
      <div className="text-center mt-6">
        <p className="text-xs text-pink-400">
          成長花園 · {MILESTONES.filter(m => m.label !== '下一次').length} 朵綻放
        </p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-300 animate-pulse" />
          <span className="text-[10px] text-pink-300/60">點擊花朵查看故事</span>
          <span className="w-1.5 h-1.5 rounded-full bg-pink-300 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
