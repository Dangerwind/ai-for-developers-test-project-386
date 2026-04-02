import { useLocation, useNavigate } from 'react-router-dom'
import { Title, Text, Button, Stack, Card, Badge } from '@mantine/core'
import dayjs from 'dayjs'
import type { Booking } from '../api'

export default function BookingSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const booking: Booking | undefined = location.state?.booking

  if (!booking) {
    return (
      <Stack>
        <Title order={2}>Бронирование создано!</Title>
        <Button onClick={() => navigate('/')}>На главную</Button>
      </Stack>
    )
  }

  return (
    <Stack maw={450}>
      <Title order={2} c="green">Бронирование подтверждено!</Title>
      <Card withBorder shadow="sm" p="lg">
        <Stack>
          <Text><strong>Тип встречи:</strong> {booking.eventTypeName}</Text>
          <Badge color="blue" size="lg">
            {dayjs(booking.startTime).format('DD.MM.YYYY HH:mm')} –{' '}
            {dayjs(booking.endTime).format('HH:mm')}
          </Badge>
          <Text><strong>Имя:</strong> {booking.guestName}</Text>
          <Text><strong>Email:</strong> {booking.guestEmail}</Text>
        </Stack>
      </Card>
      <Button variant="outline" onClick={() => navigate('/')}>
        Записаться ещё
      </Button>
    </Stack>
  )
}
