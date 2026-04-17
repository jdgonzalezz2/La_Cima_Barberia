function errorHandler(err, req, res, next) {
  console.error('❌ Error no manejado:', err);

  // Error de validación de express-validator ya fue manejado upstream
  if (err.isJoi) {
    return res.status(400).json({ error: err.details[0].message });
  }

  // Error de PostgreSQL: violación de UNIQUE (cruce de agenda)
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Conflicto de datos: el recurso ya existe o el horario está ocupado',
      detail: err.detail,
    });
  }

  // Error de FK violation
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referencia a un recurso que no existe' });
  }

  // Error de check constraint
  if (err.code === '23514') {
    return res.status(400).json({ error: 'Valor fuera del rango permitido' });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
