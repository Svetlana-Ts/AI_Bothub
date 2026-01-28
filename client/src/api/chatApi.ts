/**
 * API клиент для работы с сервером чата
 */

// В production на Render.com клиент и сервер на одном домене, используем относительный путь
// В development можно использовать VITE_API_URL для указания другого сервера
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ChatRequest {
  message: string;
  systemPrompt?: string;
  temperature?: number;
  max_tokens?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface ChatResponse {
  success: boolean;
  data: {
    message: string;
    model: string;
  };
}

/**
 * Отправка сообщения и получение ответа
 */
export const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Ошибка при отправке сообщения');
  }

  return response.json();
};

/**
 * Отправка сообщения с стримингом ответа
 */
export const streamChatMessage = async (
  request: ChatRequest,
  onChunk: (chunk: string) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Ошибка при подключении к стриму');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Не удалось получить reader для стрима');
    }

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete?.();
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.error) {
              onError?.(new Error(data.error));
              return;
            }
            
            if (data.content) {
              onChunk(data.content);
            }
            
            if (data.done) {
              onComplete?.();
              return;
            }
          } catch (e) {
            // Игнорируем ошибки парсинга отдельных строк
          }
        }
      }
    }
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error('Неизвестная ошибка'));
  }
};
