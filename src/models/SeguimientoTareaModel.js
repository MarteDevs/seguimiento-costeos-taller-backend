const { executeQuery } = require('../config/database');

class SeguimientoTareaModel {
  static async crear(descripcionTrabajoId, data) {
    const { fecha, dia, tareas_realizadas, observaciones } = data;
    const query = `
      INSERT INTO tb_seguimiento_tareas 
      (descripcion_trabajo_id, fecha, dia, tareas_realizadas, observaciones)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [descripcionTrabajoId, fecha, dia, tareas_realizadas, observaciones || null];
    const result = await executeQuery(query, params);
    return result.insertId;
  }

  static async obtenerPorProyecto(descripcionTrabajoId) {
    const query = `
      SELECT * 
      FROM tb_seguimiento_tareas 
      WHERE descripcion_trabajo_id = ? 
      ORDER BY fecha ASC, dia ASC
    `;
    return await executeQuery(query, [descripcionTrabajoId]);
  }

  static async obtenerPorId(id) {
    const query = `SELECT * FROM tb_seguimiento_tareas WHERE id = ?`;
    const result = await executeQuery(query, [id]);
    return result[0];
  }

  static async actualizar(id, data) {
    const campos = Object.keys(data);
    const valores = Object.values(data);
    if (campos.length === 0) return false;
    const setClauses = campos.map(c => `${c} = ?`).join(', ');
    const query = `UPDATE tb_seguimiento_tareas SET ${setClauses} WHERE id = ?`;
    const result = await executeQuery(query, [...valores, id]);
    return result.affectedRows > 0;
  }

  static async eliminar(id) {
    const query = `DELETE FROM tb_seguimiento_tareas WHERE id = ?`;
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = SeguimientoTareaModel;