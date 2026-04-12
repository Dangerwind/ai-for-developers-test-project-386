import { useEffect, useState } from 'react'
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

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    getEventTypes()
      .then(setEventTypes)
      .catch(() => setError('Не удалось загрузить типы событий'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl px-10 py-12 mb-10">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-orange-100 opacity-50 pointer-events-none" />
        <span className="inline-flex items-center bg-white border border-orange-200 text-orange-500 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Бесплатно
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-3">Calendar</h1>
        <p className="text-gray-500 text-base max-w-md">
          Простой способ планировать встречи. Выберите тип события, удобное время — и готово.
        </p>
      </div>

      {/* Event types */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Выберите тип встречи</h2>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-7 h-7 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        ) : eventTypes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-sm">Нет доступных типов встреч. Обратитесь к администратору.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventTypes.map((et) => (
              <div
                key={et.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-orange-200 transition-all flex flex-col"
              >
                <h4 className="font-semibold text-gray-900 mb-1 text-base">{et.name}</h4>
                <p className="text-sm text-gray-500 flex-1 mb-3 leading-snug">{et.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                  <ClockIcon />
                  {et.durationMinutes} мин
                </div>
                <button
                  onClick={() => navigate(`/book/${et.id}`)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm py-2 rounded-lg transition-colors cursor-pointer"
                >
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
