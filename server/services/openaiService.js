/**
 * Сервис для работы с OpenAI API через LangChain
 * Инкапсулирует всю логику взаимодействия с OpenAI
 */

import { ChatOpenAI } from '@langchain/openai';

// Константы
const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1000;
const BOTHUB_BASE_URL = 'https://bothub.chat/api/v2/openai/v1';

// Инициализация клиента LangChain OpenAI с API ключом из переменных окружения
const createLangChainClient = (options = {}) => {
  const {
    modelName = DEFAULT_MODEL,
    temperature = DEFAULT_TEMPERATURE,
    maxTokens = DEFAULT_MAX_TOKENS,
    topP,
    topK,
    frequencyPenalty,
    presencePenalty,
  } = options;

  const clientConfig = {
    modelName,
    temperature,
    maxTokens,
    openAIApiKey: process.env.OPENAI_API_KEY,
    configuration: {
      baseURL: BOTHUB_BASE_URL,
    },
  };

  // Добавляем опциональные параметры, если они указаны
  if (topP !== undefined) clientConfig.topP = topP;
  if (topK !== undefined) clientConfig.topK = topK;
  if (frequencyPenalty !== undefined) clientConfig.frequencyPenalty = frequencyPenalty;
  if (presencePenalty !== undefined) clientConfig.presencePenalty = presencePenalty;

  return new ChatOpenAI(clientConfig);
};

/**
 * Преобразование сообщений из формата OpenAI в формат LangChain
 * @param {Array} messages - Массив сообщений в формате OpenAI [{role, content}]
 * @returns {Array} Массив сообщений в формате LangChain [["role", "content"]]
 */
const convertMessagesToLangChainFormat = (messages) => {
  return messages.map((msg) => {
    // LangChain использует "human" вместо "user"
    const role = msg.role === 'user' ? 'human' : msg.role;
    return [role, msg.content];
  });
};

/**
 * Преобразование сообщений из формата LangChain в формат OpenAI
 * @param {Array} langChainMessages - Массив сообщений в формате LangChain [["role", "content"]]
 * @returns {Array} Массив сообщений в формате OpenAI [{role, content}]
 */
const convertMessagesFromLangChainFormat = (langChainMessages) => {
  return langChainMessages.map(([role, content]) => {
    // LangChain использует "human" вместо "user"
    const normalizedRole = role === 'human' ? 'user' : role;
    return { role: normalizedRole, content };
  });
};

/**
 * Обработка ошибок OpenAI API
 * @param {Error} error - Ошибка от API
 * @throws {Error} Обработанная ошибка с понятным сообщением
 */
const handleOpenAIError = (error) => {
  const status = error.status || error.statusCode;
  
  if (status === 401) {
    throw new Error('Неверный API ключ OpenAI');
  } else if (status === 429) {
    throw new Error('Превышен лимит запросов. Попробуйте позже.');
  } else if (status === 500) {
    throw new Error('Ошибка сервера OpenAI. Попробуйте позже.');
  } else {
    throw new Error(`Ошибка OpenAI API: ${error.message}`);
  }
};

/**
 * Отправка сообщения в ChatGPT и получение ответа
 * @param {Array} messages - Массив сообщений в формате OpenAI [{role, content}]
 * @param {Object} options - Дополнительные опции (temperature, max_tokens и т.д.)
 * @returns {Promise<Object>} Ответ от API в формате OpenAI
 */
export const chatCompletion = async (messages, options = {}) => {
  try {
    const {
      model = DEFAULT_MODEL,
      temperature = DEFAULT_TEMPERATURE,
      max_tokens = DEFAULT_MAX_TOKENS,
      topP,
      topK,
      frequencyPenalty,
      presencePenalty,
    } = options;

    // Создаем клиент с нужными параметрами
    const llm = createLangChainClient({
      modelName: model,
      temperature,
      maxTokens: max_tokens,
      topP,
      topK,
      frequencyPenalty,
      presencePenalty,
    });

    // Преобразуем сообщения в формат LangChain
    const langChainMessages = convertMessagesToLangChainFormat(messages);

    // Делаем запрос через LangChain
    const response = await llm.invoke(langChainMessages);

    // Возвращаем ответ в формате, совместимом с OpenAI API
    return {
      choices: [
        {
          message: {
            role: 'assistant',
            content: response.content,
          },
        },
      ],
      model,
    };
  } catch (error) {
    // Обрабатываем и пробрасываем ошибку дальше
    handleOpenAIError(error);
  }
};

/**
 * Простой метод для отправки одного сообщения пользователя
 * @param {string} userMessage - Сообщение пользователя
 * @param {string} systemPrompt - Системный промпт (опционально)
 * @param {Object} options - Дополнительные опции
 * @returns {Promise<string>} Текст ответа от AI
 */
export const sendMessage = async (userMessage, systemPrompt = null, options = {}) => {
  const {
    model = DEFAULT_MODEL,
    temperature = DEFAULT_TEMPERATURE,
    max_tokens = DEFAULT_MAX_TOKENS,
    topP,
    topK,
    frequencyPenalty,
    presencePenalty,
  } = options;

  // Создаем клиент с нужными параметрами
  const llm = createLangChainClient({
    modelName: model,
    temperature,
    maxTokens: max_tokens,
    topP,
    topK,
    frequencyPenalty,
    presencePenalty,
  });

  // Формируем сообщения в формате LangChain
  const langChainMessages = [];
  if (systemPrompt) {
    langChainMessages.push(['system', systemPrompt]);
  }
  langChainMessages.push(['human', userMessage]);

  // Делаем запрос через LangChain
  const response = await llm.invoke(langChainMessages);
  
  // Возвращаем текст ответа
  return response.content;
};

/**
 * Стриминг ответа для лучшего UX
 * @param {Array} messages - Массив сообщений в формате OpenAI [{role, content}]
 * @param {Function} onChunk - Callback функция для обработки каждого чанка
 * @param {Object} options - Дополнительные опции
 * @returns {Promise<void>}
 */
export const streamChatCompletion = async (messages, onChunk, options = {}) => {
  try {
    const {
      model = DEFAULT_MODEL,
      temperature = DEFAULT_TEMPERATURE,
      max_tokens = DEFAULT_MAX_TOKENS,
      topP,
      topK,
      frequencyPenalty,
      presencePenalty,
    } = options;

    // Создаем клиент с нужными параметрами
    const llm = createLangChainClient({
      modelName: model,
      temperature,
      maxTokens: max_tokens,
      topP,
      topK,
      frequencyPenalty,
      presencePenalty,
    });

    // Преобразуем сообщения в формат LangChain
    const langChainMessages = convertMessagesToLangChainFormat(messages);

    // Получаем стрим от LangChain
    const stream = await llm.stream(langChainMessages);

    // Обрабатываем каждый чанк из стрима
    for await (const chunk of stream) {
      const content = chunk.content || '';
      if (content) {
        onChunk(content);
      }
    }
  } catch (error) {
    handleOpenAIError(error);
  }
};
