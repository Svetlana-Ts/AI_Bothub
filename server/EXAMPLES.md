# Примеры использования OpenAI API

## Пример 1: Простой запрос

### Запрос:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Привет! Расскажи кратко о Node.js"
  }'
```

### Ответ:
```json
{
  "success": true,
  "data": {
    "message": "Node.js - это среда выполнения JavaScript...",
    "model": "gpt-4o-mini"
  }
}
```

---

## Пример 2: Запрос с системным промптом

### Запрос:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Объясни концепцию REST API",
    "systemPrompt": "Ты опытный преподаватель программирования. Объясняй просто и понятно.",
    "temperature": 0.7,
    "max_tokens": 500
  }'
```

---

## Пример 3: Многотуровый диалог

### Запрос:
```bash
curl -X POST http://localhost:3000/api/chat/completion \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "system",
        "content": "Ты помощник по программированию"
      },
      {
        "role": "user",
        "content": "Что такое Express.js?"
      },
      {
        "role": "assistant",
        "content": "Express.js - это минималистичный веб-фреймворк для Node.js..."
      },
      {
        "role": "user",
        "content": "Как создать простой сервер?"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 1000
  }'
```

---

## Пример 4: JavaScript клиент (fetch)

```javascript
// Простой запрос
async function sendMessage(message) {
  const response = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message,
      systemPrompt: 'Ты полезный ассистент',
    }),
  });

  const data = await response.json();
  return data.data.message;
}

// Использование
sendMessage('Привет!').then(response => {
  console.log(response);
});
```

---

## Пример 5: Стриминг ответа (Server-Sent Events)

```javascript
async function streamMessage(message) {
  const response = await fetch('http://localhost:3000/api/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message,
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data.content) {
          console.log(data.content);
        }
        if (data.done) {
          console.log('Завершено');
          return;
        }
      }
    }
  }
}

// Использование
streamMessage('Расскажи длинную историю');
```

---

## Пример 6: Обработка ошибок

```javascript
async function sendMessageWithErrorHandling(message) {
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error.message);
    }

    return data.data.message;
  } catch (error) {
    if (error.message.includes('API ключ')) {
      console.error('Проблема с API ключом');
    } else if (error.message.includes('лимит')) {
      console.error('Превышен лимит запросов');
    } else {
      console.error('Ошибка:', error.message);
    }
    throw error;
  }
}
```

---

## Пример 7: Использование в Express.js роуте

```javascript
// В вашем Express приложении
import express from 'express';
import { sendMessage } from '../services/openaiService.js';

const router = express.Router();

router.post('/my-endpoint', async (req, res, next) => {
  try {
    const userInput = req.body.text;
    
    // Используем сервис OpenAI
    const aiResponse = await sendMessage(
      userInput,
      'Ты помощник для моего приложения'
    );

    // Делаем что-то с ответом
    res.json({
      userInput,
      aiResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});
```
