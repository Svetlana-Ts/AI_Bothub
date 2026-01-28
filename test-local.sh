#!/bin/bash

# Скрипт для быстрого локального тестирования

set -e

echo "🚀 Запуск локального тестирования BotHubChat"
echo ""

# Проверка наличия .env файла
if [ ! -f "server/.env" ]; then
    echo "⚠️  Файл server/.env не найден!"
    echo "Создайте файл server/.env с содержимым:"
    echo "OPENAI_API_KEY=sk-your-key-here"
    exit 1
fi

# Проверка наличия OPENAI_API_KEY
if ! grep -q "OPENAI_API_KEY" server/.env; then
    echo "⚠️  OPENAI_API_KEY не найден в server/.env"
    exit 1
fi

echo "✅ Конфигурация проверена"
echo ""

# Выбор варианта запуска
echo "Выберите вариант запуска:"
echo "1) Комбинированный (production-like) - один контейнер"
echo "2) Отдельные контейнеры (docker compose)"
echo "3) Только сервер"
read -p "Ваш выбор (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📦 Сборка комбинированного образа..."
        docker build --platform linux/amd64 -t bothubchat-app .
        
        echo ""
        echo "🚀 Запуск контейнера..."
        docker run -p 3000:3000 \
          --env-file ./server/.env \
          -e NODE_ENV=production \
          bothubchat-app
        ;;
    2)
        echo ""
        echo "📦 Запуск docker compose..."
        docker compose up --build
        ;;
    3)
        echo ""
        echo "📦 Сборка образа сервера..."
        cd server
        docker build --platform linux/amd64 -t bothubchat-server .
        
        echo ""
        echo "🚀 Запуск сервера..."
        docker run -p 3000:3000 \
          --env-file ./.env \
          bothubchat-server
        ;;
    *)
        echo "❌ Неверный выбор"
        exit 1
        ;;
esac
