import { useState, useRef, useEffect } from 'react'

const Chatbot = ({ events, darkMode, onAddEvent, onDeleteEvent }) => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your tasky assistant. I can add, update, or delete events, check your schedule, and answer questions about your availability!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getEventsContext = () => {
    const entries = Object.entries(events)
    if (entries.length === 0) return 'The user has no events scheduled.'
    return entries.map(([key, e]) => {
      const parts = key.split('-')
      const hour = parts[parts.length - 1]
      const dateStr = parts.slice(0, -1).join('-')
      return '- ' + dateStr + ' at ' + hour + ':00 -- ' + e.title + (e.category ? ' (' + e.category + ')' : '') + (e.location ? ' at ' + e.location : '') + (e.startTime ? ', ' + e.startTime + '-' + e.endTime : '')
    }).join('\n')
  }

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      const systemPrompt = 'You are a helpful cute calendar assistant for an app called tasky.\nCurrent user events:\n' + getEventsContext() + '\nToday is ' + new Date().toDateString() + '.\nTomorrow is ' + tomorrowStr + '.\n\nYou can perform these actions. ALWAYS put ACTION lines before your friendly message.\n\nTO ADD OR UPDATE AN EVENT:\nACTION:ADD|title|YYYY-MM-DD|startHH:00|endHH:00\n\nTO DELETE A SPECIFIC EVENT:\nACTION:DELETE|title|YYYY-MM-DD\n\nTO DELETE ALL EVENTS ON A DAY:\nACTION:DELETEDAY|YYYY-MM-DD\n\nRULES:\n- 24 hour time ONLY. 12pm=12:00 1pm=13:00 2pm=14:00 3pm=15:00 9am=09:00\n- Date format must be YYYY-MM-DD exactly\n- For multiple actions put each ACTION on its own line first\n- Never make up events not in the list\n\nIf just answering a question with no changes respond normally without any ACTION line.\nBe concise friendly and cute. Use occasional emojis.'

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + import.meta.env.VITE_GROQ_API_KEY,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 800,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMsg }
          ]
        })
      })

      const data = await response.json()
      const fullReply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || 'Sorry I could not process that!'
      const lines = fullReply.split('\n')
      const actionLines = lines.filter(l => l.trim().startsWith('ACTION:'))
      const friendlyLines = lines.filter(l => !l.trim().startsWith('ACTION:'))
      const friendlyMsg = friendlyLines.join('\n').trim()

      if (actionLines.length > 0) {
        actionLines.forEach(actionLine => {
          actionLine = actionLine.trim()
          if (actionLine.startsWith('ACTION:ADD|')) {
            const parts = actionLine.replace('ACTION:ADD|', '').split('|')
            if (parts.length >= 4) {
              const title = parts[0].trim()
              const dateStr = parts[1].trim()
              const startTime = parts[2].trim()
              const endTime = parts[3].trim()
              const date = new Date(dateStr + 'T12:00:00')
              const hour = parseInt(startTime.split(':')[0])
              onAddEvent(date, hour, title, startTime, endTime)
            }
          }
          if (actionLine.startsWith('ACTION:DELETEDAY|')) {
            const dateStr = actionLine.replace('ACTION:DELETEDAY|', '').trim()
            const date = new Date(dateStr + 'T12:00:00')
            Object.keys(events).forEach(key => {
              if (key.startsWith(date.toDateString())) {
                onDeleteEvent(key)
              }
            })
          }
          if (actionLine.startsWith('ACTION:DELETE|')) {
            const parts = actionLine.replace('ACTION:DELETE|', '').split('|')
            if (parts.length >= 2) {
              const title = parts[0].trim().toLowerCase()
              const dateStr = parts[1].trim()
              const date = new Date(dateStr + 'T12:00:00')
              Object.keys(events).forEach(key => {
                if (key.startsWith(date.toDateString()) && events[key].title.toLowerCase().includes(title)) {
                  onDeleteEvent(key)
                }
              })
            }
          }
        })
        setMessages(prev => [...prev, { role: 'assistant', content: friendlyMsg || 'Done!' }])
        setLoading(false)
        return
      }

      setMessages(prev => [...prev, { role: 'assistant', content: fullReply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Oops something went wrong! Try again?' }])
    }
    setLoading(false)
  }

  return (
    <>
      <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {!open && (
          <div style={{ position: 'absolute', bottom: '72px', right: '0px', background: 'white', borderRadius: '16px 16px 4px 16px', padding: '6px 12px', fontSize: '12px', fontFamily: 'Quicksand, sans-serif', fontWeight: 700, color: '#7c5cbf', boxShadow: '0 2px 12px rgba(155,127,212,0.25)', whiteSpace: 'nowrap' }}>
            meet your personal assistant!
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          style={{ width: '64px', height: '64px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(155,127,212,0.6), 0 0 40px rgba(155,127,212,0.3)', transition: 'all 0.2s', padding: 0 }}
          onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)' }}
          onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)' }}
        >
          {open ? (
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #9b7fd4, #c4b5fd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: 'white', fontWeight: 700 }}>x</div>
          ) : (
            <img
              src={darkMode ? '/mascots/moon_happy.png' : '/mascots/sun_happy.png'}
              alt="assistant"
              style={{ width: '64px', height: '64px', objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(155,127,212,0.8))' }}
            />
          )}
        </button>
      </div>

      {open && (
        <div style={{ position: 'fixed', bottom: '100px', right: '28px', width: '340px', height: '480px', background: darkMode ? 'rgba(15,5,35,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: darkMode ? '1px solid rgba(180,150,255,0.15)' : '1px solid rgba(255,255,255,0.95)', boxShadow: '0 8px 40px rgba(150,100,220,0.25)', display: 'flex', flexDirection: 'column', zIndex: 50, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: darkMode ? '1px solid rgba(180,150,255,0.1)' : '1px solid rgba(180,150,220,0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={darkMode ? '/mascots/moon_happy.png' : '/mascots/sun_happy.png'} alt="mascot" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
            <div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontWeight: 700, fontSize: '16px', color: darkMode ? '#c4b5fd' : '#7c5cbf' }}>tasky assistant</div>
              <div style={{ fontSize: '11px', color: '#b8a0d8', fontFamily: 'Quicksand, sans-serif' }}>ask me anything</div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(180,150,220,0.3) transparent' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: m.role === 'user' ? 'linear-gradient(135deg, #9b7fd4, #c4b5fd)' : darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(248,240,255,0.9)', color: m.role === 'user' ? 'white' : darkMode ? '#e2d5ff' : '#3d2d6b', fontSize: '13px', fontFamily: 'Quicksand, sans-serif', fontWeight: 500, lineHeight: 1.5, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '10px 14px', borderRadius: '18px 18px 18px 4px', background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(248,240,255,0.9)', color: '#b8a0d8', fontSize: '13px', fontFamily: 'Quicksand, sans-serif' }}>typing...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: '12px 16px', borderTop: darkMode ? '1px solid rgba(180,150,255,0.1)' : '1px solid rgba(180,150,220,0.15)', display: 'flex', gap: '8px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask me anything..."
              style={{ flex: 1, padding: '10px 14px', borderRadius: '14px', border: '1px solid rgba(180,150,220,0.3)', background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(248,240,255,0.8)', color: darkMode ? '#e2d5ff' : '#3d2d6b', fontSize: '13px', fontFamily: 'Quicksand, sans-serif', outline: 'none' }}
            />
            <button
              onClick={send}
              disabled={loading}
              style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg, #9b7fd4, #c4b5fd)', color: 'white', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: loading ? 0.6 : 1 }}
            >
              +
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Chatbot
