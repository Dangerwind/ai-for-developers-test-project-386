import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { getBookings } from '../api'
import type { Booking } from '../api'

dayjs.locale('ru')

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export default function UpcomingPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getBookings()
      .then((all) => {
        const upcoming = all
          .filter((b) => dayjs(b.startTime).isAfter(dayjs()))
          .sort((a, b) => dayjs(a.startTime).unix() - dayjs(b.startTime).unix())
        setBookings(upcoming)
      })
      .catch(() => setError('Не удалось загрузить события'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="upcoming-header">
        <h1 className="upcoming-title">Предстоящие события</h1>
        <p className="upcoming-subtitle">Список запланированных встреч</p>
      </div>

      {loading ? (
        <div className="loader-center">
          <div className="spinner" />
        </div>
      ) : error ? (
        <div className="error-banner">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <p>Нет предстоящих встреч</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((b) => (
            <div key={b.id} className="booking-item">
              <div className="booking-item-icon">
                <UserIcon />
              </div>
              <div className="booking-item-content">
                <div className="booking-item-name">{b.guestName}</div>
                <div className="booking-item-email">{b.guestEmail}</div>
                <div className="booking-item-time">
                  <ClockIcon />
                  {dayjs(b.startTime).format('D MMMM YYYY, HH:mm')} –{' '}
                  {dayjs(b.endTime).format('HH:mm')}
                </div>
                <div className="booking-item-meta">
                  <span className="badge badge-orange">{b.eventTypeName}</span>
                  {b.createdAt && (
                    <span style={{ color: 'var(--text-light)', fontSize: '0.8125rem' }}>
                      Создано: {dayjs(b.createdAt).format('D MMM, HH:mm')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
