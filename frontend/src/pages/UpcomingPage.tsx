import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { getBookings } from '../api'
import type { Booking } from '../api'

dayjs.locale('ru')

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
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Предстоящие события</h1>
        <p className="text-sm text-gray-400">Список запланированных встреч</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-7 h-7 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-sm">Нет предстоящих встреч</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm mb-0.5">{b.guestName}</p>
                <p className="text-xs text-gray-400 mb-2">{b.guestEmail}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  {dayjs(b.startTime).format('D MMMM YYYY, HH:mm')} – {dayjs(b.endTime).format('HH:mm')}
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {b.eventTypeName}
                  </span>
                  {b.createdAt && (
                    <span className="text-xs text-gray-300">
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
