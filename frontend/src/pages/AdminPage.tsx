import { useEffect, useState } from 'react'
import {
  Title, Text, Button, Stack, TextInput, NumberInput,
  Table, Loader, Center, Alert, Tabs, Badge, Card,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import dayjs from 'dayjs'
import { getBookings, createEventType } from '../api'
import type { Booking, CreateEventTypeRequest } from '../api'

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [bookingsError, setBookingsError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const form = useForm<CreateEventTypeRequest>({
    initialValues: {
      name: '',
      description: '',
      durationMinutes: 30,
    },
    validate: {
      name: (v) => (!v.trim() ? 'Введите название' : null),
      description: (v) => (!v.trim() ? 'Введите описание' : null),
      durationMinutes: (v) => (v <= 0 ? 'Длительность должна быть больше 0' : null),
    },
  })

  const loadBookings = () => {
    setBookingsLoading(true)
    getBookings()
      .then(setBookings)
      .catch(() => setBookingsError('Ошибка загрузки встреч'))
      .finally(() => setBookingsLoading(false))
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const handleCreate = async (values: CreateEventTypeRequest) => {
    setCreating(true)
    setCreateError(null)
    setCreateSuccess(false)
    try {
      await createEventType(values)
      setCreateSuccess(true)
      form.reset()
    } catch {
      setCreateError('Ошибка при создании типа события')
    } finally {
      setCreating(false)
    }
  }

  const upcomingBookings = bookings
    .filter((b) => dayjs(b.startTime).isAfter(dayjs()))
    .sort((a, b) => dayjs(a.startTime).unix() - dayjs(b.startTime).unix())

  return (
    <Tabs defaultValue="bookings">
      <Tabs.List mb="md">
        <Tabs.Tab value="bookings">Предстоящие встречи</Tabs.Tab>
        <Tabs.Tab value="create">Создать тип события</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="bookings">
        <Title order={3} mb="md">
          Предстоящие встречи{' '}
          <Badge size="lg" variant="light">{upcomingBookings.length}</Badge>
        </Title>
        {bookingsLoading ? (
          <Center h={150}>
            <Loader />
          </Center>
        ) : bookingsError ? (
          <Alert color="red">{bookingsError}</Alert>
        ) : upcomingBookings.length === 0 ? (
          <Text c="dimmed">Нет предстоящих встреч</Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Дата и время</Table.Th>
                <Table.Th>Тип встречи</Table.Th>
                <Table.Th>Гость</Table.Th>
                <Table.Th>Email</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {upcomingBookings.map((b) => (
                <Table.Tr key={b.id}>
                  <Table.Td>
                    {dayjs(b.startTime).format('DD.MM.YYYY HH:mm')} –{' '}
                    {dayjs(b.endTime).format('HH:mm')}
                  </Table.Td>
                  <Table.Td>{b.eventTypeName}</Table.Td>
                  <Table.Td>{b.guestName}</Table.Td>
                  <Table.Td>{b.guestEmail}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
        <Button variant="subtle" mt="md" onClick={loadBookings}>
          Обновить
        </Button>
      </Tabs.Panel>

      <Tabs.Panel value="create">
        <Card withBorder shadow="sm" p="lg" maw={450}>
          <Title order={3} mb="md">Новый тип события</Title>
          <form onSubmit={form.onSubmit(handleCreate)}>
            <Stack>
              <TextInput
                label="Название"
                placeholder="Консультация"
                required
                {...form.getInputProps('name')}
              />
              <TextInput
                label="Описание"
                placeholder="Краткое обсуждение проекта"
                required
                {...form.getInputProps('description')}
              />
              <NumberInput
                label="Длительность (мин)"
                min={15}
                step={15}
                required
                {...form.getInputProps('durationMinutes')}
              />
              {createError && <Alert color="red">{createError}</Alert>}
              {createSuccess && <Alert color="green">Тип события успешно создан!</Alert>}
              <Button type="submit" loading={creating}>
                Создать
              </Button>
            </Stack>
          </form>
        </Card>
      </Tabs.Panel>
    </Tabs>
  )
}
