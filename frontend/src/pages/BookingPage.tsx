import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { getEventTypes, getSlots, createBooking } from '../api'
import type { EventType, Slot } from '../api'

dayjs.locale('ru')

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const BOOKING_WINDOW_DAYS = 14

interface CalendarGridProps {
  eventTypeId: string
  selectedDate: Date
  onSelectDate: (date: Date) => void
}

function CalendarGrid({ eventTypeId, selectedDate, onSelectDate }: CalendarGridProps) {
  const [viewMonth, setViewMonth] = useState(() => dayjs(selectedDate).startOf('month'))
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({})

  const today = dayjs()
  const maxDate = today.add(BOOKING_WINDOW_DAYS - 1, 'day')

  useEffect(() => {
    const daysInMonth = viewMonth.daysInMonth()
    const days: string[] = []

    for (let d = 1; d <= daysInMonth; d++) {
      const day = viewMonth.date(d)
      if (!day.isBefore(today, 'day') && !day.isAfter(maxDate, 'day')) {
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
      results.forEach(({ dateStr, count }) => { counts[dateStr] = count })
      setSlotCounts(counts)
    })
  }, [eventTypeId, viewMonth])

  const firstDayOffset = (viewMonth.startOf('month').day() + 6) % 7
  const daysInMonth = viewMonth.daysInMonth()
  const selectedStr = dayjs(selectedDate).format('YYYY-MM-DD')

  const cells: (number | null)[] = [
    ...Array(firstDayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setViewMonth((m) => m.subtract(1, 'month'))}
          className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors cursor-pointer"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-gray-800 capitalize">
          {viewMonth.format('MMMM YYYY')}
        </span>
        <button
          onClick={() => setViewMonth((m) => m.add(1, 'month'))}
          className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors cursor-pointer"
        >
          ›
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-1">
            {d}
          </div>
        ))}

        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />

          const date = viewMonth.date(day)
          const dateStr = date.format('YYYY-MM-DD')
          const isPast = date.isBefore(today, 'day')
          const isTooFar = date.isAfter(maxDate, 'day')
          const isDisabled = isPast || isTooFar
          const isSelected = dateStr === selectedStr
          const isToday = date.isSame(today, 'day')
          const count = slotCounts[dateStr]

          return (
            <button
              key={day}
              disabled={isDisabled}
              onClick={() => onSelectDate(date.toDate())}
              data-testid={`cal-day-${dateStr}`}
              className={[
                'flex flex-col items-center justify-center min-h-11 rounded-lg text-sm transition-colors cursor-pointer border-0',
                isSelected
                  ? 'bg-orange-500 text-white'
                  : isDisabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : isToday
                  ? 'font-bold text-orange-500 hover:bg-orange-50'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500',
              ].join(' ')}
            >
              <span>{day}</span>
              {!isDisabled && count !== undefined && count > 0 && (
                <span className={`text-[10px] font-semibold px-1 rounded-full leading-4 ${isSelected ? 'bg-white/25 text-white' : 'bg-orange-100 text-orange-500'}`}>
                  {count}
                </span>
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
      <div className="flex justify-center items-center h-40">
        <div className="w-7 h-7 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!eventType) {
    return <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error || 'Тип события не найден'}</div>
  }

  const availableSlots = slots.filter((s) => s.available)
  const initials = eventType.name.slice(0, 2).toUpperCase()

  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 items-start">
      {/* Sidebar */}
      <aside className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm md:sticky md:top-24">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm mb-3">
          {initials}
        </div>
        <p className="text-xs text-gray-400 mb-0.5">Встреча с организатором</p>
        <h2 className="font-bold text-gray-900 text-base mb-3">{eventType.name}</h2>

        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          {eventType.durationMinutes} минут
        </div>

        {eventType.description && (
          <p className="text-sm text-gray-500 leading-snug">{eventType.description}</p>
        )}

        {selectedSlot && (
          <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2.5">
            <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide mb-1">Выбранное время</p>
            <p className="text-sm text-indigo-800 font-medium">
              {dayjs(selectedSlot.startTime).format('D MMMM, HH:mm')} – {dayjs(selectedSlot.endTime).format('HH:mm')}
            </p>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex flex-col gap-4">
        <CalendarGrid
          eventTypeId={eventTypeId!}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {/* Slots */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="font-semibold text-gray-900 text-sm mb-3">Доступные слоты</p>

          {slotsLoading ? (
            <div className="flex justify-center items-center h-14">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
            </div>
          ) : availableSlots.length === 0 ? (
            <p className="text-sm text-gray-400">Нет свободных слотов на выбранную дату</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2">
              {availableSlots.map((slot) => {
                const time = dayjs(slot.startTime).format('HH:mm')
                const isSelected = selectedSlot?.startTime === slot.startTime
                return (
                  <button
                    key={slot.startTime}
                    data-testid={`slot-${time}`}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-500'
                    }`}
                  >
                    {time}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Form */}
        {selectedSlot && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="font-semibold text-gray-900 text-sm mb-4">Ваши данные</p>

            <div className="mb-3">
              <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
                Ваше имя <span className="text-red-400">*</span>
              </label>
              <input
                id="guestName"
                type="text"
                placeholder="Иван Иванов"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                aria-label="Ваше имя"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                id="guestEmail"
                type="email"
                placeholder="ivan@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                aria-label="Email"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-3">{error}</div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleBook}
                disabled={submitting}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                {submitting && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Подтвердить бронирование
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-sm text-gray-400 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
