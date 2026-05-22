'use client'

import { useEffect, useRef } from 'react'

/**
 * 🌊 深海發光浮游生物 (Bioluminescence)
 * 全站背景：微弱的發光粒子在海中緩緩漂浮
 * 
 * 只在頁面載入後啟動，透過 Canvas 實現極低效能開銷
 */

interface Particle {
  x: number
  y: number
  size: number
  opacity: number
  speedX: number
  speedY: number
  hue: number
  phase: number
}

export default function Bioluminescence() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let isDark = document.documentElement.classList.contains('dark')
    // 監聽 dark mode 變化
    const observer = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains('dark')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // 初始化粒子 — 數量依螢幕大小調整
    const count = Math.min(Math.floor(window.innerWidth / 30), 35)
    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 2.5,
        opacity: 0.1 + Math.random() * 0.25,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.15,
        hue: isDark 
          ? 260 + Math.random() * 40   // 暗色模式：紫色調
          : 190 + Math.random() * 30,   // 淺色模式：青藍調
        phase: Math.random() * Math.PI * 2,
      })
    }
    particlesRef.current = particles

    let frame = 0
    const animate = () => {
      frame++
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

      for (const p of particles) {
        // 呼吸閃爍
        const breathe = 0.5 + 0.5 * Math.sin(frame * 0.02 + p.phase)
        const currentOpacity = p.opacity * breathe

        // 移動
        p.x += p.speedX
        p.y += p.speedY

        // 邊界循環
        if (p.x < -10) p.x = canvas!.width + 10
        if (p.x > canvas!.width + 10) p.x = -10
        if (p.y < -10) p.y = canvas!.height + 10
        if (p.y > canvas!.height + 10) p.y = -10

        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)

        // 發光光暈
        const glow = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
        const baseColor = isDark 
          ? `hsla(${p.hue}, 70%, 70%, ${currentOpacity * 0.12})`
          : `hsla(${p.hue}, 80%, 75%, ${currentOpacity * 0.15})`
        const coreColor = isDark
          ? `hsla(${p.hue}, 60%, 85%, ${currentOpacity * 0.5})`
          : `hsla(${p.hue}, 70%, 90%, ${currentOpacity * 0.6})`
        glow.addColorStop(0, coreColor)
        glow.addColorStop(0.3, baseColor)
        glow.addColorStop(1, 'transparent')
        ctx!.fillStyle = glow
        ctx!.fill()
      }

      rafRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  )
}
