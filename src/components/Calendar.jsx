import { useState, useEffect } from 'react'

const Calendar = ({ events, onCellClick, onDeleteEvent, jumpToWeek, onWeekChange, weekLabel }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()))

  function getMonday(date) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    return d
  }

  useEffect(() => {
    if (jumpToWeek) {
      setCurrentWeekStart(jumpToWeek)
      onWeekChange && onWeekChange(jumpToWeek)
    }
  }, [jumpToWeek])

  function goToPrevWeek() {
    const prev = new Date(currentWeekStart)
    prev.setDate(prev.getDate() - 7)
    setCurrentWeekStart(prev)
    onWeekChange && onWeekChange(prev)
  }

  function goToNextWeek() {
    const next = new Date(currentWeekStart)
    next.setDate(next.getDate() + 7)
    setCurrentWeekStart(next)
    onWeekChange && onWeekChange(next)
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const CELL_HEIGHT = 60

  const weekDates = days.map((_, i) => {
    const d = new Date(currentWeekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  const formatHour = (hour) => {
    if (hour === 0) return '12 am'
    if (hour < 12) return hour + ' am'
    if (hour === 12) return '12 pm'
    return (hour - 12) + ' pm'
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getEventStyle = (event, hour) => {
    if (!event.startTime || !event.endTime) return { top: 0, height: CELL_HEIGHT - 4 }
    const [sh, sm] = event.startTime.split(':').map(Number)
    const [eh, em] = event.endTime.split(':').map(Number)
    const startMins = sh * 60 + sm
    const endMins = eh * 60 + em
    const cellStartMins = hour * 60
    const top = ((startMins - cellStartMins) / 60) * CELL_HEIGHT
    const height = ((endMins - startMins) / 60) * CELL_HEIGHT - 4
    return { top: Math.max(0, top), height: Math.max(20, height) }
  }

  const isEventStart = (event, hour) => {
    if (!event.startTime) return true
    const [sh] = event.startTime.split(':').map(Number)
    return sh === hour
  }

  return (
    <div className="calendar-wrapper">
      <div className="calendar-top-bar">
        <div className="calendar-week-label">Week of {weekLabel}</div>
        <div className="calendar-nav">
          <button onClick={goToPrevWeek}>&#8592;</button>
          <button onClick={goToNextWeek}>&#8594;</button>
        </div>
      </div>

      <div className="calendar-scroll-container">
        <div className="calendar-grid">
          <div className="calendar-header">
            <div className="time-col-header"></div>
            {weekDates.map((date, i) => (
              <div key={i} className={isToday(date) ? 'day-header today-header' : 'day-header'}>
                <span className="day-name">{days[i]}</span>
                <span className={isToday(date) ? 'day-date-num today-circle' : 'day-date-num'}>
                  {date.getDate()}
                </span>
              </div>
            ))}
          </div>

          <div className="calendar-body">
            <div className="time-gutter">
              {hours.map(hour => (
                <div key={hour} className="time-slot">{formatHour(hour)}</div>
              ))}
            </div>
            {weekDates.map((date, di) => (
              <div key={di} className="day-column">
                {hours.map(hour => (
                  <div key={hour} className="hour-cell"
                    style={{ height: CELL_HEIGHT + 'px' }}
                    onClick={() => onCellClick(date, hour)} />
                ))}
                {hours.map(hour => {
                  const key = date.toDateString() + '-' + hour
                  const event = events[key]
                  if (!event || !isEventStart(event, hour)) return null
                  const style = getEventStyle(event, hour)
                  const topOffset = hour * CELL_HEIGHT + style.top
                  return (
                    <div key={key} className="event-block"
                      style={{ backgroundColor: event.color, top: topOffset + 'px', height: style.height + 'px' }}
                      onClick={e => { e.stopPropagation(); onCellClick(date, hour) }}>
                      <span className="event-title">
                        {event.category === 'Work' && '💼 '}
                        {event.category === 'Personal' && '🌸 '}
                        {event.category === 'School' && '📚 '}
                        {event.category === 'Health' && '💪 '}
                        {event.category === 'Social' && '🎉 '}
                        {event.category === 'Errands' && '🛒 '}
                        {event.title}
                      </span>
                      {event.startTime && (
                        <span className="event-time">{event.startTime} - {event.endTime}</span>
                      )}
                      {event.location && <span className="event-location">{event.location}</span>}
                      {event.link && (
                        <a href={event.link} target="_blank" rel="noreferrer"
                          className="event-link" onClick={e => e.stopPropagation()}>Link</a>
                      )}
                      <button className="delete-btn"
                        onClick={e => { e.stopPropagation(); onDeleteEvent(key) }}>x</button>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendar
