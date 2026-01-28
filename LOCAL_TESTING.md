# 🧪 Локальное тестирование с Docker

## Вариант 1: Тестирование всего приложения (комбинированный Dockerfile)

Этот вариант имитирует production окружение, где клиент и сервер работают вместе.

### Шаг 1: Подготовка

Убедитесь, что у вас есть файл `server/.env` с вашим OpenAI API ключом:

```bash
# server/.env
OPENAI_API_KEY=sk-your-key-here
```

### Шаг 2: Сборка и запуск

```bash
# Из корня проекта
cd /Users/lanatsybenova/Documents/AI-course/1\ week/2\ day/BotHubChat

# Сборка Docker образа
docker build --platform linux/amd64 -t bothubchat-app .

# Запуск контейнера
docker run -p 3000:3000 \
  --env-file ./server/.env \
  -e NODE_ENV=production \
  bothubchat-app
```

### Шаг 3: Проверка

- Откройте браузер: http://localhost:3000
- API будет доступен на: http://localhost:3000/api/chat

---

## Вариант 2: Отдельные контейнеры (docker compose)

Этот вариант запускает клиент и сервер в отдельных контейнерах.

### Шаг 1: Подготовка

1. Создайте файл `server/.env`:
```bash
OPENAI_API_KEY=sk-your-key-here
```

2. Создайте файл `.env` в корне проекта (для docker compose):
```bash
OPENAI_API_KEY=sk-your-key-here
```

### Шаг 2: Запуск

```bash
# Из корня проекта
docker compose up --build
```

Или в фоновом режиме:
```bash
docker compose up -d --build
```

### Шаг 3: Проверка

- **Frontend:** http://localhost (порт 80)
- **Backend API:** http://localhost:3000/api/chat

### Остановка

```bash
docker compose down
```

---

## Вариант 3: Только сервер

Если хотите протестировать только backend:

```bash
cd server

# Сборка
docker build --platform linux/amd64 -t bothubchat-server .

# Запуск
docker run -p 3000:3000 \
  --env-file ./.env \
  bothubchat-server
```

Проверка API:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Привет!"}'
```

---

## Вариант 4: Только клиент

Если хотите протестировать только frontend (нужен запущенный backend):

```bash
cd client

# Сборка
docker build --platform linux/amd64 -t bothubchat-client .

# Запуск (убедитесь, что backend работает на localhost:3000)
docker run -p 80:80 \
  -e VITE_API_URL=http://localhost:3000/api \
  bothubchat-client
```

**Важно:** Для этого варианта нужно пересобрать образ с правильной переменной окружения, так как Vite встраивает переменные на этапе сборки.

---

## Устранение проблем

### Проблема: "Cannot find module" или ошибки зависимостей

**Решение:**
```bash
# Очистите кеш Docker и пересоберите
docker compose down
docker system prune -a
docker compose up --build --force-recreate
# Или с указанием платформы:
docker compose build --platform linux/amd64
docker compose up
```

### Проблема: Клиент не может подключиться к API

**Решение для варианта 2:**
1. Проверьте, что оба контейнера запущены: `docker compose ps`
2. В docker compose клиент должен обращаться к серверу по имени сервиса: `http://server:3000/api`
3. Обновите `client/src/api/chatApi.ts` или используйте переменную окружения

### Проблема: Порт уже занят

**Решение:**
```bash
# Проверьте, что использует порт
lsof -i :3000
lsof -i :80

# Остановите процесс или измените порт в docker-compose.yml (или используйте docker compose)
```

### Проблема: Переменные окружения не работают

**Решение:**
- Убедитесь, что файл `.env` существует в `server/`
- Проверьте синтаксис: `KEY=value` (без пробелов вокруг `=`)
- Для docker compose используйте файл `.env` в корне проекта

---

## Полезные команды

### Просмотр логов

```bash
# Все сервисы
docker compose logs -f

# Только сервер
docker compose logs -f server

# Только клиент
docker compose logs -f client
```

### Перезапуск сервисов

```bash
docker compose restart
```

### Остановка и удаление контейнеров

```bash
docker compose down
docker compose down -v  # Также удаляет volumes
```

### Вход в контейнер

```bash
# В контейнер сервера
docker compose exec server sh

# В контейнер клиента
docker compose exec client sh
```

### Проверка статуса

```bash
docker compose ps
```

---

## Рекомендации

1. **Для разработки:** Используйте обычный `npm run dev` в каждом проекте отдельно
2. **Для тестирования production:** Используйте Вариант 1 (комбинированный Dockerfile)
3. **Для отладки:** Используйте Вариант 2 (docker compose) с просмотром логов

---

## Быстрый старт (TL;DR)

```bash
# 1. Создайте server/.env с OPENAI_API_KEY
echo "OPENAI_API_KEY=sk-your-key" > server/.env

# 2. Запустите все (платформа указана в docker-compose.yml)
docker compose up --build

# 3. Откройте http://localhost:8080
```

Готово! 🚀
