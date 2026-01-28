import { useState } from 'react';
import { DEFAULT_SETTINGS } from '../types';
import type { ChatSettings } from '../types';
import './SettingsPanel.css';

interface SettingsPanelProps {
  settings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel = ({
  settings,
  onSettingsChange,
  isOpen,
  onClose,
}: SettingsPanelProps) => {
  const [localSettings, setLocalSettings] = useState<ChatSettings>(settings);

  const handleChange = (key: keyof ChatSettings, value: string | number) => {
    const newSettings = {
      ...localSettings,
      [key]: Number(value),
    };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    onSettingsChange(DEFAULT_SETTINGS);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Настройки AI</h2>
          <button className="close-button" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <label className="settings-label">
              <span>Системный промпт</span>
              <textarea
                className="settings-textarea"
                value={localSettings.systemPrompt}
                onChange={(e) => handleChange('systemPrompt', e.target.value)}
                placeholder="Опишите роль и поведение AI..."
                rows={4}
              />
            </label>
          </div>

          <div className="settings-section">
            <h3>Параметры генерации</h3>
            
            <label className="settings-label">
              <span>Temperature: {localSettings.temperature.toFixed(1)}</span>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={localSettings.temperature}
                onChange={(e) => handleChange('temperature', e.target.value)}
                className="settings-slider"
              />
              <small>Контролирует случайность ответов (0 = детерминированный, 2 = очень креативный)</small>
            </label>

            <label className="settings-label">
              <span>Max Tokens: {localSettings.maxTokens}</span>
              <input
                type="range"
                min="100"
                max="4000"
                step="100"
                value={localSettings.maxTokens}
                onChange={(e) => handleChange('maxTokens', e.target.value)}
                className="settings-slider"
              />
              <small>Максимальная длина ответа</small>
            </label>

            <label className="settings-label">
              <span>Top P: {localSettings.topP.toFixed(1)}</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={localSettings.topP}
                onChange={(e) => handleChange('topP', e.target.value)}
                className="settings-slider"
              />
              <small>Nucleus sampling - вероятность выбора токенов</small>
            </label>

            <label className="settings-label">
              <span>Top K: {localSettings.topK}</span>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={localSettings.topK}
                onChange={(e) => handleChange('topK', e.target.value)}
                className="settings-slider"
              />
              <small>Ограничение количества рассматриваемых токенов (0 = без ограничения)</small>
            </label>

            <label className="settings-label">
              <span>Frequency Penalty: {localSettings.frequencyPenalty.toFixed(1)}</span>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={localSettings.frequencyPenalty}
                onChange={(e) => handleChange('frequencyPenalty', e.target.value)}
                className="settings-slider"
              />
              <small>Штраф за повторение токенов</small>
            </label>

            <label className="settings-label">
              <span>Presence Penalty: {localSettings.presencePenalty.toFixed(1)}</span>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={localSettings.presencePenalty}
                onChange={(e) => handleChange('presencePenalty', e.target.value)}
                className="settings-slider"
              />
              <small>Штраф за использование новых тем</small>
            </label>
          </div>

          <div className="settings-actions">
            <button className="reset-button" onClick={handleReset}>
              Сбросить к умолчаниям
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
