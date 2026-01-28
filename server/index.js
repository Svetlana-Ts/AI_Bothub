/**
 * Главный файл Express.js приложения
 * Демонстрирует интеграцию OpenAI API
 */

import dotenv from 'dotenv';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import chatRoutes from './routes/chat.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Разрешаем запросы с localhost для разработки
  if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Middleware для парсинга JSON
app.use(express.json());

// Middleware для логирования запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Проверка наличия API ключа при старте
if (!process.env.OPENAI_API_KEY) {
  console.error('⚠️  ВНИМАНИЕ: OPENAI_API_KEY не установлен в переменных окружения!');
  console.error('Создайте файл .env и добавьте OPENAI_API_KEY=your_key_here');
}

// Роуты API
app.use('/api', chatRoutes);

// Раздача статических файлов клиента (для production)
const publicPath = join(__dirname, 'public');
const pathExists = fs.existsSync(publicPath);

if (pathExists) {
  app.use(express.static(publicPath));
  
  // SPA routing - все не-API запросы на index.html
  app.get('*', (req, res, next) => {
    // Пропускаем API запросы
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(join(publicPath, 'index.html'));
  });
} else {
  // Если статики нет (development), показываем API документацию
  app.get('/', (req, res) => {
    res.json({
      message: 'OpenAI API Integration Server',
      endpoints: {
        'POST /api/chat': 'Отправка сообщения и получение ответа',
        'POST /api/chat/stream': 'Стриминг ответа',
        'POST /api/chat/completion': 'Расширенный метод с несколькими сообщениями',
      },
      example: {
        url: '/api/chat',
        method: 'POST',
        body: {
          message: 'Привет! Расскажи о Node.js',
          systemPrompt: 'Ты опытный разработчик',
        },
      },
    });
  });
}

// Обработка 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Маршрут не найден',
    },
  });
});

// Middleware для обработки ошибок (должен быть последним)
app.use(errorHandler);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📝 Документация API доступна на http://localhost:${PORT}/`);
});
