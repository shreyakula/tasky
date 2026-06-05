import { useState } from 'react'

const Sidebar = ({ onDateSelect, selectedDate, timezone, onTimezoneChange }) => {
  const [viewDate, setViewDate] = useState(new Date())

  const timezones = [
    { label: 'ET - Eastern Time', value: 'America/New_York' },
    { label: 'CT - Central Time', value: 'America/Chicago' },
    { label: 'MT - Mountain Time', value: 'America/Denver' },
    { label: 'PT - Pacific Time', value: 'America/Los_Angeles' },
    { label: 'AKT - Alaska Time', value: 'America/Anchorage' },
    { label: 'HT - Hawaii Time', value: 'Pacific/Honolulu' },
    { label: 'GMT - London', value: 'Europe/London' },
    { label: 'CET - Paris', value: 'Europe/Paris' },
    { label: 'CET - Berlin', value: 'Europe/Berlin' },
    { label: 'GST - Dubai', value: 'Asia/Dubai' },
    { label: 'IST - India', value: 'Asia/Kolkata' },
    { label: 'JST - Tokyo', value: 'Asia/Tokyo' },
    { label: 'CST - Shanghai', value: 'Asia/Shanghai' },
    { label: 'AEST - Sydney', value: 'Australia/Sydney' },
  ]

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const monthName = viewDate.toLocaleString('default', { month: 'long' })

  const prevMonth = () => {
    const d = new Date(viewDate)
    d.setMonth(d.getMonth() - 1)
    setViewDate(d)
  }

  const nextMonth = () => {
    const d = new Date(viewDate)
    d.setMonth(d.getMonth() + 1)
    setViewDate(d)
  }

  const prevYear = () => {
    const d = new Date(viewDate)
    d.setFullYear(d.getFullYear() - 1)
    setViewDate(d)
  }

  const nextYear = () => {
    const d = new Date(viewDate)
    d.setFullYear(d.getFullYear() + 1)
    setViewDate(d)
  }

  const handleDayClick = (day) => {
    const clicked = new Date(year, month, day)
    onDateSelect(clicked)
  }

  const isToday = (day) => {
    const today = new Date()
    return day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
  }

  const isSelected = (day) => {
    if (!selectedDate) return false
    return day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
  }

  const blanks = Array(firstDay).fill(null)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="sidebar">
      <div className="mini-calendar">
        <div className="mini-cal-year">
          <button onClick={prevYear}>&#8249;</button>
          <span>{year}</span>
          <button onClick={nextYear}>&#8250;</button>
        </div>
        <div className="mini-cal-header">
          <button onClick={prevMonth}>&#8249;</button>
          <span>{monthName}</span>
          <button onClick={nextMonth}>&#8250;</button>
        </div>
        <div className="mini-cal-grid">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="mini-cal-dayname">{d}</div>
          ))}
          {blanks.map((_, i) => <div key={'b'+i} />)}
          {days.map(day => (
            <div
              key={day}
              className={isToday(day) ? 'mini-cal-day today' : isSelected(day) ? 'mini-cal-day selected' : 'mini-cal-day'}
              onClick={() => handleDayClick(day)}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      <div className="timezone-picker">
        <label>Timezone</label>
        <select value={timezone} onChange={e => onTimezoneChange(e.target.value)}>
          {timezones.map(tz => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default Sidebar
