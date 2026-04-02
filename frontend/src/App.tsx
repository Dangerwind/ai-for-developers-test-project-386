import { Routes, Route } from 'react-router-dom'
import { AppShell, Burger, Group, NavLink, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useNavigate, useLocation } from 'react-router-dom'
import EventTypesPage from './pages/EventTypesPage'
import BookingPage from './pages/BookingPage'
import AdminPage from './pages/AdminPage'
import BookingSuccessPage from './pages/BookingSuccessPage'

export default function App() {
  const [opened, { toggle }] = useDisclosure()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 200, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Title order={3} style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            Запись на звонок
          </Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink
          label="Записаться"
          active={location.pathname === '/'}
          onClick={() => navigate('/')}
        />
        <NavLink
          label="Управление (владелец)"
          active={location.pathname === '/admin'}
          onClick={() => navigate('/admin')}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<EventTypesPage />} />
          <Route path="/book/:eventTypeId" element={<BookingPage />} />
          <Route path="/booking-success" element={<BookingSuccessPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  )
}
