const { body, param } = require('express-validator');

// Validaciones para proyectos
const validarProyecto = [
  body('fecha')
    .notEmpty()
    .withMessage('La fecha es requerida')
    .isISO8601()
    .withMessage('La fecha debe tener un formato válido (YYYY-MM-DD)'),
  
  body('nombre_del_proyecto')
    .notEmpty()
    .withMessage('El nombre del proyecto es requerido')
    .isLength({ min: 3, max: 200 })
    .withMessage('El nombre del proyecto debe tener entre 3 y 200 caracteres'),
  
  body('mina')
    .optional()
    .isLength({ max: 200 })
    .withMessage('El nombre de la mina no puede exceder 200 caracteres'),
  
  body('equipo')
    .optional()
    .isLength({ max: 150 })
    .withMessage('El nombre del equipo no puede exceder 150 caracteres'),
  
  body('habilitado_estimado')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El habilitado estimado debe ser un número entero positivo'),
  
  body('días_trabajados')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Los días trabajados deben ser un número entero positivo'),
  
  body('números_de_trabajadores_por_dia')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El número de trabajadores por día debe ser un número entero positivo'),
  
  body('numero_de_tareas_por_dia')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El número de tareas por día debe ser un número entero positivo')
];

// Validaciones para mano de obra
const validarManoDeObra = [
  body('trabajador')
    .notEmpty()
    .withMessage('El nombre del trabajador es requerido')
    .isLength({ min: 2, max: 200 })
    .withMessage('El nombre del trabajador debe tener entre 2 y 200 caracteres'),
  
  body('cantidad_trabajador')
    .notEmpty()
    .withMessage('La cantidad de trabajadores es requerida')
    .isInt({ min: 1 })
    .withMessage('La cantidad de trabajadores debe ser un número entero mayor a 0'),
  
  body('precio')
    .notEmpty()
    .withMessage('El precio es requerido')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  
  body('dias_trabajados')
    .notEmpty()
    .withMessage('Los días trabajados son requeridos')
    .isInt({ min: 0 })
    .withMessage('Los días trabajados deben ser un número entero positivo')
];

// Validaciones para costos con promedio y precio unitario
const validarCostoConPromedio = [
  body('descripcion')
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 3, max: 300 })
    .withMessage('La descripción debe tener entre 3 y 300 caracteres'),
  
  body('promedio')
    .notEmpty()
    .withMessage('El promedio es requerido')
    .isFloat({ min: 0 })
    .withMessage('El promedio debe ser un número positivo'),
  
  body('precio_unitario')
    .notEmpty()
    .withMessage('El precio unitario es requerido')
    .isFloat({ min: 0 })
    .withMessage('El precio unitario debe ser un número positivo'),
  
  body('dias_trabajados')
    .notEmpty()
    .withMessage('Los días trabajados son requeridos')
    .isInt({ min: 0 })
    .withMessage('Los días trabajados deben ser un número entero positivo')
];

// Validaciones para materiales
const validarMateriales = [
  body('descripcion')
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 3, max: 300 })
    .withMessage('La descripción debe tener entre 3 y 300 caracteres'),
  
  body('cantidad')
    .notEmpty()
    .withMessage('La cantidad es requerida')
    .isFloat({ min: 0 })
    .withMessage('La cantidad debe ser un número positivo'),
  
  body('unidad')
    .notEmpty()
    .withMessage('La unidad es requerida')
    .isLength({ min: 1, max: 50 })
    .withMessage('La unidad debe tener entre 1 y 50 caracteres'),
  
  body('precio_unitario')
    .notEmpty()
    .withMessage('El precio unitario es requerido')
    .isFloat({ min: 0 })
    .withMessage('El precio unitario debe ser un número positivo'),
  
  body('cantidad_usado')
    .notEmpty()
    .withMessage('La cantidad usada es requerida')
    .isFloat({ min: 0 })
    .withMessage('La cantidad usada debe ser un número positivo')
];

// Validaciones para implementos de seguridad
const validarImplementosSeguridad = [
  body('descripcion')
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 3, max: 300 })
    .withMessage('La descripción debe tener entre 3 y 300 caracteres'),
  
  body('cantidad')
    .notEmpty()
    .withMessage('La cantidad es requerida')
    .isInt({ min: 0 })
    .withMessage('La cantidad debe ser un número entero positivo'),
  
  body('precio_unitario')
    .notEmpty()
    .withMessage('El precio unitario es requerido')
    .isFloat({ min: 0 })
    .withMessage('El precio unitario debe ser un número positivo'),
  
  body('dias_trabajados')
    .notEmpty()
    .withMessage('Los días trabajados son requeridos')
    .isInt({ min: 0 })
    .withMessage('Los días trabajados deben ser un número entero positivo')
];

// Validaciones para costos con cantidad y precio unitario
const validarCostoConCantidad = [
  body('descripcion')
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 3, max: 300 })
    .withMessage('La descripción debe tener entre 3 y 300 caracteres'),
  
  body('cantidad')
    .notEmpty()
    .withMessage('La cantidad es requerida')
    .isFloat({ min: 0 })
    .withMessage('La cantidad debe ser un número positivo'),
  
  body('precio_unitario')
    .notEmpty()
    .withMessage('El precio unitario es requerido')
    .isFloat({ min: 0 })
    .withMessage('El precio unitario debe ser un número positivo'),
  
  body('dias_trabajados')
    .notEmpty()
    .withMessage('Los días trabajados son requeridos')
    .isInt({ min: 0 })
    .withMessage('Los días trabajados deben ser un número entero positivo')
];

// Validación de parámetros de ID
const validarId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
];

const validarProyectoId = [
  param('proyectoId')
    .isInt({ min: 1 })
    .withMessage('El ID del proyecto debe ser un número entero positivo')
];

// Validación de tipo de costo
const validarTipoCosto = [
  param('tipoCosto')
    .isIn([
      'mano-obra', 'local', 'vigilancia', 'energia', 'herramientas-otros',
      'materiales', 'implementos-seguridad', 'petroleo', 'gasolina',
      'topico', 'equipo-otro'
    ])
    .withMessage('Tipo de costo inválido')
];

// Función para obtener validaciones según el tipo de costo
const obtenerValidacionesPorTipo = (tipoCosto) => {
  switch (tipoCosto) {
    case 'mano-obra':
      return validarManoDeObra;
    case 'materiales':
      return validarMateriales;
    case 'implementos-seguridad':
      return validarImplementosSeguridad;
    case 'local':
    case 'vigilancia':
    case 'energia':
    case 'herramientas-otros':
      return validarCostoConPromedio;
    case 'petroleo':
    case 'gasolina':
    case 'topico':
    case 'equipo-otro':
      return validarCostoConCantidad;
    default:
      return [];
  }
};

module.exports = {
  validarProyecto,
  validarManoDeObra,
  validarCostoConPromedio,
  validarMateriales,
  validarImplementosSeguridad,
  validarCostoConCantidad,
  validarId,
  validarProyectoId,
  validarTipoCosto,
  obtenerValidacionesPorTipo
};