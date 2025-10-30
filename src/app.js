const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const proyectoRoutes = require('./routes/proyectoRoutes');
const seguimientoRoutes = require('./routes/seguimientoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad y utilidades
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas principales
app.use('/api/proyectos', proyectoRoutes);
// Rutas de seguimiento (definen rutas absolutas /api/... dentro del router)
app.use(seguimientoRoutes);

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Middleware de manejo de errores
app.use(notFound);
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api`);
  console.log(`💚 Health check en http://localhost:${PORT}/health`);
});

module.exports = app;