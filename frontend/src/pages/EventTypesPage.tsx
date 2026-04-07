import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEventTypes } from '../api'
import type { EventType } from '../api'

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const eventsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getEventTypes()
      .then(setEventTypes)
      .catch(() => setError('Не удалось загрузить типы событий'))
      .finally(() => setLoading(false))
  }, [])

  const scrollToEvents = () => {
    eventsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <div className="hero">
        <div className="hero-badge">Бесплатно</div>
        <h1>Calendar</h1>
        <p>Простой способ планировать встречи. Выберите тип события, удобное время — и готово.</p>
        <button className="btn-primary" onClick={scrollToEvents}>
          Записаться <ArrowIcon />
        </button>
      </div>

      <div ref={eventsRef}>
        <div className="section-header">
          <h2 className="section-title">Выберите тип встречи</h2>
        </div>

        {loading ? (
          <div className="loader-center">
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="error-banner">{error}</div>
        ) : eventTypes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <p>Нет доступных типов встреч. Обратитесь к администратору.</p>
          </div>
        ) : (
          <div className="event-grid">
            {eventTypes.map((et) => (
              <div key={et.id} className="event-card">
                <h4 className="event-card-title">{et.name}</h4>
                <div className="event-card-desc">{et.description}</div>
                <div className="event-card-meta">
                  <ClockIcon />
                  {et.durationMinutes} мин
                </div>
                <button className="btn-primary" onClick={() => navigate(`/book/${et.id}`)}>
                  Забронировать
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
