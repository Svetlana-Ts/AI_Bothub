# Комбинированный Dockerfile для деплоя всего приложения
# Stage 1: Сборка клиента
FROM node:20-alpine AS client-builder

WORKDIR /app/client

# Копируем package.json и устанавливаем зависимости клиента
COPY client/package*.json ./
RUN npm ci

# Копируем исходный код клиента и собираем
COPY client/ ./
RUN npm run build

# Stage 2: Production образ с сервером и статикой клиента
FROM node:20-alpine

WORKDIR /app

# Копируем package.json сервера и устанавливаем зависимости
COPY server/package*.json ./
RUN npm ci --only=production

# Копируем код сервера
COPY server/ ./

# Копируем собранный клиент из builder stage
COPY --from=client-builder /app/client/dist ./public

# Открываем порт
EXPOSE 3000

# Запускаем сервер
CMD ["node", "index.js"]
