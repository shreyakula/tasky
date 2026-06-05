import { useEffect, useRef } from 'react'

const Sparkles = ({ darkMode }) => {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -999, y: -999 })
  const sparklesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const count = 60
    sparklesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random(),
      pulse: Math.random() * Math.PI * 2,
    }))

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)

    let animId
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const mouse = mouseRef.current

      sparklesRef.current.forEach(s => {
        s.pulse += 0.03
        s.opacity = 0.4 + Math.sin(s.pulse) * 0.4

        const dx = s.x - mouse.x
        const dy = s.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 100) {
          const force = (100 - dist) / 100
          s.x += (dx / dist) * force * 3
          s.y += (dy / dist) * force * 3
        }

        s.x += s.speedX
        s.y += s.speedY

        if (s.x < 0) s.x = canvas.width
        if (s.x > canvas.width) s.x = 0
        if (s.y < 0) s.y = canvas.height
        if (s.y > canvas.height) s.y = 0

        ctx.save()
        ctx.globalAlpha = s.opacity
        ctx.fillStyle = darkMode ? '#ffe066' : '#ffd700'
        ctx.shadowColor = darkMode ? '#ffe066' : '#ffd700'
        ctx.shadowBlur = 8

        const x = s.x
        const y = s.y
        const r = s.size
        ctx.beginPath()
        ctx.moveTo(x, y - r * 2)
        ctx.lineTo(x + r * 0.5, y - r * 0.5)
        ctx.lineTo(x + r * 2, y)
        ctx.lineTo(x + r * 0.5, y + r * 0.5)
        ctx.lineTo(x, y + r * 2)
        ctx.lineTo(x - r * 0.5, y + r * 0.5)
        ctx.lineTo(x - r * 2, y)
        ctx.lineTo(x - r * 0.5, y - r * 0.5)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
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

export default Sparkles
