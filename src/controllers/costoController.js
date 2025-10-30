const {
  ManoDeObraModel,
  LocalModel,
  VigilanciaModel,
  EnergiaModel,
  HerramientosOtrosModel,
  MaterialesModel,
  ImplementosSeguridadModel,
  PetroleoModel,
  GasolinaModel,
  TopicoModel,
  EquipoOtroModel
} = require('../models/CostoModel');
const ProyectoModel = require('../models/ProyectoModel');
const { validationResult } = require('express-validator');

// Mapeo de tipos de costo a sus modelos correspondientes
const modelMap = {
  'mano-obra': ManoDeObraModel,
  'local': LocalModel,
  'vigilancia': VigilanciaModel,
  'energia': EnergiaModel,
  'herramientas-otros': HerramientosOtrosModel,
  'materiales': MaterialesModel,
  'implementos-seguridad': ImplementosSeguridadModel,
  'petroleo': PetroleoModel,
  'gasolina': GasolinaModel,
  'topico': TopicoModel,
  'equipo-otro': EquipoOtroModel
};

class CostoController {
  // Crear un nuevo registro de costo
  static async crearCosto(req, res, next) {
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

      const { proyectoId, tipoCosto } = req.params;
      const model = modelMap[tipoCosto];

      if (!model) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Tipo de costo inválido'
          }
        });
      }

      // Verificar que el proyecto existe
      const proyecto = await ProyectoModel.obtenerPorId(proyectoId);
      if (!proyecto) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Proyecto no encontrado'
          }
        });
      }

      const costoId = await model.crear(proyectoId, req.body);
      
      // Actualizar resumen del proyecto
      await ProyectoModel.actualizarResumen(proyectoId);
      
      // Obtener el registro creado
      const costo = await model.obtenerPorId(costoId);

      res.status(201).json({
        success: true,
        message: `${tipoCosto} creado exitosamente`,
        data: {
          id: costoId,
          costo
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener todos los costos de un tipo específico para un proyecto
  static async obtenerCostosPorProyecto(req, res, next) {
    try {
      const { proyectoId, tipoCosto } = req.params;
      const model = modelMap[tipoCosto];

      if (!model) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Tipo de costo inválido'
          }
        });
      }

      // Verificar que el proyecto existe
      const proyecto = await ProyectoModel.obtenerPorId(proyectoId);
      if (!proyecto) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Proyecto no encontrado'
          }
        });
      }

      const costos = await model.obtenerPorProyecto(proyectoId);
      const total = await model.obtenerTotalPorProyecto(proyectoId);

      res.status(200).json({
        success: true,
        message: `${tipoCosto} obtenidos exitosamente`,
        data: {
          costos,
          total: costos.length,
          totalCosto: total
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener un costo específico por ID
  static async obtenerCostoPorId(req, res, next) {
    try {
      const { tipoCosto, id } = req.params;
      const model = modelMap[tipoCosto];

      if (!model) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Tipo de costo inválido'
          }
        });
      }

      const costo = await model.obtenerPorId(id);

      if (!costo) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Registro de costo no encontrado'
          }
        });
      }

      res.status(200).json({
        success: true,
        message: `${tipoCosto} obtenido exitosamente`,
        data: {
          costo
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar un registro de costo
  static async actualizarCosto(req, res, next) {
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

      const { proyectoId, tipoCosto, id } = req.params;
      const model = modelMap[tipoCosto];

      if (!model) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Tipo de costo inválido'
          }
        });
      }

      const actualizado = await model.actualizar(id, req.body);

      if (!actualizado) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Registro de costo no encontrado'
          }
        });
      }

      // Actualizar resumen del proyecto
      await ProyectoModel.actualizarResumen(proyectoId);
      
      // Obtener el registro actualizado
      const costo = await model.obtenerPorId(id);

      res.status(200).json({
        success: true,
        message: `${tipoCosto} actualizado exitosamente`,
        data: {
          costo
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar un registro de costo
  static async eliminarCosto(req, res, next) {
    try {
      const { proyectoId, tipoCosto, id } = req.params;
      const model = modelMap[tipoCosto];

      if (!model) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Tipo de costo inválido'
          }
        });
      }

      // Verificar que el registro existe
      const costo = await model.obtenerPorId(id);
      if (!costo) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Registro de costo no encontrado'
          }
        });
      }

      const eliminado = await model.eliminar(id);

      if (!eliminado) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'No se pudo eliminar el registro de costo'
          }
        });
      }

      // Actualizar resumen del proyecto
      await ProyectoModel.actualizarResumen(proyectoId);

      res.status(200).json({
        success: true,
        message: `${tipoCosto} eliminado exitosamente`
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CostoController;