'use client'

import { useEffect, useRef, useCallback } from 'react'

/**
 * PetalTouch — マウスに追従する桜の花びら
 *
 * ユーザーがマウスを動かすと、カーソルの跡から
 * 微かに桜の花びらが舞い落ちるエフェクト。
 * 静かなインタラクションで「生きている」感覚を演出。
 */
export default function PetalTouch() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<{ x: number; y: number; size: number; rotation: number; speed: number; opacity: number; life: number }[]>([])
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const lastEmitRef = useRef(0)

  const emitParticle = useCallback((x: number, y: number) => {
    const now = Date.now()
    if (now - lastEmitRef.current < 80) return
    lastEmitRef.current = now

    particlesRef.current.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      size: 3 + Math.random() * 5,
      rotation: Math.random() * 360,
      speed: 0.2 + Math.random() * 0.4,
      opacity: 0.3 + Math.random() * 0.4,
      life: 1,
    })

    if (particlesRef.current.length > 60) {
      particlesRef.current = particlesRef.current.slice(-60)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      emitParticle(e.clientX, e.clientY)
    }
    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        mouseRef.current = { x: touch.clientX, y: touch.clientY }
        emitParticle(touch.clientX, touch.clientY)
      }
    }

    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('touchmove', handleTouch)

    const animate = () => {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

      const particles = particlesRef.current
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.y += p.speed
        p.rotation += 1.2
        p.life -= 0.012
        p.opacity *= 0.99

        if (p.life <= 0 || p.opacity < 0.02) {
          particles.splice(i, 1)
          continue
        }

        ctx!.save()
        ctx!.translate(p.x, p.y)
        ctx!.rotate((p.rotation * Math.PI) / 180)
        ctx!.globalAlpha = p.opacity * 0.6

        // 花びらの形
        ctx!.beginPath()
        ctx!.ellipse(0, 0, p.size / 2, p.size, 0, 0, Math.PI * 2)
        ctx!.fillStyle = 'rgba(244, 114, 182, 0.6)'
        ctx!.fill()

        // 中心のピンクを少し強く
        ctx!.beginPath()
        ctx!.ellipse(0, 0, p.size / 3, p.size * 0.6, 0, 0, Math.PI * 2)
        ctx!.fillStyle = 'rgba(236, 72, 153, 0.3)'
        ctx!.fill()

        ctx!.restore()
      }

      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('touchmove', handleTouch)
    }
  }, [emitParticle])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      aria-hidden="true"
    />
  )
}
