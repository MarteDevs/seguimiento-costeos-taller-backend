const ProyectoModel = require('../models/ProyectoModel');
const { validationResult } = require('express-validator');

class ProyectoController {
  // Crear un nuevo proyecto
  static async crearProyecto(req, res, next) {
    try {
      // Validar datos de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Datos de entrada inválidos',
            details: errors.array()
          }
        });
      }

      const proyectoId = await ProyectoModel.crear(req.body);
      
      // Obtener el proyecto creado
      const proyecto = await ProyectoModel.obtenerPorId(proyectoId);

      res.status(201).json({
        success: true,
        message: 'Proyecto creado exitosamente',
        data: {
          id: proyectoId,
          proyecto
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener todos los proyectos
  static async obtenerProyectos(req, res, next) {
    try {
      const proyectos = await ProyectoModel.obtenerTodos();

      res.status(200).json({
        success: true,
        message: 'Proyectos obtenidos exitosamente',
        data: {
          proyectos,
          total: proyectos.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener proyecto por ID
  static async obtenerProyectoPorId(req, res, next) {
    try {
      const { id } = req.params;
      const proyecto = await ProyectoModel.obtenerPorId(id);

      if (!proyecto) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Proyecto no encontrado'
          }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Proyecto obtenido exitosamente',
        data: {
          proyecto
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener resumen completo del proyecto
  static async obtenerResumenCompleto(req, res, next) {
    try {
      const { id } = req.params;
      const resumen = await ProyectoModel.obtenerResumenCompleto(id);

      if (!resumen.proyecto) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Proyecto no encontrado'
          }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Resumen completo obtenido exitosamente',
        data: resumen
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar proyecto
  static async actualizarProyecto(req, res, next) {
    try {
      // Validar datos de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Datos de entrada inválidos',
            details: errors.array()
          }
        });
      }

      const { id } = req.params;
      const actualizado = await ProyectoModel.actualizar(id, req.body);

      if (!actualizado) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Proyecto no encontrado'
          }
        });
      }

      // Obtener el proyecto actualizado
      const proyecto = await ProyectoModel.obtenerPorId(id);

      res.status(200).json({
        success: true,
        message: 'Proyecto actualizado exitosamente',
        data: {
          proyecto
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar proyecto
  static async eliminarProyecto(req, res, next) {
    try {
      const { id } = req.params;
      
      // Verificar que el proyecto existe
      const proyecto = await ProyectoModel.obtenerPorId(id);
      if (!proyecto) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Proyecto no encontrado'
          }
        });
      }

      const eliminado = await ProyectoModel.eliminar(id);

      if (!eliminado) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'No se pudo eliminar el proyecto'
          }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Proyecto eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar resumen de costos del proyecto
  static async actualizarResumen(req, res, next) {
    try {
      const { id } = req.params;
      
      // Verificar que el proyecto existe
      const proyecto = await ProyectoModel.obtenerPorId(id);
      if (!proyecto) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Proyecto no encontrado'
          }
        });
      }

      await ProyectoModel.actualizarResumen(id);
      
      // Obtener el resumen actualizado
      const resumen = await ProyectoModel.obtenerPorId(id);

      res.status(200).json({
        success: true,
        message: 'Resumen de costos actualizado exitosamente',
        data: {
          proyecto: resumen
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProyectoController;