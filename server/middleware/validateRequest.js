/**
 * Middleware для валидации запросов
 */

export const validateChatRequest = (req, res, next) => {
  const { message } = req.body;

  // Проверяем наличие сообщения
  if (!message) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Поле "message" обязательно для заполнения',
      },
    });
  }

  // Проверяем тип сообщения
  if (typeof message !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Поле "message" должно быть строкой',
      },
    });
  }

  // Проверяем длину сообщения
  if (message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Сообщение не может быть пустым',
      },
    });
  }

  // Ограничиваем максимальную длину сообщения
  if (message.length > 10000) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Сообщение слишком длинное (максимум 10000 символов)',
      },
    });
  }

  next();
};
