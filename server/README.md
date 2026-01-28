# OpenAI API Integration - Node.js & Express.js

Полная интеграция OpenAI API (модель gpt-4o-mini) в Express.js приложение.

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` в директории `server/`:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
NODE_ENV=development
```

**Важно:** Получите API ключ на [platform.openai.com](https://platform.openai.com/api-keys)

### 3. Запуск сервера

```bash
npm start
```

Сервер запустится на `http://localhost:3000`

## Структура проекта

```
server/
├── index.js                    # Главный файл приложения
├── routes/
│   └── chat.js                # Роуты для работы с чатом
├── services/
│   └── openaiService.js       # Сервис для работы с OpenAI API
├── middleware/
│   ├── errorHandler.js        # Обработка ошибок
│   └── validateRequest.js     # Валидация запросов
├── .env                       # Переменные окружения (создайте сами)
└── package.json
```

## API Endpoints

### POST /api/chat
Простой запрос с одним сообщением

**Body:**
```json
{
  "message": "Привет! Расскажи о Node.js",
  "systemPrompt": "Ты опытный разработчик" (опционально),
  "temperature": 0.7 (опционально),
  "max_tokens": 1000 (опционально)
}
```

### POST /api/chat/stream
Стриминг ответа (Server-Sent Events)

**Body:**
```json
{
  "message": "Расскажи историю",
  "systemPrompt": "Ты рассказчик" (опционально)
}
```

### POST /api/chat/completion
Расширенный метод с несколькими сообщениями

**Body:**
```json
{
  "messages": [
    { "role": "system", "content": "Ты помощник" },
    { "role": "user", "content": "Привет" }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

## Примеры использования

См. файл `EXAMPLES.md` для подробных примеров с кодом.

## Принципы работы

1. **Аутентификация:** API ключ передается через переменные окружения
2. **Модель:** Используется `gpt-4o-mini` (быстрая и экономичная)
3. **Обработка ошибок:** Все ошибки обрабатываются централизованно
4. **Валидация:** Входные данные валидируются перед отправкой
5. **Безопасность:** API ключ никогда не передается на клиент

## Документация

Подробная документация доступна в файле `../OPENAI_API_INTEGRATION.md`
