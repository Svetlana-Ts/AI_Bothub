# 🔐 Исправление ошибки Docker авторизации

## Проблема
```
failed to fetch oauth token: unexpected status from GET request to https://auth.docker.io/token?scope=repository%3Alibrary%2Fnode%3Apull&service=registry.docker.io: 401 Unauthorized: email must be verified before using account
```

## Быстрое решение

### Вариант 1: Использовать комбинированный Dockerfile (рекомендуется) ✅

Этот вариант проще и не требует docker-compose:

```bash
cd "/Users/lanatsybenova/Documents/AI-course/1 week/2 day/BotHubChat"

# 1. Создайте файл .env (если еще не создан)
echo "OPENAI_API_KEY=sk-your-openai-key-here" > server/.env

# 2. Соберите образ
docker build --platform linux/amd64 -t bothubchat-app .

# 3. Запустите контейнер
docker run -p 3000:3000 --env-file ./server/.env bothubchat-app
```

Откройте: **http://localhost:3000**

### Вариант 2: Исправить авторизацию Docker Hub

1. **Откройте Docker Desktop**
2. **Перейдите в Settings → Resources → Advanced**
3. **Или попробуйте войти заново:**

```bash
# Войдите в Docker Hub с подтвержденным аккаунтом
docker login

# Или выйдите (публичные образы должны работать без авторизации)
docker logout
```

4. **Перезапустите Docker Desktop**

5. **Попробуйте снова:**
```bash
# Создайте .env файл
echo "OPENAI_API_KEY=sk-your-key" > server/.env

# Запустите
docker compose up --build
```

### Вариант 3: Проверить настройки Docker Desktop

Иногда проблема в настройках Docker Desktop:

1. Откройте Docker Desktop
2. Settings → Docker Engine
3. Убедитесь, что нет проблемных настроек
4. Нажмите "Apply & Restart"

---

## Важно: Создайте файл .env

Перед запуском обязательно создайте файл с вашим OpenAI API ключом:

```bash
cd "/Users/lanatsybenova/Documents/AI-course/1 week/2 day/BotHubChat"

# Создайте файл
echo "OPENAI_API_KEY=sk-your-actual-openai-key" > server/.env

# Или откройте в редакторе и добавьте:
# OPENAI_API_KEY=sk-ваш-реальный-ключ
```

**Замените `sk-your-actual-openai-key` на ваш реальный ключ OpenAI!**

---

## Рекомендация

Используйте **Вариант 1** (комбинированный Dockerfile) - он проще и не требует решения проблем с docker-compose авторизацией.
