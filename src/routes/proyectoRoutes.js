const express = require('express');
const router = express.Router();

const ProyectoController = require('../controllers/proyectoController');
const CostoController = require('../controllers/costoController');
const {
  validarProyecto,
  validarId,
  validarProyectoId,
  validarTipoCosto,
  obtenerValidacionesPorTipo
} = require('../middleware/validationMiddleware');

// ==================== RUTAS DE PROYECTOS ====================

// GET /api/proyectos - Obtener todos los proyectos
router.get('/', ProyectoController.obtenerProyectos);

// POST /api/proyectos - Crear un nuevo proyecto
router.post('/', validarProyecto, ProyectoController.crearProyecto);

// GET /api/proyectos/:id - Obtener proyecto por ID
router.get('/:id', validarId, ProyectoController.obtenerProyectoPorId);

// GET /api/proyectos/:id/resumen - Obtener resumen completo del proyecto
router.get('/:id/resumen', validarId, ProyectoController.obtenerResumenCompleto);

// PUT /api/proyectos/:id - Actualizar proyecto
router.put('/:id', [...validarId, ...validarProyecto], ProyectoController.actualizarProyecto);

// DELETE /api/proyectos/:id - Eliminar proyecto
router.delete('/:id', validarId, ProyectoController.eliminarProyecto);

// POST /api/proyectos/:id/actualizar-resumen - Actualizar resumen de costos
router.post('/:id/actualizar-resumen', validarId, ProyectoController.actualizarResumen);

// ==================== RUTAS DE COSTOS ====================

// Middleware para validar dinámicamente según el tipo de costo
const validarCostoDinamico = (req, res, next) => {
  const { tipoCosto } = req.params;
  const validaciones = obtenerValidacionesPorTipo(tipoCosto);
  
  if (validaciones.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Tipo de costo no válido'
      }
    });
  }
  
  // Ejecutar validaciones
  Promise.all(validaciones.map(validation => validation.run(req)))
    .then(() => next())
    .catch(next);
};

// GET /api/proyectos/:proyectoId/costos/:tipoCosto - Obtener costos por tipo
router.get(
  '/:proyectoId/costos/:tipoCosto',
  [...validarProyectoId, ...validarTipoCosto],
  CostoController.obtenerCostosPorProyecto
);

// POST /api/proyectos/:proyectoId/costos/:tipoCosto - Crear nuevo costo
router.post(
  '/:proyectoId/costos/:tipoCosto',
  [...validarProyectoId, ...validarTipoCosto, validarCostoDinamico],
  CostoController.crearCosto
);

// GET /api/proyectos/:proyectoId/costos/:tipoCosto/:id - Obtener costo específico
router.get(
  '/:proyectoId/costos/:tipoCosto/:id',
  [...validarProyectoId, ...validarTipoCosto, ...validarId],
  CostoController.obtenerCostoPorId
);

// PUT /api/proyectos/:proyectoId/costos/:tipoCosto/:id - Actualizar costo
router.put(
  '/:proyectoId/costos/:tipoCosto/:id',
  [...validarProyectoId, ...validarTipoCosto, ...validarId, validarCostoDinamico],
  CostoController.actualizarCosto
);

// DELETE /api/proyectos/:proyectoId/costos/:tipoCosto/:id - Eliminar costo
router.delete(
  '/:proyectoId/costos/:tipoCosto/:id',
  [...validarProyectoId, ...validarTipoCosto, ...validarId],
  CostoController.eliminarCosto
);

module.exports = router;