import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { getEventTypes, getSlots, createBooking } from '../api'
import type { EventType, Slot } from '../api'

dayjs.locale('ru')

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

interface CalendarGridProps {
  eventTypeId: string
  selectedDate: Date
  onSelectDate: (date: Date) => void
}

function CalendarGrid({ eventTypeId, selectedDate, onSelectDate }: CalendarGridProps) {
  const [viewMonth, setViewMonth] = useState(() => dayjs(selectedDate).startOf('month'))
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const today = dayjs()
    const daysInMonth = viewMonth.daysInMonth()
    const days: string[] = []

    for (let d = 1; d <= daysInMonth; d++) {
      const day = viewMonth.date(d)
      if (!day.isBefore(today, 'day')) {
        days.push(day.format('YYYY-MM-DD'))
      }
    }

    if (days.length === 0) return

    Promise.all(
      days.map((dateStr) =>
        getSlots(eventTypeId, dateStr)
          .then((slots) => ({ dateStr, count: slots.filter((s) => s.available).length }))
          .catch(() => ({ dateStr, count: 0 }))
      )
    ).then((results) => {
      const counts: Record<string, number> = {}
      results.forEach(({ dateStr, count }) => {
        counts[dateStr] = count
      })
      setSlotCounts(counts)
    })
  }, [eventTypeId, viewMonth])

  const firstDayOffset = (viewMonth.startOf('month').day() + 6) % 7
  const daysInMonth = viewMonth.daysInMonth()
  const today = dayjs()
  const selectedStr = dayjs(selectedDate).format('YYYY-MM-DD')

  const cells: (number | null)[] = [
    ...Array(firstDayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button
          className="cal-nav"
          onClick={() => setViewMonth((m) => m.subtract(1, 'month'))}
        >
          <ChevronLeft />
        </button>
        <span className="cal-title">{viewMonth.format('MMMM YYYY')}</span>
        <button
          className="cal-nav"
          onClick={() => setViewMonth((m) => m.add(1, 'month'))}
        >
          <ChevronRight />
        </button>
      </div>

      <div className="calendar-grid">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="cal-weekday">{d}</div>
        ))}

        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />

          const date = viewMonth.date(day)
          const dateStr = date.format('YYYY-MM-DD')
          const isPast = date.isBefore(today, 'day')
          const isSelected = dateStr === selectedStr
          const isToday = date.isSame(today, 'day')
          const count = slotCounts[dateStr]

          let className = 'cal-day'
          if (isPast) className += ' past'
          if (isSelected) className += ' selected'
          if (isToday && !isSelected) className += ' today'

          return (
            <button
              key={day}
              className={className}
              disabled={isPast}
              onClick={() => !isPast && onSelectDate(date.toDate())}
            >
              <span>{day}</span>
              {!isPast && count !== undefined && count > 0 && (
                <span className="cal-count">{count}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function BookingPage() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>()
  const navigate = useNavigate()

  const [eventType, setEventType] = useState<EventType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  })
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventTypeId) return
    getEventTypes()
      .then((types) => {
        const found = types.find((t) => t.id === eventTypeId)
        if (found) setEventType(found)
        else setError('Тип события не найден')
      })
      .catch(() => setError('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [eventTypeId])

  useEffect(() => {
    if (!eventTypeId || !selectedDate) return
    setSlotsLoading(true)
    setSelectedSlot(null)
    const dateStr = dayjs(selectedDate).format('YYYY-MM-DD')
    getSlots(eventTypeId, dateStr)
      .then(setSlots)
      .catch(() => setError('Ошибка загрузки слотов'))
      .finally(() => setSlotsLoading(false))
  }, [eventTypeId, selectedDate])

  const handleBook = async () => {
    if (!selectedSlot || !eventTypeId) return
    if (!guestName.trim() || !guestEmail.trim()) {
      setError('Заполните имя и email')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const booking = await createBooking({
        eventTypeId,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        startTime: selectedSlot.startTime,
      })
      navigate('/booking-success', { state: { booking } })
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('Этот слот уже занят. Выберите другое время.')
      } else {
        setError('Ошибка при создании бронирования')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="loader-center">
        <div className="spinner" />
      </div>
    )
  }

  if (!eventType) {
    return <div className="error-banner">{error || 'Тип события не найден'}</div>
  }

  const availableSlots = slots.filter((s) => s.available)
  const initials = eventType.name.slice(0, 2).toUpperCase()

  return (
    <div className="booking-layout">
      {/* Sidebar */}
      <aside className="booking-sidebar">
        <div className="booking-sidebar-avatar">{initials}</div>
        <div className="booking-sidebar-name">Встреча с организатором</div>
        <div className="booking-sidebar-title">{eventType.name}</div>

        <div className="sidebar-info-row">
          <ClockIcon />
          {eventType.durationMinutes} минут
        </div>

        {eventType.description && (
          <div className="sidebar-info-row" style={{ alignItems: 'flex-start', lineHeight: 1.4 }}>
            <span style={{ marginTop: '2px', color: 'var(--orange)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
            <span>{eventType.description}</span>
          </div>
        )}

        {selectedSlot && (
          <div className="sidebar-selected-slot">
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Выбранное время
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <CalendarIcon />
              {dayjs(selectedSlot.startTime).format('D MMMM, HH:mm')} –{' '}
              {dayjs(selectedSlot.endTime).format('HH:mm')}
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="booking-main">
        {/* Calendar */}
        <CalendarGrid
          eventTypeId={eventTypeId!}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {/* Slot list */}
        <div className="slots-section">
          <div className="slots-section-title">Доступные слоты</div>

          {slotsLoading ? (
            <div className="loader-center" style={{ minHeight: 80 }}>
              <div className="spinner spinner-sm" />
            </div>
          ) : availableSlots.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', margin: 0 }}>
              Нет свободных слотов на выбранную дату
            </p>
          ) : (
            <div className="slots-grid">
              {availableSlots.map((slot) => {
                const time = dayjs(slot.startTime).format('HH:mm')
                const isSelected = selectedSlot?.startTime === slot.startTime
                return (
                  <button
                    key={slot.startTime}
                    className={`slot-btn${isSelected ? ' selected' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                    data-testid={`slot-${time}`}
                  >
                    {time}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Booking form (shown after slot selection) */}
        {selectedSlot && (
          <div className="booking-form">
            <div className="form-title">Ваши данные</div>

            <div className="form-group">
              <label className="form-label" htmlFor="guestName">
                Ваше имя <span>*</span>
              </label>
              <input
                id="guestName"
                className="form-input"
                type="text"
                placeholder="Иван Иванов"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                aria-label="Ваше имя"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="guestEmail">
                Email <span>*</span>
              </label>
              <input
                id="guestEmail"
                className="form-input"
                type="email"
                placeholder="ivan@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                aria-label="Email"
              />
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="form-actions">
              <button
                className="btn-primary"
                onClick={handleBook}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="spinner spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
                    Отправка...
                  </>
                ) : (
                  'Подтвердить бронирование'
                )}
              </button>
              <button className="btn-ghost" onClick={() => navigate('/')}>
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
