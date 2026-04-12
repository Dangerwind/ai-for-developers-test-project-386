import { useLocation, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import type { Booking } from '../api'

dayjs.locale('ru')

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 mb-2.5">
      <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  )
}

export default function BookingSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const booking: Booking | undefined = location.state?.booking

  if (!booking) {
    return (
      <div className="max-w-md mx-auto mt-10 text-center">
        <h2 className="text-xl font-bold text-green-600 mb-4">Бронирование подтверждено!</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2.5 rounded-lg cursor-pointer"
        >
          На главную
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-6">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        {/* Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 text-green-600">
          <CheckIcon />
        </div>

        <h2 className="text-center text-xl font-bold text-green-600 mb-1">Бронирование подтверждено!</h2>
        <p className="text-center text-sm text-gray-400 mb-6">Встреча успешно запланирована.</p>

        <InfoField label="Тип встречи" value={booking.eventTypeName} />
        <InfoField
          label="Дата и время"
          value={`${dayjs(booking.startTime).format('D MMMM YYYY, HH:mm')} – ${dayjs(booking.endTime).format('HH:mm')}`}
        />
        <InfoField label="Имя" value={booking.guestName} />
        <InfoField label="Email" value={booking.guestEmail} />

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            Записаться ещё
          </button>
          <button
            onClick={() => navigate('/upcoming')}
            className="flex-1 border border-gray-200 hover:border-gray-400 text-gray-700 font-medium text-sm py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            Мои события
          </button>
        </div>
      </div>
    </div>
  )
}
