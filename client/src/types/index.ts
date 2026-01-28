/**
 * Типы для приложения чата
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatSettings {
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export const DEFAULT_SETTINGS: ChatSettings = {
  systemPrompt: 'Ты полезный и дружелюбный ассистент. Отвечай кратко и по делу.',
  temperature: 0.7,
  maxTokens: 1000,
  topP: 1.0,
  topK: 0,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
};
