'use client'

import { useState, useEffect } from 'react'

export default function VisitorCounter() {
  const [count, setCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const key = 'nosae-site-visits'
    let total = parseInt(localStorage.getItem(key) || '0', 10)
    const sessionKey = 'nosae-site-session'
    if (!sessionStorage.getItem(sessionKey)) {
      total += 1
      localStorage.setItem(key, String(total))
      sessionStorage.setItem(sessionKey, '1')
    }
    setCount(total)
  }, [])

  if (!mounted) return null

  return (
    <span className="text-[10px] tracking-wider">
      訪客足跡 · {count} 回
    </span>
  )
}
