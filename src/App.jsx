import { useState, useRef, useEffect } from 'react'
import Calendar from './components/Calendar'
import Sidebar from './components/Sidebar'
import Background from './components/Background'
import Mascot from './components/Mascot'
import Login from './components/Login'
import Chatbot from './components/Chatbot'
import { supabase } from './supabase'
import './App.css'

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d
}

const CATEGORIES = [
  { label: 'Work', symbol: '💼' },
  { label: 'Personal', symbol: '🌸' },
  { label: 'School', symbol: '📚' },
  { label: 'Health', symbol: '💪' },
  { label: 'Social', symbol: '🎉' },
  { label: 'Errands', symbol: '🛒' },
]

const App = () => {
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [events, setEvents] = useState({})
  const [selectedCell, setSelectedCell] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [timezone, setTimezone] = useState('America/New_York')
  const [showModal, setShowModal] = useState(false)
  const [jumpToWeek, setJumpToWeek] = useState(null)
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()))
  const calendarRef = useRef(null)
  const [modalData, setModalData] = useState({
    title: '', location: '', link: '',
    color: '#93c5fd', category: '',
    startDate: '', endDate: '',
    startTime: '09:00', endTime: '10:00',
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) loadEvents()
  }, [user])

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
    if (error) { console.error(error); return }
    const eventsMap = {}
    data.forEach(e => {
      eventsMap[e.event_key] = {
        title: e.title,
        startDate: e.start_date,
        endDate: e.end_date,
        startTime: e.start_time,
        endTime: e.end_time,
        location: e.location,
        link: e.link,
        color: e.color,
        category: e.category,
      }
    })
    setEvents(eventsMap)
  }

  const handleCellClick = (date, hour) => {
    const pad = h => (h < 10 ? '0' + h : h) + ':00'
    const dateStr = date.toISOString().split('T')[0]
    setSelectedCell({ date, hour })
    setModalData({
      title: '', location: '', link: '',
      color: '#93c5fd', category: '',
      startDate: dateStr, endDate: dateStr,
      startTime: pad(hour),
      endTime: pad(Math.min(hour + 1, 23)),
    })
    setShowModal(true)
  }

  const handleSaveEvent = async () => {
    if (!modalData.title.trim()) return
    const key = selectedCell.date.toDateString() + '-' + selectedCell.hour
    setEvents(prev => ({ ...prev, [key]: modalData }))
    setShowModal(false)
    await supabase.from('events').upsert({
      user_id: user.id,
      event_key: key,
      title: modalData.title,
      start_date: modalData.startDate,
      end_date: modalData.endDate,
      start_time: modalData.startTime,
      end_time: modalData.endTime,
      location: modalData.location,
      link: modalData.link,
      color: modalData.color,
      category: modalData.category,
    }, { onConflict: 'user_id,event_key' })
  }

  const handleDeleteEvent = async (key) => {
    setEvents(prev => {
      const updated = { ...prev }
      delete updated[key]
      return updated
    })
    await supabase.from('events')
      .delete()
      .eq('user_id', user.id)
      .eq('event_key', key)
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    const monday = getMonday(date)
    setJumpToWeek(monday)
    setCurrentWeekStart(monday)
  }

  const handleWeekChange = (weekStart) => {
    setCurrentWeekStart(weekStart)
  }

  const formatWeekLabel = () => {
    const end = new Date(currentWeekStart)
    end.setDate(end.getDate() + 6)
    const opts = { month: 'short', day: 'numeric' }
    return currentWeekStart.toLocaleDateString('en-US', opts) + ' – ' + end.toLocaleDateString('en-US', opts)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setEvents({})
    setUser(null)
  }

  const handleChatAddEvent = (date, hour, title, startTime, endTime) => {
  const key = date.toDateString() + '-' + hour
  const pad = h => (h < 10 ? '0' + h : h) + ':00'
  const newEvent = {
    title,
    startDate: date.toISOString().split('T')[0],
    endDate: date.toISOString().split('T')[0],
    startTime: startTime || pad(hour),
    endTime: endTime || pad(Math.min(hour + 1, 23)),
    location: '',
    link: '',
    color: '#c4b5fd',
    category: '',
  }
  setEvents(prev => ({ ...prev, [key]: newEvent }))
  supabase.from('events').upsert({
    user_id: user.id,
    event_key: key,
    title,
    start_date: newEvent.startDate,
    end_date: newEvent.endDate,
    start_time: newEvent.startTime,
    end_time: newEvent.endTime,
    location: '',
    link: '',
    color: '#c4b5fd',
    category: '',
  }, { onConflict: 'user_id,event_key' })
}

  const timezoneLabels = {
    'America/New_York': 'ET',
    'America/Chicago': 'CT',
    'America/Denver': 'MT',
    'America/Los_Angeles': 'PT',
    'America/Anchorage': 'AKT',
    'Pacific/Honolulu': 'HT',
    'Europe/London': 'GMT',
    'Europe/Paris': 'CET',
    'Europe/Berlin': 'CET',
    'Asia/Dubai': 'GST',
    'Asia/Kolkata': 'IST',
    'Asia/Tokyo': 'JST',
    'Asia/Shanghai': 'CST',
    'Australia/Sydney': 'AEST',
  }

  if (authLoading) return (
    <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <p style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: '24px', color: '#9b7fd4' }}>
        loading tasky♥
      </p>
    </div>
  )

  if (!user) return (
    <Login onLogin={setUser} darkMode={darkMode} setDarkMode={setDarkMode} />
  )

  return (
    <div className={darkMode ? 'app dark' : 'app'}>
      <Background darkMode={darkMode} />
      <div className="app-content">
        <div className="app-header">
          <h1 className="tasky-title">tasky<span className="tasky-heart">♥</span></h1>
          <div className="header-right">
            <span className="timezone-display">
              {timezoneLabels[timezone]} — {timezone.split('/')[1].replace('_', ' ')}
            </span>
            <button className="mode-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button className="mode-btn" onClick={handleLogout} style={{ fontSize: '14px' }}>
              👋
            </button>
          </div>
        </div>
        <div className="app-body">
          <Sidebar
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
            timezone={timezone}
            onTimezoneChange={setTimezone}
          />
          <div className="calendar-container" ref={calendarRef}>
            <Mascot darkMode={darkMode} />
            <Calendar
              events={events}
              onCellClick={handleCellClick}
              onDeleteEvent={handleDeleteEvent}
              selectedDate={selectedDate}
              jumpToWeek={jumpToWeek}
              onWeekChange={handleWeekChange}
              weekLabel={formatWeekLabel()}
            />
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>✨ Add Event</h3>
            <input placeholder="Event title" value={modalData.title}
              onChange={e => setModalData({ ...modalData, title: e.target.value })} />
            <div className="date-row">
              <div className="time-field">
                <label>Start Date</label>
                <input type="date" value={modalData.startDate}
                  onChange={e => setModalData({ ...modalData, startDate: e.target.value })} />
              </div>
              <span className="time-arrow">→</span>
              <div className="time-field">
                <label>End Date</label>
                <input type="date" value={modalData.endDate}
                  onChange={e => setModalData({ ...modalData, endDate: e.target.value })} />
              </div>
            </div>
            <div className="time-row">
              <div className="time-field">
                <label>From</label>
                <input type="time" value={modalData.startTime}
                  onChange={e => setModalData({ ...modalData, startTime: e.target.value })} />
              </div>
              <span className="time-arrow">→</span>
              <div className="time-field">
                <label>To</label>
                <input type="time" value={modalData.endTime}
                  onChange={e => setModalData({ ...modalData, endTime: e.target.value })} />
              </div>
            </div>
            <div className="category-row">
              {CATEGORIES.map(cat => (
                <div key={cat.label}
                  className={modalData.category === cat.label ? 'cat-chip active' : 'cat-chip'}
                  onClick={() => setModalData({ ...modalData, category: cat.label })}>
                  {cat.symbol} {cat.label}
                </div>
              ))}
            </div>
            <input placeholder="Location (optional)" value={modalData.location}
              onChange={e => setModalData({ ...modalData, location: e.target.value })} />
            <input placeholder="Link (optional)" value={modalData.link}
              onChange={e => setModalData({ ...modalData, link: e.target.value })} />
            <div className="color-row">
              <label>Color:</label>
              {['#93c5fd','#86efac','#f9a8d4','#c4b5fd','#fde68a','#fb923c'].map(c => (
                <div key={c}
                  className={modalData.color === c ? 'color-dot active' : 'color-dot'}
                  style={{ backgroundColor: c }}
                  onClick={() => setModalData({ ...modalData, color: c })} />
              ))}
            </div>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="save-btn" onClick={handleSaveEvent}>Save ✨</button>
            </div>
          </div>
        </div>
      )}
      <Chatbot
        events={events}
        darkMode={darkMode}
        onAddEvent={handleChatAddEvent}
      />
    </div>
  )
}

export default App
