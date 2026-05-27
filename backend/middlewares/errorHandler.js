// Middleware centralizado de manejo de errores
// Evita repetir bloques try/catch repetitivos en controladores al centralizar las capturas

const errorHandler = (err, req, res, next) => {
  console.error('Error detectado en el servidor:', err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Ocurrió un error interno en el servidor';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    // Solo enviamos el stack en desarrollo si fuera necesario, para producción lo evitamos
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
