const express = require('express');
const { body, param } = require('express-validator');
const SeguimientoController = require('../controllers/seguimientoController');

const router = express.Router();

// Validaciones comunes
const validateProyectoId = [param('id').isInt({ min: 1 }).withMessage('id de proyecto inválido')];
const validateSeguimientoId = [param('seguimientoId').isInt({ min: 1 }).withMessage('id de seguimiento inválido')];
const validateMaterialId = [param('materialId').isInt({ min: 1 }).withMessage('id de material inválido')];

// Tareas - crear seguimiento diario
router.post(
  '/api/proyectos/:id/seguimiento/tareas',
  [
    ...validateProyectoId,
    body('fecha').isISO8601().withMessage('fecha debe ser ISO8601'),
    body('dia').isInt({ min: 1 }).withMessage('dia debe ser entero >= 1'),
    body('tareas_realizadas').isInt({ min: 0 }).withMessage('tareas_realizadas debe ser entero >= 0'),
    body('comentario').optional({ nullable: true }).isString().trim().isLength({ max: 500 })
  ],
  SeguimientoController.crearSeguimientoTarea
);

// Tareas - obtener
router.get('/api/proyectos/:id/seguimiento/tareas', validateProyectoId, SeguimientoController.obtenerSeguimientoTareas);

// Tareas - actualizar
router.put(
  '/api/proyectos/:id/seguimiento/tareas/:seguimientoId',
  [
    ...validateProyectoId,
    ...validateSeguimientoId,
    body('fecha').optional().isISO8601().withMessage('fecha debe ser ISO8601'),
    body('dia').optional().isInt({ min: 1 }).withMessage('dia debe ser entero >= 1'),
    body('tareas_realizadas').optional().isInt({ min: 0 }).withMessage('tareas_realizadas debe ser entero >= 0'),
    body('comentario').optional({ nullable: true }).isString().trim().isLength({ max: 500 })
  ],
  SeguimientoController.actualizarSeguimientoTarea
);

// Tareas - eliminar
router.delete(
  '/api/proyectos/:id/seguimiento/tareas/:seguimientoId',
  [...validateProyectoId, ...validateSeguimientoId],
  SeguimientoController.eliminarSeguimientoTarea
);

// Materiales - registrar uso
router.post(
  '/api/proyectos/:id/seguimiento/materiales/:materialId/uso',
  [
    ...validateProyectoId,
    ...validateMaterialId,
    body('fecha').isISO8601().withMessage('fecha debe ser ISO8601'),
    body('cantidad_usada').isFloat({ gt: 0 }).withMessage('cantidad_usada debe ser > 0'),
    body('comentario').optional({ nullable: true }).isString().trim().isLength({ max: 500 })
  ],
  SeguimientoController.registrarUsoMaterial
);

// Materiales - logs
router.get('/api/proyectos/:id/seguimiento/materiales', validateProyectoId, SeguimientoController.obtenerLogsMateriales);
router.get('/api/proyectos/:id/seguimiento/materiales/:materialId', [...validateProyectoId, ...validateMaterialId], SeguimientoController.obtenerLogsMaterial);

// Avance
router.get('/api/proyectos/:id/seguimiento/avance', validateProyectoId, SeguimientoController.obtenerAvanceProyecto);

// PDF Manifiesto
router.get('/api/proyectos/:id/seguimiento/manifiesto.pdf', validateProyectoId, SeguimientoController.generarManifiestoPDF);

module.exports = router;