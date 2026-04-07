import { Routes, Route, NavLink } from 'react-router-dom'
import EventTypesPage from './pages/EventTypesPage'
import BookingPage from './pages/BookingPage'
import AdminPage from './pages/AdminPage'
import BookingSuccessPage from './pages/BookingSuccessPage'
import UpcomingPage from './pages/UpcomingPage'
import './App.css'

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2" />
      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <NavLink to="/" className="logo" end>
          <CalendarIcon />
          <span>Calendar</span>
        </NavLink>
        <nav className="app-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Записаться
          </NavLink>
          <NavLink
            to="/upcoming"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Предстоящие события
          </NavLink>
        </nav>
      </header>

      <main className="app-main">
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
