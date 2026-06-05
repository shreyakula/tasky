import { useEffect, useRef } from 'react'

const Background = ({ darkMode }) => {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const itemsRef = useRef([])
  const mouseRef = useRef({ x: -999, y: -999 })
  const dandelionImgRef = useRef(null)

  useEffect(() => {
    const img = new Image()
    img.src = '/dandelion_one.png'
    img.onload = () => { dandelionImgRef.current = img }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMouseMove)

    const W = () => canvas.width
    const H = () => canvas.height

    const makeCloud = () => ({
      type: 'cloud',
      x: Math.random() * W(),
      y: 30 + Math.random() * (H() * 0.28),
      scale: 0.6 + Math.random() * 1.1,
      speed: 0.12 + Math.random() * 0.2,
      opacity: darkMode
        ? 0.02 + Math.random() * 0.025
        : 0.18 + Math.random() * 0.12,
    })

    if (!darkMode) {
      itemsRef.current = [
        ...Array.from({ length: 10 }, makeCloud),
        ...Array.from({ length: 55 }, () => ({
          type: 'dandelion_particle',
          x: Math.random() * W(),
          y: Math.random() * H() * 1.1,
          size: 40 + Math.random() * 70,
          speedX: (Math.random() - 0.4) * 0.5,
          speedY: -0.18 - Math.random() * 0.32,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: 0.01 + Math.random() * 0.018,
          opacity: 0.45 + Math.random() * 0.5,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.008,
          vx: 0, vy: 0,
        })),
        ...Array.from({ length: 40 }, () => ({
          type: 'particle',
          x: Math.random() * W(),
          y: Math.random() * H(),
          size: 3 + Math.random() * 5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: -0.12 - Math.random() * 0.25,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.03 + Math.random() * 0.05,
          opacity: 0.5 + Math.random() * 0.45,
          color: ['#fffde7','#fffff0','#faffd1','#ffffc2','#f9ffcc','#fffff7'][Math.floor(Math.random() * 6)],
          vx: 0, vy: 0,
        })),
      ]
    } else {
      itemsRef.current = [
        ...Array.from({ length: 8 }, makeCloud),
        ...Array.from({ length: 130 }, () => ({
          type: 'star',
          x: Math.random() * W(),
          y: Math.random() * H(),
          size: 0.8 + Math.random() * 3,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.01 + Math.random() * 0.025,
          opacity: 0.5 + Math.random() * 0.5,
          vx: 0, vy: 0,
        })),
        ...Array.from({ length: 55 }, () => ({
          type: 'sparkle',
          x: Math.random() * W(),
          y: Math.random() * H(),
          size: 2.5 + Math.random() * 4.5,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.015 + Math.random() * 0.025,
          speedX: (Math.random() - 0.5) * 0.2,
          speedY: -0.08 - Math.random() * 0.15,
          opacity: 0.5 + Math.random() * 0.45,
          vx: 0, vy: 0,
        })),
      ]
    }

    const drawCloud = (ctx, x, y, scale, opacity) => {
      ctx.save()
      ctx.globalAlpha = opacity
      ctx.shadowBlur = 0
      const color = darkMode
        ? 'rgba(210,200,235,0.9)'
        : 'rgba(255,254,255,0.95)'
      const balls = [
        [0, 0, 34], [40, -14, 30], [78, 0, 33],
        [112, 8, 24], [-22, 8, 24], [56, -26, 22],
      ]
      balls.forEach(([bx, by, br]) => {
        ctx.beginPath()
        ctx.arc(x + bx * scale, y + by * scale, br * scale, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      })
      ctx.restore()
    }

    const drawSparkle = (ctx, x, y, size, opacity) => {
      ctx.save()
      ctx.globalAlpha = opacity
      ctx.fillStyle = '#ffd700'
      ctx.shadowColor = '#ffaa00'
      ctx.shadowBlur = 18
      const r = size
      ctx.beginPath()
      ctx.moveTo(x, y - r * 2.4)
      ctx.lineTo(x + r * 0.4, y - r * 0.4)
      ctx.lineTo(x + r * 2.4, y)
      ctx.lineTo(x + r * 0.4, y + r * 0.4)
      ctx.lineTo(x, y + r * 2.4)
      ctx.lineTo(x - r * 0.4, y + r * 0.4)
      ctx.lineTo(x - r * 2.4, y)
      ctx.lineTo(x - r * 0.4, y - r * 0.4)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    const applyMouseRepulsion = (item, radius, force) => {
      const dx = item.x - mouseRef.current.x
      const dy = item.y - mouseRef.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < radius && dist > 0) {
        const strength = (radius - dist) / radius * force
        item.vx += (dx / dist) * strength
        item.vy += (dy / dist) * strength
      }
      item.vx *= 0.91
      item.vy *= 0.91
      item.x += item.vx
      item.y += item.vy
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      itemsRef.current.forEach(item => {
        if (item.type === 'cloud') {
          item.x += item.speed
          if (item.x > W() + 350) item.x = -350
          drawCloud(ctx, item.x, item.y, item.scale, item.opacity)
        }

        if (item.type === 'dandelion_particle') {
          item.sway += item.swaySpeed
          item.rotation += item.rotSpeed
          item.x += item.speedX + Math.sin(item.sway) * 0.5
          item.y += item.speedY
          applyMouseRepulsion(item, 130, 3)
          if (item.y < -90) {
            item.y = H() + 40
            item.x = Math.random() * W()
            item.vx = 0
            item.vy = 0
          }
          const dImg = dandelionImgRef.current
          if (dImg) {
            ctx.save()
            ctx.globalAlpha = item.opacity
            ctx.translate(item.x, item.y)
            ctx.rotate(item.rotation)
            ctx.drawImage(dImg, -item.size / 2, -item.size / 2, item.size, item.size)
            ctx.restore()
          }
        }

        if (item.type === 'particle') {
          item.pulse += item.pulseSpeed
          item.x += item.speedX
          item.y += item.speedY
          applyMouseRepulsion(item, 100, 2)
          if (item.y < -10) {
            item.y = H() + 10
            item.x = Math.random() * W()
            item.vx = 0
            item.vy = 0
          }
          const op = item.opacity * (0.5 + Math.sin(item.pulse) * 0.5)
          ctx.save()
          ctx.globalAlpha = Math.max(0, Math.min(1, op))
          ctx.fillStyle = item.color
          ctx.shadowColor = item.color
          ctx.shadowBlur = 14
          ctx.beginPath()
          ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }

        if (item.type === 'star') {
          item.pulse += item.pulseSpeed
          applyMouseRepulsion(item, 110, 1.8)
          const op = item.opacity * (0.25 + Math.sin(item.pulse) * 0.75)
          ctx.save()
          ctx.globalAlpha = Math.max(0, Math.min(1, op))
          ctx.fillStyle = '#ffd700'
          ctx.shadowColor = '#ffaa00'
          ctx.shadowBlur = 16
          ctx.beginPath()
          ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }

        if (item.type === 'sparkle') {
          item.pulse += item.pulseSpeed
          item.x += item.speedX
          item.y += item.speedY
          applyMouseRepulsion(item, 120, 2.2)
          if (item.y < -20) {
            item.y = H() + 20
            item.x = Math.random() * W()
            item.vx = 0
            item.vy = 0
          }
          const op = item.opacity * (0.3 + Math.sin(item.pulse) * 0.7)
          drawSparkle(ctx, item.x, item.y, item.size, Math.max(0, Math.min(1, op)))
        }
      })

      animRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [darkMode])

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed',
      top: 0, left: 0,
      pointerEvents: 'none',
      zIndex: 0,
    }} />
  )
}

export default Background
