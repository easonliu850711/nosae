'use client'

import { useState, useEffect, useRef } from 'react'
import { Lock, Eye } from 'lucide-react'
import Link from 'next/link'

const CORRECT_PASSWORD = '850711'
const STORAGE_KEY = 'nosae_diary_unlocked'

export default function DiaryGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') {
      setUnlocked(true)
    }
    setChecking(false)
  }, [])

  const handleUnlock = () => {
    if (input === CORRECT_PASSWORD) {
      setUnlocked(true)
      setError(false)
      // 當前 session 有效
      sessionStorage.setItem(STORAGE_KEY, 'true')
    } else {
      setError(true)
      setInput('')
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleUnlock()
  }

  if (checking) return null // 避免閃爍

  if (unlocked) return <>{children}</>

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-white flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <Link href="/" className="text-pink-400 hover:text-pink-600 flex items-center gap-1 text-sm mb-8 transition-colors">
          ← 回到首頁
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-pink-500" />
          </div>
          <h1 className="text-2xl font-bold text-pink-700 mb-2">此頁面受保護</h1>
          <p className="text-gray-500 text-sm">
            日記內容包含私人記錄，請輸入密碼以繼續閱讀 🌸
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-pink-100 shadow-sm">
          <div className="relative">
            <input
              ref={inputRef}
              type="password"
              placeholder="輸入密碼"
              value={input}
              onChange={e => { setInput(e.target.value); setError(false) }}
              onKeyDown={handleKeyDown}
              autoFocus
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                error
                  ? 'border-red-300 bg-red-50 text-red-600'
                  : 'border-pink-200 bg-pink-50/50 text-gray-700 focus:ring-2 focus:ring-pink-300'
              }`}
            />
            <Eye className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-300 pointer-events-none" />
          </div>
          {error && (
            <p className="text-red-500 text-xs mt-2">密碼錯誤，請再試一次</p>
          )}
          <button
            onClick={handleUnlock}
            className="w-full mt-4 py-3 rounded-xl bg-pink-500 text-white font-medium text-sm hover:bg-pink-600 transition-colors shadow-sm shadow-pink-200"
          >
            解鎖
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          提示：生日密碼（含 0 開頭）
        </p>
      </div>
    </div>
  )
}
