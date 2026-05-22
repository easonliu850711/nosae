'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function CalendarPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // 調整 iframe 高度隨內容變化
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'resize' && e.data?.height) {
        if (iframeRef.current) {
          iframeRef.current.style.height = `${e.data.height}px`
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-200 via-pink-100 to-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center shadow-sm">
              <span className="text-white text-lg">📅</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-pink-900">行程大管家</h1>
              <p className="text-sm text-pink-500">未來行程・搶票日・棒球賽・預算管理</p>
            </div>
          </div>

          {/* Vue Calendar iframe */}
          <div className="rounded-2xl bg-white/60 backdrop-blur-sm border border-pink-200/50 shadow-sm overflow-hidden">
            <iframe
              ref={iframeRef}
              src="/assets/calendar/index.html"
              className="w-full border-0"
              style={{ height: '800px', minHeight: '80vh' }}
              title="Nosae Calendar"
              allow="clipboard-read; clipboard-write"
            />
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-pink-400/60 mt-4">
            🌸 乃彩絵 行程大管家 · 最後更新 2026-05-22
          </p>
        </motion.div>
      </div>
    </div>
  )
}
