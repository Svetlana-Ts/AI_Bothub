/**
 * Роуты для работы с чатом через OpenAI API
 */

import express from 'express';
import { sendMessage, chatCompletion, streamChatCompletion } from '../services/openaiService.js';
import { validateChatRequest } from '../middleware/validateRequest.js';

const router = express.Router();

/**
 * POST /api/chat
 * Отправка сообщения и получение ответа от AI
 * 
 * Body:
 * {
 *   "message": "Привет, как дела?",
 *   "systemPrompt": "Ты полезный ассистент" (опционально),
 *   "temperature": 0.7 (опционально),
 *   "max_tokens": 1000 (опционально)
 * }
 */
router.post('/chat', validateChatRequest, async (req, res, next) => {
  try {
    const { 
      message, 
      systemPrompt, 
      temperature, 
      max_tokens,
      topP,
      topK,
      frequencyPenalty,
      presencePenalty,
    } = req.body;

    // Вызываем сервис для получения ответа от AI
    const response = await sendMessage(
      message,
      systemPrompt,
      {
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens ?? 1000,
        topP,
        topK,
        frequencyPenalty,
        presencePenalty,
      }
    );

    // Возвращаем успешный ответ
    res.json({
      success: true,
      data: {
        message: response,
        model: 'gpt-4o-mini',
      },
    });
  } catch (error) {
    // Передаем ошибку в errorHandler middleware
    next(error);
  }
});

/**
 * OPTIONS /api/chat/stream
 * Обработка preflight запросов для стриминга
 */
router.options('/chat/stream', (req, res) => {
  const origin = req.headers.origin;
  if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

/**
 * POST /api/chat/stream
 * Отправка сообщения и получение стримингового ответа от AI
 * 
 * Body:
 * {
 *   "message": "Расскажи историю",
 *   "systemPrompt": "Ты рассказчик" (опционально)
 * }
 */
router.post('/chat/stream', validateChatRequest, async (req, res, next) => {
  try {
    const { 
      message, 
      systemPrompt,
      temperature,
      max_tokens,
      topP,
      topK,
      frequencyPenalty,
      presencePenalty,
    } = req.body;

    // Устанавливаем CORS заголовки для стриминга
    const origin = req.headers.origin;
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Устанавливаем заголовки для Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: message });

    // Отправляем данные по мере получения
    await streamChatCompletion(
      messages,
      (chunk) => {
        // Формат SSE: data: <content>\n\n
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      },
      {
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens ?? 1000,
        topP,
        topK,
        frequencyPenalty,
        presencePenalty,
      }
    );

    // Отправляем сигнал о завершении
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    // Устанавливаем CORS заголовки перед отправкой ошибки
    const origin = req.headers.origin;
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    // Отправляем ошибку через SSE
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

/**
 * POST /api/chat/completion
 * Расширенный метод для работы с несколькими сообщениями
 * 
 * Body:
 * {
 *   "messages": [
 *     { "role": "system", "content": "Ты помощник" },
 *     { "role": "user", "content": "Привет" },
 *     { "role": "assistant", "content": "Привет! Чем могу помочь?" },
 *     { "role": "user", "content": "Расскажи о Node.js" }
 *   ],
 *   "temperature": 0.7,
 *   "max_tokens": 1000
 * }
 */
router.post('/chat/completion', async (req, res, next) => {
  try {
    const { messages, temperature, max_tokens, model } = req.body;

    // Валидация массива сообщений
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Поле "messages" должно быть непустым массивом',
        },
      });
    }

    // Валидация структуры сообщений
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Каждое сообщение должно содержать "role" и "content"',
          },
        });
      }
      if (!['system', 'user', 'assistant'].includes(msg.role)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Роль должна быть: "system", "user" или "assistant"',
          },
        });
      }
    }

    const response = await chatCompletion(messages, {
      model: model || 'gpt-4o-mini',
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 1000,
    });

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
