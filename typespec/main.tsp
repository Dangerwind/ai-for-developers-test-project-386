import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

@service({
  title: "Call Booking Calendar API",
})
@server("http://localhost:8080", "Local development server")
namespace CalendarApi;

// ─────────────────────────────────────────────
// Models
// ─────────────────────────────────────────────

/** Тип события, созданный владельцем календаря */
model EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: int32;
}

/** Данные для создания нового типа события */
model CreateEventTypeRequest {
  name: string;
  description: string;
  durationMinutes: int32;
}

/** Свободный / занятый слот времени */
model Slot {
  startTime: utcDateTime;
  endTime: utcDateTime;
  available: boolean;
}

/** Бронирование слота */
model Booking {
  id: string;
  eventTypeId: string;
  eventTypeName: string;
  guestName: string;
  guestEmail: string;
  startTime: utcDateTime;
  endTime: utcDateTime;
}

/** Запрос на создание бронирования */
model CreateBookingRequest {
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  startTime: utcDateTime;
}

/** Ответ об ошибке */
model ErrorResponse {
  message: string;
}

// ─────────────────────────────────────────────
// Event Types
// ─────────────────────────────────────────────

@route("/event-types")
interface EventTypes {
  /** Список всех типов событий (публичный) */
  @get
  list(): {
    @statusCode statusCode: 200;
    @body body: EventType[];
  };

  /** Создать новый тип события (владелец) */
  @post
  create(@body body: CreateEventTypeRequest): {
    @statusCode statusCode: 201;
    @body body: EventType;
  };

  /** Получить доступные слоты для типа события на указанный день */
  @get
  @route("{id}/slots")
  getSlots(
    @path id: string,
    /** Дата в формате YYYY-MM-DD */
    @query date: string,
  ): {
    @statusCode statusCode: 200;
    @body body: Slot[];
  } | {
    @statusCode statusCode: 404;
    @body body: ErrorResponse;
  };
}

// ─────────────────────────────────────────────
// Bookings
// ─────────────────────────────────────────────

@route("/bookings")
interface Bookings {
  /** Список всех предстоящих встреч (владелец) */
  @get
  list(): {
    @statusCode statusCode: 200;
    @body body: Booking[];
  };

  /** Создать бронирование (гость) */
  @post
  create(@body body: CreateBookingRequest): {
    @statusCode statusCode: 201;
    @body body: Booking;
  } | {
    /** Слот уже занят */
    @statusCode statusCode: 409;
    @body body: ErrorResponse;
  } | {
    /** Тип события не найден */
    @statusCode statusCode: 404;
    @body body: ErrorResponse;
  };
}
