# 🔧 Решение проблем с Docker

## Проблема: "email must be verified before using account"

Эта ошибка возникает, когда Docker пытается использовать учетную запись Docker Hub с неподтвержденным email.

### Решение 1: Войти в Docker Hub с подтвержденным аккаунтом

```bash
# Войдите в Docker Hub
docker login

# Введите ваш username и password
# Убедитесь, что email подтвержден на hub.docker.com
```

### Решение 2: Выйти из Docker Hub (если не нужен)

```bash
# Выйдите из Docker Hub
docker logout

# Публичные образы (node:20-alpine, nginx:alpine) должны работать без авторизации
```

### Решение 3: Проверить настройки Docker Desktop

1. Откройте Docker Desktop
2. Перейдите в Settings → Docker Engine
3. Убедитесь, что нет настроек авторизации, которые вызывают проблемы
4. Перезапустите Docker Desktop

---

## Проблема: "OPENAI_API_KEY variable is not set"

### Решение:

Создайте файл `server/.env`:

```bash
cd "/Users/lanatsybenova/Documents/AI-course/1 week/2 day/BotHubChat"

# Создайте файл .env
echo "OPENAI_API_KEY=sk-your-openai-key-here" > server/.env

# Или создайте файл вручную и добавьте:
# OPENAI_API_KEY=sk-your-actual-key
```

**Важно:** Замените `sk-your-openai-key-here` на ваш реальный OpenAI API ключ!

---

## Проблема: "version is obsolete" в docker-compose.yml

Это просто предупреждение. Docker Compose v2+ не требует указания версии.

Можно удалить строку `version: '3.8'` из `docker-compose.yml`, но это не обязательно - предупреждение можно игнорировать.

---

## Быстрая проверка перед запуском

```bash
# 1. Проверьте, что Docker работает
docker --version

# 2. Проверьте, что файл .env существует
ls -la server/.env

# 3. Если файла нет, создайте его
echo "OPENAI_API_KEY=sk-your-key" > server/.env

# 4. Попробуйте выйти из Docker Hub (если проблема с авторизацией)
docker logout

# 5. Запустите снова
docker compose up --build
```

---

## Альтернатива: Использовать комбинированный Dockerfile

Если проблемы с docker-compose продолжаются, используйте комбинированный Dockerfile:

```bash
# Создайте .env файл
echo "OPENAI_API_KEY=sk-your-key" > server/.env

# Соберите и запустите
docker build --platform linux/amd64 -t bothubchat-app .
docker run -p 3000:3000 --env-file ./server/.env bothubchat-app
```

Это проще и не требует docker-compose!
