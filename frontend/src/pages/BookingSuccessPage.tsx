import { useLocation, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import type { Booking } from '../api'

dayjs.locale('ru')

function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function BookingSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const booking: Booking | undefined = location.state?.booking

  if (!booking) {
    return (
      <div className="success-page">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--green)', marginBottom: '1rem' }}>Бронирование подтверждено!</h2>
          <button className="btn-primary" onClick={() => navigate('/')}>На главную</button>
        </div>
      </div>
    )
  }

  return (
    <div className="success-page">
      <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="success-icon">
          <CheckIcon />
        </div>
        <h2 className="success-title">Бронирование подтверждено!</h2>
        <p className="success-subtitle">
          Встреча успешно запланирована. Детали ниже.
        </p>

        <div style={{ textAlign: 'left' }}>
          <div className="info-field">
            <div className="info-field-label">Тип встречи</div>
            <div className="info-field-value">{booking.eventTypeName}</div>
          </div>

          <div className="info-field">
            <div className="info-field-label">Дата и время</div>
            <div className="info-field-value">
              {dayjs(booking.startTime).format('D MMMM YYYY, HH:mm')} –{' '}
              {dayjs(booking.endTime).format('HH:mm')}
            </div>
          </div>

          <div className="info-field">
            <div className="info-field-label">Имя</div>
            <div className="info-field-value">{booking.guestName}</div>
          </div>

          <div className="info-field">
            <div className="info-field-label">Email</div>
            <div className="info-field-value">{booking.guestEmail}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Записаться ещё
          </button>
          <button className="btn-secondary" onClick={() => navigate('/upcoming')}>
            Мои события
          </button>
        </div>
      </div>
    </div>
  )
}
