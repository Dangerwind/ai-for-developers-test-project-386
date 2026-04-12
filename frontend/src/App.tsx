import { Routes, Route, NavLink } from 'react-router-dom'
import EventTypesPage from './pages/EventTypesPage'
import BookingPage from './pages/BookingPage'
import AdminPage from './pages/AdminPage'
import BookingSuccessPage from './pages/BookingSuccessPage'
import UpcomingPage from './pages/UpcomingPage'

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
      <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
    </svg>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <NavLink to="/" end className="flex items-center gap-2 text-orange-500 font-bold text-lg no-underline">
            <CalendarIcon />
            <span>Calendar</span>
          </NavLink>

          <nav className="flex items-center gap-8">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-sm font-medium pb-0.5 border-b-2 no-underline transition-colors ${
                  isActive
                    ? 'text-orange-500 border-orange-500'
                    : 'text-gray-500 border-transparent hover:text-gray-900'
                }`
              }
            >
              Записаться
            </NavLink>
            <NavLink
              to="/upcoming"
              className={({ isActive }) =>
                `text-sm font-medium pb-0.5 border-b-2 no-underline transition-colors ${
                  isActive
                    ? 'text-orange-500 border-orange-500'
                    : 'text-gray-500 border-transparent hover:text-gray-900'
                }`
              }
            >
              Предстоящие события
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `text-sm font-medium pb-0.5 border-b-2 no-underline transition-colors ${
                  isActive
                    ? 'text-orange-500 border-orange-500'
                    : 'text-gray-400 border-transparent hover:text-gray-700'
                }`
              }
            >
              Админ
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <Routes>
          <Route path="/" element={<EventTypesPage />} />
          <Route path="/book/:eventTypeId" element={<BookingPage />} />
          <Route path="/booking-success" element={<BookingSuccessPage />} />
          <Route path="/upcoming" element={<UpcomingPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  )
}
