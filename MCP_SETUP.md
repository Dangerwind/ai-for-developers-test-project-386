# MCP (Model Context Protocol) Configuration

## Установлен Playwright MCP Server

Пакет `@ejazullah/mcp-playwright` установлен и готов к использованию.

## Использование

### Для Claude Desktop:

Добавьте в файл `claude_desktop_config.json` (macOS: `~/Library/Application	support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@ejazullah/mcp-playwright@latest"]
    }
  }
}
```

### Для VS Code:

Используйте кнопку установки или добавьте в настройки:

```json
{
  "mcpServers": {
    "ejaz-playwright": {
      "command": "npx",
      "args": ["@ejazullah/mcp-playwright@latest"]
    }
  }
}
```

### Для Claude Code CLI:

```bash
claude mcp add playwright npx @ejazullah/mcp-playwright@latest
```

## Возможности

- ✅ Открытие браузера Chrome
- ✅ Навигация по страницам
- ✅ Клики и взаимодействие с элементами
- ✅ Заполнение форм
- ✅ Получение содержимого страниц (включая авторизованные!)
- ✅ Скриншоты
- ✅ CDP (Chrome DevTools Protocol) - подключение к запущенному Chrome

## Примеры использования

После настройки MCP, вы сможете просить Claude:

1. "Открой страницу https://ru.hexlet.io/projects/386/members/50668?step=1 в браузере"
2. "Сделай скриншот страницы"
3. "Нажми на кнопку входа"
4. "Получи содержимое страницы"

## CDP Mode (Подключение к вашему Chrome)

Для подключения к уже запущенному Chrome с вашей авторизацией:

```bash
# Запустите Chrome с remote debugging
/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222
```

Затем в MCP используйте режим CDP для подключения к этому инстансу.
