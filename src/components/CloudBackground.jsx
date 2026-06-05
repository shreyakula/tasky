import { useEffect, useRef } from 'react'

const CloudBackground = ({ darkMode }) => {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -999, y: -999 })
  const itemsRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)

    if (darkMode) {
      itemsRef.current = [
        { type: 'moon', x: 120, y: 80, size: 55 },
        ...Array.from({ length: 80 }, () => ({
          type: 'star',
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 2.5 + 0.5,
          speedX: (Math.random() - 0.5) * 0.2,
          speedY: (Math.random() - 0.5) * 0.2,
          pulse: Math.random() * Math.PI * 2,
          opacity: Math.random() * 0.8 + 0.2,
        })),
        ...Array.from({ length: 5 }, (_, i) => ({
          type: 'cloud',
          x: Math.random() * window.innerWidth,
          y: 50 + Math.random() * 200,
          scale: 0.3 + Math.random() * 0.4,
          speed: 0.2 + Math.random() * 0.3,
          opacity: 0.08 + Math.random() * 0.08,
        })),
      ]
    } else {
      itemsRef.current = [
        { type: 'sun', x: 120, y: 90, size: 55, pulse: 0 },
        ...Array.from({ length: 12 }, (_, i) => ({
          type: 'cloud',
          x: Math.random() * window.innerWidth,
          y: 30 + Math.random() * 250,
          scale: 0.5 + Math.random() * 1.2,
          speed: 0.3 + Math.random() * 0.5,
          opacity: 0.7 + Math.random() * 0.3,
        })),
        ...Array.from({ length: 15 }, () => ({
          type: 'bubble',
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 18 + 6,
          speedX: (Math.random() - 0.5) * 0.4,
          speedY: -0.3 - Math.random() * 0.4,
          opacity: 0.15 + Math.random() * 0.2,
        })),
      ]
    }

    const drawCloud = (ctx, x, y, scale, opacity) => {
      ctx.save()
      ctx.globalAlpha = opacity
      ctx.fillStyle = darkMode ? 'rgba(100,120,180,1)' : 'white'
      ctx.shadowColor = darkMode ? 'rgba(100,120,200,0.3)' : 'rgba(200,230,255,0.8)'
      ctx.shadowBlur = 20
      ctx.translate(x, y)
      ctx.scale(scale, scale)
      ctx.beginPath()
      ctx.arc(0, 0, 40, 0, Math.PI * 2)
      ctx.arc(40, -10, 30, 0, Math.PI * 2)
      ctx.arc(80, 0, 35, 0, Math.PI * 2)
      ctx.arc(110, 10, 25, 0, Math.PI * 2)
      ctx.arc(-20, 10, 25, 0, Math.PI * 2)
      ctx.rect(-20, 10, 155, 40)
      ctx.fill()
      ctx.restore()
    }

    let animId
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const mouse = mouseRef.current

      itemsRef.current.forEach(item => {
        if (item.type === 'sun') {
          item.pulse += 0.02
          ctx.save()
          const glow = 15 + Math.sin(item.pulse) * 5
          const gradient = ctx.createRadialGradient(item.x, item.y, item.size * 0.3, item.x, item.y, item.size + glow)
          gradient.addColorStop(0, 'rgba(255,220,50,0.9)')
          gradient.addColorStop(0.5, 'rgba(255,180,30,0.4)')
          gradient.addColorStop(1, 'rgba(255,150,0,0)')
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(item.x, item.y, item.size + glow, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#FFD700'
          ctx.shadowColor = '#FFD700'
          ctx.shadowBlur = 30
          ctx.beginPath()
          ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }

        if (item.type === 'moon') {
          ctx.save()
          ctx.fillStyle = '#fffbe6'
          ctx.shadowColor = '#ffe066'
          ctx.shadowBlur = 40
          ctx.beginPath()
          ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#1a1a3e'
          ctx.shadowBlur = 0
          ctx.beginPath()
          ctx.arc(item.x + 18, item.y - 10, item.size * 0.82, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }

        if (item.type === 'star') {
          item.pulse += 0.04
          item.opacity = 0.3 + Math.sin(item.pulse) * 0.5

          const dx = item.x - mouse.x
          const dy = item.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            const force = (120 - dist) / 120
            item.x += (dx / dist) * force * 4
            item.y += (dy / dist) * force * 4
          }

          item.x += item.speedX
          item.y += item.speedY
          if (item.x < 0) item.x = canvas.width
          if (item.x > canvas.width) item.x = 0
          if (item.y < 0) item.y = canvas.height
          if (item.y > canvas.height) item.y = 0

          ctx.save()
          ctx.globalAlpha = Math.max(0, Math.min(1, item.opacity))
          ctx.fillStyle = '#ffe066'
          ctx.shadowColor = '#ffe066'
          ctx.shadowBlur = 6
          const r = item.size
          const cx = item.x
          const cy = item.y
          ctx.beginPath()
          ctx.moveTo(cx, cy - r * 2.5)
          ctx.lineTo(cx + r * 0.5, cy - r * 0.5)
          ctx.lineTo(cx + r * 2.5, cy)
          ctx.lineTo(cx + r * 0.5, cy + r * 0.5)
          ctx.lineTo(cx, cy + r * 2.5)
          ctx.lineTo(cx - r * 0.5, cy + r * 0.5)
          ctx.lineTo(cx - r * 2.5, cy)
          ctx.lineTo(cx - r * 0.5, cy - r * 0.5)
          ctx.closePath()
          ctx.fill()
          ctx.restore()
        }

        if (item.type === 'cloud') {
          item.x += item.speed
          if (item.x > canvas.width + 300) item.x = -300
          drawCloud(ctx, item.x, item.y, item.scale, item.opacity)
        }

        if (item.type === 'bubble') {
          const dx = item.x - mouse.x
          const dy = item.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            const force = (100 - dist) / 100
            item.x += (dx / dist) * force * 3
            item.y += (dy / dist) * force * 3
          }

          item.x += item.speedX
          item.y += item.speedY
          if (item.y < -30) {
            item.y = canvas.height + 30
            item.x = Math.random() * canvas.width
          }

          ctx.save()
          ctx.globalAlpha = item.opacity
          ctx.strokeStyle = 'rgba(147,197,253,0.8)'
          ctx.lineWidth = 1.5
          ctx.shadowColor = 'rgba(147,197,253,0.5)'
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2)
          ctx.stroke()
          const highlight = ctx.createRadialGradient(
            item.x - item.size * 0.3, item.y - item.size * 0.3, 0,
            item.x, item.y, item.size
          )
          highlight.addColorStop(0, 'rgba(255,255,255,0.3)')
          highlight.addColorStop(1, 'rgba(147,197,253,0.05)')
          ctx.fillStyle = highlight
          ctx.beginPath()
          ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      })

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [darkMode])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

export default CloudBackground
