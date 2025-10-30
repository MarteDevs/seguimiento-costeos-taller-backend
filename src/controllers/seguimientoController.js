const { validationResult } = require('express-validator');
const ProyectoModel = require('../models/ProyectoModel');
const SeguimientoTareaModel = require('../models/SeguimientoTareaModel');
const SeguimientoMaterialModel = require('../models/SeguimientoMaterialModel');
const { executeQuery } = require('../config/database');
const { generarManifiesto } = require('../services/pdfService');
const { generarManifiestoExcel } = require('../services/excelService');

class SeguimientoController {
  static async crearSeguimientoTarea(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: { message: 'Datos de entrada inválidos', details: errors.array() } });
      }

      const { id } = req.params; // proyecto id
      const proyecto = await ProyectoModel.obtenerPorId(id);
      if (!proyecto) {
        return res.status(404).json({ success: false, error: { message: 'Proyecto no encontrado' } });
      }

      const seguimientoId = await SeguimientoTareaModel.crear(id, req.body);
      const seguimiento = await SeguimientoTareaModel.obtenerPorId(seguimientoId);
      return res.status(201).json({ success: true, message: 'Seguimiento de tareas creado', data: { id: seguimientoId, seguimiento } });
    } catch (err) { next(err); }
  }

  static async obtenerSeguimientoTareas(req, res, next) {
    try {
      const { id } = req.params;
      const proyecto = await ProyectoModel.obtenerPorId(id);
      if (!proyecto) return res.status(404).json({ success: false, error: { message: 'Proyecto no encontrado' } });
      const seguimientos = await SeguimientoTareaModel.obtenerPorProyecto(id);
      return res.status(200).json({ success: true, message: 'Seguimientos de tareas obtenidos', data: { seguimientos, total: seguimientos.length } });
    } catch (err) { next(err); }
  }

  static async actualizarSeguimientoTarea(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: { message: 'Datos de entrada inválidos', details: errors.array() } });
      }
      const { id, seguimientoId } = req.params;
      const proyecto = await ProyectoModel.obtenerPorId(id);
      if (!proyecto) return res.status(404).json({ success: false, error: { message: 'Proyecto no encontrado' } });
      const actualizado = await SeguimientoTareaModel.actualizar(seguimientoId, req.body);
      if (!actualizado) return res.status(404).json({ success: false, error: { message: 'Seguimiento no encontrado' } });
      const seguimiento = await SeguimientoTareaModel.obtenerPorId(seguimientoId);
      return res.status(200).json({ success: true, message: 'Seguimiento actualizado', data: { seguimiento } });
    } catch (err) { next(err); }
  }

  static async eliminarSeguimientoTarea(req, res, next) {
    try {
      const { id, seguimientoId } = req.params;
      const proyecto = await ProyectoModel.obtenerPorId(id);
      if (!proyecto) return res.status(404).json({ success: false, error: { message: 'Proyecto no encontrado' } });
      const eliminado = await SeguimientoTareaModel.eliminar(seguimientoId);
      if (!eliminado) return res.status(404).json({ success: false, error: { message: 'Seguimiento no encontrado' } });
      return res.status(200).json({ success: true, message: 'Seguimiento eliminado exitosamente' });
    } catch (err) { next(err); }
  }

  static async registrarUsoMaterial(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: { message: 'Datos de entrada inválidos', details: errors.array() } });
      }
      const { id, materialId } = req.params;
      const proyecto = await ProyectoModel.obtenerPorId(id);
      if (!proyecto) return res.status(404).json({ success: false, error: { message: 'Proyecto no encontrado' } });

      const logId = await SeguimientoMaterialModel.registrarUso(id, materialId, req.body);
      // Obtener material actualizado
      const materialRows = await executeQuery('SELECT * FROM tb_materiales WHERE id = ?', [materialId]);
      const material = materialRows[0];
      return res.status(201).json({ success: true, message: 'Uso de material registrado', data: { id: logId, material } });
    } catch (err) { next(err); }
  }

  static async obtenerLogsMateriales(req, res, next) {
    try {
      const { id } = req.params;
      const proyecto = await ProyectoModel.obtenerPorId(id);
      if (!proyecto) return res.status(404).json({ success: false, error: { message: 'Proyecto no encontrado' } });
      const logs = await SeguimientoMaterialModel.obtenerLogsPorProyecto(id);
      return res.status(200).json({ success: true, message: 'Logs de materiales obtenidos', data: { logs, total: logs.length } });
    } catch (err) { next(err); }
  }

  static async obtenerLogsMaterial(req, res, next) {
    try {
      const { id, materialId } = req.params;
      const proyecto = await ProyectoModel.obtenerPorId(id);
      if (!proyecto) return res.status(404).json({ success: false, error: { message: 'Proyecto no encontrado' } });
      const logs = await SeguimientoMaterialModel.obtenerLogsPorMaterial(id, materialId);
      return res.status(200).json({ success: true, message: 'Logs de material obtenidos', data: { logs, total: logs.length } });
    } catch (err) { next(err); }
  }

  static async obtenerAvanceProyecto(req, res, next) {
    try {
      const { id } = req.params;
      const proyecto = await ProyectoModel.obtenerPorId(id);
      if (!proyecto) return res.status(404).json({ success: false, error: { message: 'Proyecto no encontrado' } });

      // Avance en días y tareas
      const seguimientos = await SeguimientoTareaModel.obtenerPorProyecto(id);
      const diasTotales = proyecto['días_trabajados'] || 0;
      const tareasPorDia = proyecto['numero_de_tareas_por_dia'] || 0;
      const tareasTotales = diasTotales * tareasPorDia;
      const diasReportados = new Set(seguimientos.map(s => s.dia)).size;
      const tareasRealizadas = seguimientos.reduce((acc, s) => acc + (s.tareas_realizadas || 0), 0);
      const avanceDiasPct = diasTotales > 0 ? Math.min(100, Math.round((diasReportados / diasTotales) * 100)) : 0;
      const avanceTareasPct = tareasTotales > 0 ? Math.min(100, Math.round((tareasRealizadas / tareasTotales) * 100)) : 0;

      // Avance en materiales
      const materiales = await executeQuery('SELECT id, descripcion, cantidad, cantidad_usado FROM tb_materiales WHERE descripcion_trabajo_id = ?', [id]);
      const avancesMateriales = materiales.map(m => {
        const ratio = m.cantidad > 0 ? (parseFloat(m.cantidad_usado) / parseFloat(m.cantidad)) : 0;
        return {
          id: m.id,
          descripcion: m.descripcion,
          cantidad_total: m.cantidad,
          cantidad_usado: m.cantidad_usado,
          avance_pct: Math.min(100, Math.round(ratio * 100))
        };
      });
      const avanceMaterialesPct = avancesMateriales.length > 0 ? Math.round(avancesMateriales.reduce((acc, m) => acc + m.avance_pct, 0) / avancesMateriales.length) : 0;

      return res.status(200).json({
        success: true,
        message: 'Avance del proyecto obtenido',
        data: {
          dias: { diasTotales, diasReportados, avanceDiasPct },
          tareas: { tareasTotales, tareasRealizadas, avanceTareasPct },
          materiales: { avanceMaterialesPct, detalle: avancesMateriales }
        }
      });
    } catch (err) { next(err); }
  }

  static async generarManifiestoPDF(req, res, next) {
    try {
      const { id } = req.params;
      const proyecto = await ProyectoModel.obtenerPorId(id);
      if (!proyecto) return res.status(404).json({ success: false, error: { message: 'Proyecto no encontrado' } });

      // Resumen del proyecto
      const resumenRows = await executeQuery('SELECT * FROM tb_resumen_proyecto WHERE descripcion_trabajo_id = ?', [id]);
      const resumen = resumenRows[0] || {};

      // Avance (reutiliza la lógica de obtenerAvanceProyecto)
      const seguimientos = await SeguimientoTareaModel.obtenerPorProyecto(id);
      const diasTotales = proyecto['días_trabajados'] || 0;
      const tareasPorDia = proyecto['numero_de_tareas_por_dia'] || 0;
      const tareasTotales = diasTotales * tareasPorDia;
      const diasReportados = new Set(seguimientos.map(s => s.dia)).size;
      const tareasRealizadas = seguimientos.reduce((acc, s) => acc + (s.tareas_realizadas || 0), 0);
      const avanceDiasPct = diasTotales > 0 ? Math.min(100, Math.round((diasReportados / diasTotales) * 100)) : 0;
      const avanceTareasPct = tareasTotales > 0 ? Math.min(100, Math.round((tareasRealizadas / tareasTotales) * 100)) : 0;
      const materiales = await executeQuery('SELECT id, descripcion, cantidad, cantidad_usado FROM tb_materiales WHERE descripcion_trabajo_id = ?', [id]);
      const avancesMateriales = materiales.map(m => {
        const ratio = m.cantidad > 0 ? (parseFloat(m.cantidad_usado) / parseFloat(m.cantidad)) : 0;
        return { id: m.id, descripcion: m.descripcion, cantidad_total: m.cantidad, cantidad_usado: m.cantidad_usado, avance_pct: Math.min(100, Math.round(ratio * 100)) };
      });
      const avanceMaterialesPct = avancesMateriales.length > 0 ? Math.round(avancesMateriales.reduce((acc, m) => acc + m.avance_pct, 0) / avancesMateriales.length) : 0;
      const avance = {
        dias: { diasTotales, diasReportados, avanceDiasPct },
        tareas: { tareasTotales, tareasRealizadas, avanceTareasPct },
        materiales: { avanceMaterialesPct, detalle: avancesMateriales }
      };

      // Logs de materiales para el detalle
      const logsMateriales = await SeguimientoMaterialModel.obtenerLogsPorProyecto(id);

      // Desglose de costos por tipo (subtotales por tabla)
      const sumQuery = async (table, column = 'total') => {
        const rows = await executeQuery(`SELECT ROUND(COALESCE(SUM(${column}),0),2) AS total FROM ${table} WHERE descripcion_trabajo_id = ?`, [id]);
        const val = rows[0]?.total;
        return typeof val === 'number' ? val : Number(val || 0);
      };

      const desglose = {
        fijo: [
          { tipo: 'mano-obra', total: await sumQuery('tb_mano_de_obra', 'sub_total') },
          { tipo: 'local', total: await sumQuery('tb_local') },
          { tipo: 'vigilancia', total: await sumQuery('tb_vigilancia') },
          { tipo: 'energia', total: await sumQuery('tb_energia') },
          { tipo: 'herramientas-otros', total: await sumQuery('tb_herramientos_otros') }
        ],
        variable: [
          { tipo: 'materiales', total: await sumQuery('tb_materiales') },
          { tipo: 'implementos-seguridad', total: await sumQuery('tb_implementos_seguridad') },
          { tipo: 'petroleo', total: await sumQuery('tb_petroleo') },
          { tipo: 'gasolina', total: await sumQuery('tb_gasolina') },
          { tipo: 'topico', total: await sumQuery('tb_topico') },
          { tipo: 'equipo-otro', total: await sumQuery('tb_equipo_otro') }
        ]
      };

      // Detalle completo por tipo (todos los registros del proyecto)
      const detalles = {
        'mano-obra': await executeQuery(
          'SELECT trabajador, cantidad_trabajador, precio, dias_trabajados, sub_total FROM tb_mano_de_obra WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        ),
        'local': await executeQuery(
          'SELECT descripcion, promedio, precio_unitario, dias_trabajados, total FROM tb_local WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        ),
        'vigilancia': await executeQuery(
          'SELECT descripcion, promedio, precio_unitario, dias_trabajados, total FROM tb_vigilancia WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        ),
        'energia': await executeQuery(
          'SELECT descripcion, promedio, precio_unitario, dias_trabajados, total FROM tb_energia WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        ),
        'herramientas-otros': await executeQuery(
          'SELECT descripcion, promedio, precio_unitario, dias_trabajados, total FROM tb_herramientos_otros WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        ),
        'materiales': await executeQuery(
          'SELECT descripcion, cantidad, unidad, precio_unitario, total FROM tb_materiales WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        ),
        'implementos-seguridad': await executeQuery(
          'SELECT descripcion, cantidad, precio_unitario, dias_trabajados, total FROM tb_implementos_seguridad WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        ),
        'petroleo': await executeQuery(
          'SELECT descripcion, cantidad, precio_unitario, dias_trabajados, total FROM tb_petroleo WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        ),
        'gasolina': await executeQuery(
          'SELECT descripcion, cantidad, precio_unitario, dias_trabajados, total FROM tb_gasolina WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        ),
        'topico': await executeQuery(
          'SELECT descripcion, cantidad, precio_unitario, dias_trabajados, total FROM tb_topico WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        ),
        'equipo-otro': await executeQuery(
          'SELECT descripcion, cantidad, precio_unitario, dias_trabajados, total FROM tb_equipo_otro WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        )
      };

      // Series temporales (físico por seguimientos diarios, financiero por costos creados)
      const toISODate = (d) => {
        try { return new Date(d).toISOString().slice(0,10); } catch { return d; }
      };

      // Físico: acumulado tareas realizadas / tareasTotales
      const tareasByDate = new Map();
      seguimientos.forEach(s => {
        const key = toISODate(s.fecha || s.created_at);
        const val = Number(s.tareas_realizadas || 0);
        tareasByDate.set(key, (tareasByDate.get(key) || 0) + val);
      });
      const datesFisico = Array.from(tareasByDate.keys()).sort();
      let accTareas = 0;
      const seriesFisico = datesFisico.map(date => {
        accTareas += tareasByDate.get(date);
        const pct = tareasTotales > 0 ? Math.min(100, Math.round((accTareas / tareasTotales) * 100)) : 0;
        return { date, pct };
      });

      // Financiero: acumulado total por fecha (sumando todas las tablas)
      const sumByDate = async (table, column = 'total') => {
        const rows = await executeQuery(
          `SELECT DATE(created_at) AS fecha, ROUND(COALESCE(SUM(${column}),0),2) AS total FROM ${table} WHERE descripcion_trabajo_id = ? GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC`,
          [id]
        );
        return rows.map(r => ({ date: toISODate(r.fecha), total: Number(r.total || 0) }));
      };

      const financieroSets = [
        ...await sumByDate('tb_mano_de_obra', 'sub_total'),
        ...await sumByDate('tb_local'),
        ...await sumByDate('tb_vigilancia'),
        ...await sumByDate('tb_energia'),
        ...await sumByDate('tb_herramientos_otros'),
        ...await sumByDate('tb_materiales'),
        ...await sumByDate('tb_implementos_seguridad'),
        ...await sumByDate('tb_petroleo'),
        ...await sumByDate('tb_gasolina'),
        ...await sumByDate('tb_topico'),
        ...await sumByDate('tb_equipo_otro')
      ];
      const financieroMap = new Map();
      financieroSets.forEach(({ date, total }) => {
        financieroMap.set(date, (financieroMap.get(date) || 0) + total);
      });
      const datesFinanciero = Array.from(financieroMap.keys()).sort();
      let accFin = 0;
      const presupuesto = Number(proyecto.habilitado_estimado || 0);
      const seriesFinanciero = datesFinanciero.map(date => {
        accFin += financieroMap.get(date);
        const pct = presupuesto > 0 ? Math.min(100, Math.round((accFin / presupuesto) * 100)) : 0;
        return { date, pct, monto: accFin };
      });

      const series = { fisico: seriesFisico, financiero: seriesFinanciero };

      const pdfBuffer = await generarManifiesto(proyecto, resumen, avance, logsMateriales, desglose, detalles, series);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=manifiesto-proyecto-${id}.pdf`);
      return res.status(200).send(pdfBuffer);
    } catch (err) { next(err); }
  }

  static async generarManifiestoExcel(req, res, next) {
    try {
      const { id } = req.params;
      const proyecto = await ProyectoModel.obtenerPorId(id);
      if (!proyecto) return res.status(404).json({ success: false, error: { message: 'Proyecto no encontrado' } });

      // Resumen del proyecto
      const resumenRows = await executeQuery('SELECT * FROM tb_resumen_proyecto WHERE descripcion_trabajo_id = ?', [id]);
      const resumen = resumenRows[0] || {};

      // Avance (igual que PDF)
      const seguimientos = await SeguimientoTareaModel.obtenerPorProyecto(id);
      const diasTotales = proyecto['días_trabajados'] || 0;
      const tareasPorDia = proyecto['numero_de_tareas_por_dia'] || 0;
      const tareasTotales = diasTotales * tareasPorDia;
      const diasReportados = new Set(seguimientos.map(s => s.dia)).size;
      const tareasRealizadas = seguimientos.reduce((acc, s) => acc + (s.tareas_realizadas || 0), 0);
      const avanceDiasPct = diasTotales > 0 ? Math.min(100, Math.round((diasReportados / diasTotales) * 100)) : 0;
      const avanceTareasPct = tareasTotales > 0 ? Math.min(100, Math.round((tareasRealizadas / tareasTotales) * 100)) : 0;
      const materiales = await executeQuery('SELECT id, descripcion, cantidad, cantidad_usado FROM tb_materiales WHERE descripcion_trabajo_id = ?', [id]);
      const avancesMateriales = materiales.map(m => {
        const ratio = m.cantidad > 0 ? (parseFloat(m.cantidad_usado) / parseFloat(m.cantidad)) : 0;
        return { id: m.id, descripcion: m.descripcion, cantidad_total: m.cantidad, cantidad_usado: m.cantidad_usado, avance_pct: Math.min(100, Math.round(ratio * 100)) };
      });
      const avanceMaterialesPct = avancesMateriales.length > 0 ? Math.round(avancesMateriales.reduce((acc, m) => acc + m.avance_pct, 0) / avancesMateriales.length) : 0;
      const avance = {
        dias: { diasTotales, diasReportados, avanceDiasPct },
        tareas: { tareasTotales, tareasRealizadas, avanceTareasPct },
        materiales: { avanceMaterialesPct, detalle: avancesMateriales }
      };

      // Logs de materiales
      const logsMateriales = await SeguimientoMaterialModel.obtenerLogsPorProyecto(id);

      // Desglose por tipo
      const sumQuery = async (table, column = 'total') => {
        const rows = await executeQuery(`SELECT ROUND(COALESCE(SUM(${column}),0),2) AS total FROM ${table} WHERE descripcion_trabajo_id = ?`, [id]);
        const val = rows[0]?.total;
        return typeof val === 'number' ? val : Number(val || 0);
      };

      const desglose = {
        fijo: [
          { tipo: 'mano-obra', total: await sumQuery('tb_mano_de_obra', 'sub_total') },
          { tipo: 'local', total: await sumQuery('tb_local') },
          { tipo: 'vigilancia', total: await sumQuery('tb_vigilancia') },
          { tipo: 'energia', total: await sumQuery('tb_energia') },
          { tipo: 'herramientas-otros', total: await sumQuery('tb_herramientos_otros') }
        ],
        variable: [
          { tipo: 'materiales', total: await sumQuery('tb_materiales') },
          { tipo: 'implementos-seguridad', total: await sumQuery('tb_implementos_seguridad') },
          { tipo: 'petroleo', total: await sumQuery('tb_petroleo') },
          { tipo: 'gasolina', total: await sumQuery('tb_gasolina') },
          { tipo: 'topico', total: await sumQuery('tb_topico') },
          { tipo: 'equipo-otro', total: await sumQuery('tb_equipo_otro') }
        ]
      };

      // Detalles por tipo
      const detalles = {
        'mano-obra': await executeQuery(
          'SELECT trabajador, cantidad_trabajador, precio, dias_trabajados, sub_total FROM tb_mano_de_obra WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        ),
        'local': await executeQuery(
          'SELECT descripcion, promedio, precio_unitario, dias_trabajados, total FROM tb_local WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        ),
        'vigilancia': await executeQuery(
          'SELECT descripcion, promedio, precio_unitario, dias_trabajados, total FROM tb_vigilancia WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        ),
        'energia': await executeQuery(
          'SELECT descripcion, promedio, precio_unitario, dias_trabajados, total FROM tb_energia WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        ),
        'herramientas-otros': await executeQuery(
          'SELECT descripcion, promedio, precio_unitario, dias_trabajados, total FROM tb_herramientos_otros WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        ),
        'materiales': await executeQuery(
          'SELECT descripcion, cantidad, unidad, precio_unitario, total FROM tb_materiales WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        ),
        'implementos-seguridad': await executeQuery(
          'SELECT descripcion, cantidad, precio_unitario, dias_trabajados, total FROM tb_implementos_seguridad WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        ),
        'petroleo': await executeQuery(
          'SELECT descripcion, cantidad, precio_unitario, dias_trabajados, total FROM tb_petroleo WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        ),
        'gasolina': await executeQuery(
          'SELECT descripcion, cantidad, precio_unitario, dias_trabajados, total FROM tb_gasolina WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        ),
        'topico': await executeQuery(
          'SELECT descripcion, cantidad, precio_unitario, dias_trabajados, total FROM tb_topico WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        ),
        'equipo-otro': await executeQuery(
          'SELECT descripcion, cantidad, precio_unitario, dias_trabajados, total FROM tb_equipo_otro WHERE descripcion_trabajo_id = ? ORDER BY id ASC',
          [id]
        )
      };

      // Series temporales
      const toISODate = (d) => { try { return new Date(d).toISOString().slice(0,10); } catch { return d; } };
      const tareasByDate = new Map();
      seguimientos.forEach(s => {
        const key = toISODate(s.fecha || s.created_at);
        const val = Number(s.tareas_realizadas || 0);
        tareasByDate.set(key, (tareasByDate.get(key) || 0) + val);
      });
      const datesFisico = Array.from(tareasByDate.keys()).sort();
      let accTareas = 0;
      const seriesFisico = datesFisico.map(date => {
        accTareas += tareasByDate.get(date);
        const pct = tareasTotales > 0 ? Math.min(100, Math.round((accTareas / tareasTotales) * 100)) : 0;
        return { date, pct };
      });
      const sumByDate = async (table, column = 'total') => {
        const rows = await executeQuery(
          `SELECT DATE(created_at) AS fecha, ROUND(COALESCE(SUM(${column}),0),2) AS total FROM ${table} WHERE descripcion_trabajo_id = ? GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC`,
          [id]
        );
        return rows.map(r => ({ date: toISODate(r.fecha), total: Number(r.total || 0) }));
      };
      const financieroSets = [
        ...await sumByDate('tb_mano_de_obra', 'sub_total'),
        ...await sumByDate('tb_local'),
        ...await sumByDate('tb_vigilancia'),
        ...await sumByDate('tb_energia'),
        ...await sumByDate('tb_herramientos_otros'),
        ...await sumByDate('tb_materiales'),
        ...await sumByDate('tb_implementos_seguridad'),
        ...await sumByDate('tb_petroleo'),
        ...await sumByDate('tb_gasolina'),
        ...await sumByDate('tb_topico'),
        ...await sumByDate('tb_equipo_otro')
      ];
      const financieroMap = new Map();
      financieroSets.forEach(({ date, total }) => { financieroMap.set(date, (financieroMap.get(date) || 0) + total); });
      const datesFinanciero = Array.from(financieroMap.keys()).sort();
      let accFin = 0; const presupuesto = Number(proyecto.habilitado_estimado || 0);
      const seriesFinanciero = datesFinanciero.map(date => {
        accFin += financieroMap.get(date);
        const pct = presupuesto > 0 ? Math.min(100, Math.round((accFin / presupuesto) * 100)) : 0;
        return { date, pct, monto: accFin };
      });
      const series = { fisico: seriesFisico, financiero: seriesFinanciero };

      const xlsxBuffer = await generarManifiestoExcel(proyecto, resumen, avance, logsMateriales, desglose, detalles, series);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=manifiesto-proyecto-${id}.xlsx`);
      return res.status(200).send(xlsxBuffer);
    } catch (err) { next(err); }
  }
}

module.exports = SeguimientoController;