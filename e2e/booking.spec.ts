import { test, expect, request } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080'

test.describe('Booking flow', () => {
  // Create an event type via API before tests
  test.beforeAll(async () => {
    const ctx = await request.newContext({ baseURL: BASE_URL })
    await ctx.post('/api/event-types', {
      data: {
        name: 'Test Meeting',
        description: 'A test meeting for e2e',
        durationMinutes: 30,
      },
    })
    await ctx.dispose()
  })

  test('Guest can see event types on home page', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Выберите тип встречи' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Test Meeting' }).first()).toBeVisible()
  })

  test('Guest can open booking page for an event type', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Забронировать').first().click()
    await expect(page.getByText('Доступные слоты')).toBeVisible()
  })

  test('Guest can book a slot and see confirmation', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Забронировать').first().click()

    // Wait for slots to load
    await expect(page.getByText('Доступные слоты')).toBeVisible()

    // Click the first available slot button
    const slotButton = page.locator('button[data-testid^="slot-"]').first()
    await expect(slotButton).toBeVisible({ timeout: 10000 })
    await slotButton.click()

    // Fill in the booking form
    await page.getByLabel('Ваше имя').fill('Иван Тестовый')
    await page.getByLabel('Email').fill('ivan@test.com')
    await page.getByText('Подтвердить бронирование').click()

    // Should see confirmation page
    await expect(page.getByText('Бронирование подтверждено!')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Иван Тестовый')).toBeVisible()
    await expect(page.getByText('ivan@test.com')).toBeVisible()
  })

  test('Owner can see upcoming bookings in admin panel', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: 'Предстоящие встречи' })).toBeVisible()
    // After booking in previous test, there should be at least 1 booking
    await expect(page.getByText('Иван Тестовый')).toBeVisible({ timeout: 10000 })
  })

  test('Owner can create a new event type', async ({ page }) => {
    await page.goto('/admin')
    await page.getByRole('tab', { name: 'Создать тип события' }).click()
    await page.getByLabel('Название').fill('Новый тип')
    await page.getByLabel('Описание').fill('Описание нового типа')
    await page.getByLabel('Длительность (мин)').fill('45')
    await page.getByRole('button', { name: 'Создать' }).click()
    await expect(page.getByText('Тип события успешно создан!')).toBeVisible()
  })
})
