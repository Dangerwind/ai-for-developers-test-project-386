import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Title, Text, Loader, Center, Alert, Button, Group,
  TextInput, Stack, Badge, Card, SimpleGrid,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import dayjs from 'dayjs'
import { getEventTypes, getSlots, createBooking } from '../api'
import type { EventType, Slot } from '../api'

export default function BookingPage() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>()
  const navigate = useNavigate()

  const [eventType, setEventType] = useState<EventType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
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
      <Center h={200}>
        <Loader />
      </Center>
    )
  }

  if (!eventType) {
    return <Alert color="red" title="Ошибка">{error || 'Тип события не найден'}</Alert>
  }

  const availableSlots = slots.filter((s) => s.available)

  return (
    <Stack>
      <div>
        <Title order={2}>{eventType.name}</Title>
        <Text c="dimmed">{eventType.description}</Text>
        <Text size="sm">Длительность: <strong>{eventType.durationMinutes} мин</strong></Text>
      </div>

      <DatePickerInput
        label="Выберите дату"
        value={selectedDate}
        onChange={(val) => setSelectedDate(val ? new Date(val) : null)}
        minDate={new Date()}
        w={250}
      />

      {slotsLoading ? (
        <Center h={100}>
          <Loader size="sm" />
        </Center>
      ) : (
        <>
          <Title order={4}>Доступные слоты</Title>
          {availableSlots.length === 0 ? (
            <Text c="dimmed">Нет свободных слотов на выбранную дату</Text>
          ) : (
            <SimpleGrid cols={{ base: 3, sm: 4, md: 6 }}>
              {availableSlots.map((slot) => {
                const time = dayjs(slot.startTime).format('HH:mm')
                const isSelected = selectedSlot?.startTime === slot.startTime
                return (
                  <Button
                    key={slot.startTime}
                    variant={isSelected ? 'filled' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSlot(slot)}
                    data-testid={`slot-${time}`}
                  >
                    {time}
                  </Button>
                )
              })}
            </SimpleGrid>
          )}
        </>
      )}

      {selectedSlot && (
        <Card withBorder shadow="sm" p="md" maw={400}>
          <Title order={4} mb="sm">Ваши данные</Title>
          <Stack>
            <Badge color="blue" size="lg">
              {dayjs(selectedSlot.startTime).format('DD.MM.YYYY HH:mm')} –{' '}
              {dayjs(selectedSlot.endTime).format('HH:mm')}
            </Badge>
            <TextInput
              label="Ваше имя"
              placeholder="Иван Иванов"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
            />
            <TextInput
              label="Email"
              placeholder="ivan@example.com"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              required
            />
            {error && <Alert color="red">{error}</Alert>}
            <Group>
              <Button onClick={handleBook} loading={submitting}>
                Подтвердить бронирование
              </Button>
              <Button variant="subtle" onClick={() => navigate('/')}>
                Отмена
              </Button>
            </Group>
          </Stack>
        </Card>
      )}
    </Stack>
  )
}
