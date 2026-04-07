import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export interface EventType {
  id: string
  name: string
  description: string
  durationMinutes: number
}

export interface Slot {
  startTime: string
  endTime: string
  available: boolean
}

export interface Booking {
  id: string
  eventTypeId: string
  eventTypeName: string
  guestName: string
  guestEmail: string
  startTime: string
  endTime: string
  createdAt?: string
}

export interface CreateEventTypeRequest {
  name: string
  description: string
  durationMinutes: number
}

export interface CreateBookingRequest {
  eventTypeId: string
  guestName: string
  guestEmail: string
  startTime: string
}

export const getEventTypes = () =>
  api.get<EventType[]>('/event-types').then((r) => r.data)

export const createEventType = (data: CreateEventTypeRequest) =>
  api.post<EventType>('/event-types', data).then((r) => r.data)

export const getSlots = (eventTypeId: string, date: string) =>
  api.get<Slot[]>(`/event-types/${eventTypeId}/slots`, { params: { date } }).then((r) => r.data)

export const getBookings = () =>
  api.get<Booking[]>('/bookings').then((r) => r.data)

export const createBooking = (data: CreateBookingRequest) =>
  api.post<Booking>('/bookings', data).then((r) => r.data)
