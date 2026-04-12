import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { getBookings, createEventType } from '../api'
import type { Booking } from '../api'

dayjs.locale('ru')

type Tab = 'bookings' | 'create'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('bookings')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [bookingsError, setBookingsError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [creating, setCreating] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const loadBookings = () => {
    setBookingsLoading(true)
    setBookingsError(null)
    getBookings()
      .then(setBookings)
      .catch(() => setBookingsError('Ошибка загрузки встреч'))
      .finally(() => setBookingsLoading(false))
  }

  useEffect(() => { loadBookings() }, [])

  const upcomingBookings = bookings
    .filter((b) => dayjs(b.startTime).isAfter(dayjs()))
    .sort((a, b) => dayjs(a.startTime).unix() - dayjs(b.startTime).unix())

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Введите название'
    if (!description.trim()) e.description = 'Введите описание'
    if (durationMinutes <= 0) e.durationMinutes = 'Длительность должна быть больше 0'
    return e
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setCreating(true)
    setCreateError(null)
    setCreateSuccess(false)
    try {
      await createEventType({ name: name.trim(), description: description.trim(), durationMinutes })
      setCreateSuccess(true)
      setName('')
      setDescription('')
      setDurationMinutes(30)
    } catch {
      setCreateError('Ошибка при создании типа события')
    } finally {
      setCreating(false)
    }
  }

  const tabClass = (tab: Tab) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
      activeTab === tab
        ? 'border-orange-500 text-orange-500'
        : 'border-transparent text-gray-500 hover:text-gray-800'
    }`

  return (
    <div>
      {/* Tabs */}
      <div role="tablist" className="flex border-b border-gray-200 mb-6">
        <button
          role="tab"
          aria-selected={activeTab === 'bookings'}
          onClick={() => setActiveTab('bookings')}
          className={tabClass('bookings')}
        >
          Предстоящие встречи
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'create'}
          onClick={() => setActiveTab('create')}
          className={tabClass('create')}
        >
          Создать тип события
        </button>
      </div>

      {/* Bookings tab */}
      {activeTab === 'bookings' && (
        <div role="tabpanel">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-bold text-gray-900">Предстоящие встречи</h3>
            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {upcomingBookings.length}
            </span>
          </div>

          {bookingsLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-7 h-7 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
            </div>
          ) : bookingsError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{bookingsError}</div>
          ) : upcomingBookings.length === 0 ? (
            <p className="text-sm text-gray-400">Нет предстоящих встреч</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Дата и время</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Тип встречи</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Гость</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {upcomingBookings.map((b, i) => (
                    <tr key={b.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-4 py-3 text-gray-700">
                        {dayjs(b.startTime).format('DD.MM.YYYY HH:mm')} – {dayjs(b.endTime).format('HH:mm')}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{b.eventTypeName}</td>
                      <td className="px-4 py-3 text-gray-700">{b.guestName}</td>
                      <td className="px-4 py-3 text-gray-400">{b.guestEmail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            onClick={loadBookings}
            className="mt-4 text-sm text-gray-400 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Обновить
          </button>
        </div>
      )}

      {/* Create tab */}
      {activeTab === 'create' && (
        <div role="tabpanel">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-md">
            <h3 className="text-base font-bold text-gray-900 mb-5">Новый тип события</h3>

            <form onSubmit={handleCreate} noValidate>
              <div className="mb-4">
                <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-1">
                  Название <span className="text-red-400">*</span>
                </label>
                <input
                  id="eventName"
                  type="text"
                  placeholder="Консультация"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-label="Название"
                  className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="eventDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Описание <span className="text-red-400">*</span>
                </label>
                <input
                  id="eventDescription"
                  type="text"
                  placeholder="Краткое обсуждение проекта"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  aria-label="Описание"
                  className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>

              <div className="mb-5">
                <label htmlFor="eventDuration" className="block text-sm font-medium text-gray-700 mb-1">
                  Длительность (мин) <span className="text-red-400">*</span>
                </label>
                <input
                  id="eventDuration"
                  type="number"
                  min={15}
                  step={15}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  aria-label="Длительность (мин)"
                  className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 ${errors.durationMinutes ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.durationMinutes && <p className="text-xs text-red-500 mt-1">{errors.durationMinutes}</p>}
              </div>

              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-3">{createError}</div>
              )}
              {createSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm mb-3">
                  Тип события успешно создан!
                </div>
              )}

              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                {creating && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Создать
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
