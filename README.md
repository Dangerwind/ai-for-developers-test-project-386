### Hexlet tests and linter status:
[![Actions Status](https://github.com/Dangerwind/ai-for-developers-test-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/Dangerwind/ai-for-developers-test-project-386/actions)
[![Playwright Tests](https://github.com/Dangerwind/ai-for-developers-test-project-386/actions/workflows/playwright.yml/badge.svg)](https://github.com/Dangerwind/ai-for-developers-test-project-386/actions/workflows/playwright.yml)

# Календарь звонков

**Деплой:** https://hexlet-calendar.onrender.com

Упрощённый сервис бронирования времени для встреч (по мотивам Cal.com).

## Функциональность

- Владелец создаёт типы событий (название, описание, длительность)
- Гость выбирает тип встречи, дату и свободный слот
- Бронирование: нельзя создать две записи на одно время
- Владелец видит список предстоящих встреч

## Стек

- **Frontend**: TypeScript + Vite + React + Tailwind CSS v4
- **Backend**: Java 21 + Spring Boot 3 + Gradle + H2 (in-memory)
- **API Spec**: TypeSpec → OpenAPI
- **Tests**: Playwright (e2e)
- **Deploy**: Docker

## Запуск локально

### Backend

```bash
cd backend
./gradlew bootRun
```

Backend запускается на `http://localhost:8080`.

### Frontend (dev)

```bash
cd frontend
npm install
npm run dev
```

Frontend запускается на `http://localhost:5173` с проксированием API на backend.

## Docker

```bash
docker build -t calendar-app .
docker run -p 8080:8080 -e PORT=8080 calendar-app
```

Приложение будет доступно на `http://localhost:8080`.

## E2E тесты

```bash
cd e2e
npm install
npx playwright install chromium
BASE_URL=http://localhost:8080 npm test
```

## API

Спецификация в `typespec/main.tsp`, сгенерированный OpenAPI в `openapi.yaml`.

Основные эндпоинты:
- `GET  /api/event-types` — список типов событий
- `POST /api/event-types` — создать тип события
- `GET  /api/event-types/{id}/slots?date=YYYY-MM-DD` — доступные слоты
- `GET  /api/bookings` — предстоящие встречи
- `POST /api/bookings` — создать бронирование
