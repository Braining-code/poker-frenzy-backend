function errorHandler(err, req, res, next) {
  console.error('❌ Error:', {
    message: err.message,
    status: err.statusCode || 500,
    timestamp: new Date(),
    path: req.path
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err.details
    })
  });
}

module.exports = errorHandler;
