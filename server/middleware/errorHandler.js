/**
 * Middleware для обработки ошибок
 */

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Определяем статус код ошибки
  const statusCode = err.statusCode || 500;
  
  // Определяем сообщение об ошибке
  const message = err.message || 'Внутренняя ошибка сервера';

  // Отправляем ответ с ошибкой
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
