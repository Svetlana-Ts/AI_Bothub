# 🚀 Деплой BotHubChat на Render.com

## Что было создано

✅ **Dockerfile** (корень проекта) - для деплоя всего приложения одним сервисом  
✅ **server/Dockerfile** - для деплоя только backend  
✅ **client/Dockerfile** - для деплоя только frontend  
✅ **render.yaml** - конфигурация для автоматического деплоя  
✅ **docker-compose.yml** - для локальной разработки (используйте `docker compose`)  
✅ **.dockerignore** файлы - оптимизация сборки  

## Быстрый старт

### Вариант 1: Один сервис (рекомендуется) ⭐

1. **Подготовка:**
   ```bash
   # Убедитесь, что код закоммичен и запушен в репозиторий
   git add .
   git commit -m "Add Docker configuration"
   git push
   ```

2. **В Render Dashboard:**
   - Зайдите на [render.com](https://render.com)
   - Нажмите "New +" → "Web Service"
   - Подключите ваш GitHub/GitLab репозиторий
   - Выберите репозиторий с BotHubChat

3. **Настройки сервиса:**
   - **Name:** `bothubchat`
   - **Runtime:** `Docker`
   - **Dockerfile Path:** `./Dockerfile`
   - **Docker Context:** `.`
   - **Branch:** `main` (или ваша основная ветка)
   - **Plan:** `Starter` ($7/мес) или `Free` (может засыпать)

4. **Environment Variables:**
   ```
   OPENAI_API_KEY=sk-your-openai-key-here
   NODE_ENV=production
   ```

5. **Деплой:**
   - Нажмите "Create Web Service"
   - Дождитесь завершения сборки (5-10 минут)
   - Готово! 🎉

### Вариант 2: Два отдельных сервиса

Если хотите деплоить backend и frontend отдельно:

1. **Backend сервис:**
   - Runtime: `Docker`
   - Dockerfile Path: `./server/Dockerfile`
   - Docker Context: `./server`
   - Environment: `OPENAI_API_KEY=your_key`

2. **Frontend сервис:**
   - Runtime: `Docker`
   - Dockerfile Path: `./client/Dockerfile`
   - Docker Context: `./client`
   - Environment: `VITE_API_URL=https://your-backend-url.onrender.com/api`

## Локальное тестирование

Перед деплоем можно протестировать локально:

```bash
# Сборка и запуск всего приложения
docker compose up --build

# Или только сервера
cd server
docker build --platform linux/amd64 -t bothubchat-server .
docker run -p 3000:3000 -e OPENAI_API_KEY=your_key bothubchat-server
```

## Важные моменты

⚠️ **Обязательно установите `OPENAI_API_KEY` в Environment Variables!**

⚠️ **Render автоматически устанавливает переменную `PORT`** - не переопределяйте её

⚠️ **Первый деплой может занять 10-15 минут** - это нормально

## После деплоя

- Ваше приложение будет доступно по адресу: `https://your-app-name.onrender.com`
- API будет работать на: `https://your-app-name.onrender.com/api/chat`
- Логи можно смотреть в Render Dashboard → Logs

## Стоимость

- **Free Plan:** Бесплатно, но приложение "засыпает" после 15 минут неактивности
- **Starter Plan:** $7/месяц - приложение всегда работает
- **Professional Plan:** $25/месяц - больше ресурсов

## Troubleshooting

**Проблема:** Приложение не запускается  
**Решение:** Проверьте логи в Render Dashboard и убедитесь, что `OPENAI_API_KEY` установлен

**Проблема:** Клиент не видит API  
**Решение:** Для варианта 1 это должно работать автоматически. Для варианта 2 установите `VITE_API_URL`

**Проблема:** Docker build падает  
**Решение:** Проверьте, что все файлы закоммичены и `.dockerignore` настроен правильно

## Дополнительная информация

Подробная документация на английском: см. `DEPLOY.md`

---

Удачи с деплоем! 🚀
