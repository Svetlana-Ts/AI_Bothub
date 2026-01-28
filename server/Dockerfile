# Dockerfile для сервера
FROM node:20-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем остальные файлы сервера
COPY . .

# Открываем порт
EXPOSE 3000

# Запускаем сервер
CMD ["node", "index.js"]
