// Middleware para rutas no encontradas
const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware para manejo de errores
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Error de MySQL - Clave duplicada
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 400;
    message = 'Ya existe un registro con estos datos';
  }

  // Error de MySQL - Clave foránea
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Referencia inválida - El registro padre no existe';
  }

  // Error de MySQL - Violación de restricción
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    statusCode = 400;
    message = 'No se puede eliminar - Existen registros dependientes';
  }

  // Error de validación
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Datos de entrada inválidos';
  }

  // Error de conexión a la base de datos
  if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Error de conexión a la base de datos';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        code: err.code 
      })
    }
  });
};

module.exports = {
  notFound,
  errorHandler
};