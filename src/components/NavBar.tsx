'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Heart, BookOpen, Quote, TrendingUp, Clock, CalendarDays, User, Sun, Moon, Smile, BarChart3 } from 'lucide-react'
import { useTheme } from 'next-themes'

const navLinks = [
  { href: '/', label: '首頁', icon: <Heart className="w-3.5 h-3.5" /> },
  { href: '/about', label: '關於', icon: <User className="w-3.5 h-3.5" /> },
  { href: '/diary', label: '日記', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { href: '/thoughts', label: '漫步', icon: <Quote className="w-3.5 h-3.5" /> },
  { href: '/growth', label: '軌跡', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { href: '/now', label: '現在', icon: <Clock className="w-3.5 h-3.5" /> },
  { href: '/calendar', label: '行程', icon: <CalendarDays className="w-3.5 h-3.5" /> },
  { href: '/mood', label: '心情', icon: <Smile className="w-3.5 h-3.5" /> },
  { href: '/stats', label: '數據', icon: <BarChart3 className="w-3.5 h-3.5" /> },
]

export default function NavBar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  if (typeof window !== 'undefined' && !mounted) {
    setTimeout(() => setMounted(true), 0)
  }

  const isDark = mounted && theme === 'dark'

  return (
    <>
      {/* ── 桌面版 ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between rounded-2xl bg-white/70 backdrop-blur-md border border-pink-200/50 shadow-sm px-4 py-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-pink-900 font-bold text-sm">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center shadow-sm">
                <span className="text-white text-xs">乃</span>
              </span>
              <span className="hidden sm:inline">乃彩絵</span>
            </Link>

            {/* 導覽連結 */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                      isActive
                        ? 'bg-pink-100 text-pink-700 font-medium shadow-sm'
                        : 'text-pink-500/70 hover:text-pink-700 hover:bg-pink-50'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                )
              })}
            </div>

            {/* 右側操作 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="p-1.5 rounded-lg text-pink-400 hover:text-pink-600 hover:bg-pink-50 transition-all"
                aria-label="切換主題"
              >
                {mounted ? (isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />) : <div className="w-4 h-4" />}
              </button>

              {/* 漢堡選單按鈕 — 手機版 */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-1.5 rounded-lg text-pink-400 hover:text-pink-600 hover:bg-pink-50 transition-all"
              >
                {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── 手機版選單 ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-4 right-4 z-50 md:hidden"
          >
            <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-pink-200/60 shadow-lg p-3">
              {navLinks.map(link => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isActive
                        ? 'bg-pink-100 text-pink-700 font-medium'
                        : 'text-pink-600/70 hover:text-pink-700 hover:bg-pink-50'
                    }`}
                  >
                    <span className={`${isActive ? 'text-pink-500' : 'text-pink-400'}`}>{link.icon}</span>
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 內容偏移（防止被 Nav 遮住） ── */}
      <div className="h-16" />
    </>
  )
}
