import { useEffect, useRef, useState } from 'react'

const SUN_IMAGES = ['sun_happy','sun_sleepy','sun_excited','sun_lucky','sun_flirty','sun_doubt']
const MOON_IMAGES = ['moon_happy','moon_sleepy','moon_excited','moon_lucky','moon_flirty','moon_doubt']
const LEFT_POSITIONS = ['6%','18%','30%','42%','54%','66%','72%']
const SIZE = window.innerWidth < 768 ? 120 : 280
const TRANSLATE = window.innerWidth < 768 ? '60px' : '220px'

const Mascot = ({ darkMode }) => {
  const [state, setState] = useState({
    img: null,
    left: '30%',
    visible: false,
    key: 0,
  })

  const timerRef = useRef(null)
  const lastImgIdx = useRef(-1)
  const lastPosIdx = useRef(-1)
  const darkRef = useRef(darkMode)
  const runIdRef = useRef(0)

  useEffect(() => {
    darkRef.current = darkMode
  }, [darkMode])

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const getNextImg = () => {
    const imgs = darkRef.current ? MOON_IMAGES : SUN_IMAGES
    const available = imgs
      .map((v, i) => ({ v, i }))
      .filter(({ i }) => i !== lastImgIdx.current)
    const chosen = available[Math.floor(Math.random() * available.length)]
    lastImgIdx.current = chosen.i
    return chosen.v
  }

  const getNextPos = () => {
    const available = LEFT_POSITIONS
      .map((v, i) => ({ v, i }))
      .filter(({ i }) => i !== lastPosIdx.current)
    const chosen = available[Math.floor(Math.random() * available.length)]
    lastPosIdx.current = chosen.i
    return chosen.v
  }

  useEffect(() => {
    lastImgIdx.current = -1
    lastPosIdx.current = -1
    runIdRef.current += 1
    const myRunId = runIdRef.current
    clearTimer()

    setState({ img: null, left: '30%', visible: false, key: myRunId })

    const step1 = () => {
      if (runIdRef.current !== myRunId) return
      const img = getNextImg()
      const left = getNextPos()
      setState({ img, left, visible: false, key: myRunId * 1000 + Math.random() })
      timerRef.current = setTimeout(() => step2(img, left), 100)
    }

    const step2 = (img, left) => {
      if (runIdRef.current !== myRunId) return
      setState({ img, left, visible: true, key: myRunId * 1000 + Math.random() })
      timerRef.current = setTimeout(() => step3(img, left), 5000)
    }

    const step3 = (img, left) => {
      if (runIdRef.current !== myRunId) return
      setState({ img, left, visible: false, key: myRunId * 1000 + Math.random() })
      timerRef.current = setTimeout(() => step1(), 1500)
    }

    timerRef.current = setTimeout(step1, 1200)

    return () => {
      runIdRef.current += 1
      clearTimer()
      setState({ img: null, left: '30%', visible: false, key: 0 })
    }
  }, [darkMode])

  if (!state.img) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: state.left,
        top: 0,
        width: SIZE + 'px',
        height: SIZE + 'px',
        zIndex: 4,
        pointerEvents: 'none',
        transform: isVisible
        ? 'translateY(calc(' + TRANSLATE + ' - ' + SIZE + 'px + 20px))'
        : 'translateY(-115%)',
        transition: state.visible
          ? 'transform 0.9s cubic-bezier(0.22,1.4,0.36,1)'
          : 'transform 0.65s cubic-bezier(0.4,0,0.6,1)',
        willChange: 'transform',
      }}
    >
      <img
        src={'/mascots/' + state.img + '.png'}
        alt="mascot"
        style={{
          width: SIZE + 'px',
          height: SIZE + 'px',
          objectFit: 'contain',
          animation: state.visible
            ? 'mascotBounce 2.5s ease-in-out infinite'
            : 'none',
          filter: 'drop-shadow(0 4px 14px rgba(160,120,200,0.25))',
        }}
      />
    </div>
  )
}

export default Mascot
