import { useState, useCallback } from 'react';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { SettingsPanel } from './components/SettingsPanel';
import { streamChatMessage } from './api/chatApi';
import { DEFAULT_SETTINGS } from './types';
import type {  Message, ChatSettings } from './types';
import './App.css';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    let fullResponse = '';

    try {
      await streamChatMessage(
        {
          message: content,
          systemPrompt: settings.systemPrompt || undefined,
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
          topP: settings.topP,
          topK: settings.topK > 0 ? settings.topK : undefined,
          frequencyPenalty: settings.frequencyPenalty,
          presencePenalty: settings.presencePenalty,
        },
        (chunk) => {
          fullResponse += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: fullResponse }
                : msg
            )
          );
        },
        (error) => {
          console.error('Stream error:', error);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? {
                    ...msg,
                    content: `Ошибка: ${error.message}`,
                    isStreaming: false,
                  }
                : msg
            )
          );
          setIsLoading(false);
        },
        () => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: `Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
                isStreaming: false,
              }
            : msg
        )
      );
      setIsLoading(false);
    }
  }, [settings, isLoading]);

  const handleClearChat = () => {
    if (window.confirm('Вы уверены, что хотите очистить историю чата?')) {
      setMessages([]);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="title-icon">🤖</span>
            Vibe Chat
          </h1>
          <div className="header-actions">
            <button
              className="header-button"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Настройки"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
              </svg>
            </button>
            <button
              className="header-button"
              onClick={handleClearChat}
              aria-label="Очистить чат"
              disabled={messages.length === 0}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <MessageList messages={messages} />
        <MessageInput
          onSend={handleSendMessage}
          disabled={isLoading}
          placeholder={isLoading ? 'AI думает...' : 'Введите сообщение...'}
        />
      </main>

      <SettingsPanel
        settings={settings}
        onSettingsChange={setSettings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
