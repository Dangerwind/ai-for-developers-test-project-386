import { useEffect, useState } from 'react'
import { Card, Text, Button, SimpleGrid, Title, Loader, Center, Alert } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { getEventTypes } from '../api'
import type { EventType } from '../api'

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

  if (loading) {
    return (
      <Center h={200}>
        <Loader />
      </Center>
    )
  }

  if (error) {
    return <Alert color="red" title="Ошибка">{error}</Alert>
  }

  return (
    <>
      <Title order={2} mb="md">Выберите тип встречи</Title>
      {eventTypes.length === 0 ? (
        <Text c="dimmed">Нет доступных типов встреч. Обратитесь к администратору.</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {eventTypes.map((et) => (
            <Card key={et.id} shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4} mb="xs">{et.name}</Title>
              <Text size="sm" c="dimmed" mb="sm">{et.description}</Text>
              <Text size="sm" mb="md">Длительность: <strong>{et.durationMinutes} мин</strong></Text>
              <Button fullWidth onClick={() => navigate(`/book/${et.id}`)}>
                Забронировать
              </Button>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </>
  )
}
