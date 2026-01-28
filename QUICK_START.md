# ⚡ Быстрый старт для локального тестирования

## Самый простой способ

### 1. Подготовка

Создайте файл `server/.env`:
```bash
echo "OPENAI_API_KEY=sk-your-openai-key-here" > server/.env
```

### 2. Запуск (выберите один вариант)

#### Вариант A: Комбинированный (рекомендуется для тестирования production)

```bash
# Сборка и запуск
# --platform linux/amd64 для совместимости с Render.com
docker build --platform linux/amd64 -t bothubchat-app .
docker run -p 3000:3000 --env-file ./server/.env bothubchat-app
```

Откройте: **http://localhost:3000**

**Примечание:** Флаг `--platform linux/amd64` обеспечивает совместимость с Render.com и правильную сборку на Apple Silicon.

#### Вариант B: Docker Compose (отдельные контейнеры)

```bash
docker compose up --build
```

Откройте: **http://localhost:8080** (клиент)  
API: **http://localhost:3000/api** (сервер)

#### Вариант C: Использование скрипта

```bash
./test-local.sh
```

Следуйте инструкциям на экране.

---

## Проверка работы

### Тест API через curl:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Привет! Расскажи о Docker",
    "systemPrompt": "Ты опытный разработчик"
  }'
```

### Тест в браузере:

1. Откройте http://localhost:3000 (вариант A) или http://localhost:8080 (вариант B)
2. Отправьте сообщение в чат
3. Проверьте ответ от AI

---

## Остановка

### Для варианта A:
Нажмите `Ctrl+C` в терминале

### Для варианта B:
```bash
docker compose down
```

---

## Проблемы?

Смотрите подробную инструкцию в **LOCAL_TESTING.md**
