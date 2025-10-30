const { executeQuery, pool } = require('../config/database');

class SeguimientoMaterialModel {
  static async registrarUso(descripcionTrabajoId, materialId, data) {
    const { fecha, cantidad_usada, comentario } = data;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Verificar material del proyecto
      const [matRows] = await connection.execute(
        `SELECT id FROM tb_materiales WHERE id = ? AND descripcion_trabajo_id = ?`,
        [materialId, descripcionTrabajoId]
      );
      const material = matRows[0];
      if (!material) {
        await connection.rollback();
        const err = new Error('Material no pertenece al proyecto');
        err.statusCode = 404;
        throw err;
      }

      // Insertar log de uso
      const [insertLog] = await connection.execute(
        `INSERT INTO tb_seguimiento_materiales (descripcion_trabajo_id, material_id, fecha, cantidad_usada, comentario) VALUES (?, ?, ?, ?, ?)`,
        [descripcionTrabajoId, materialId, fecha, cantidad_usada, comentario || null]
      );

      // Actualizar acumulado en materiales
      await connection.execute(
        `UPDATE tb_materiales SET cantidad_usado = cantidad_usado + ? WHERE id = ? AND descripcion_trabajo_id = ?`,
        [cantidad_usada, materialId, descripcionTrabajoId]
      );

      await connection.commit();
      return insertLog.insertId;
    } catch (error) {
      try { await connection.rollback(); } catch (_) {}
      throw error;
    } finally {
      connection.release();
    }
  }

  static async obtenerLogsPorProyecto(descripcionTrabajoId) {
    const query = `
      SELECT sm.*, m.descripcion AS material_descripcion, m.unidad, m.cantidad AS cantidad_total, m.cantidad_usado AS cantidad_usado_total
      FROM tb_seguimiento_materiales sm
      JOIN tb_materiales m ON m.id = sm.material_id
      WHERE sm.descripcion_trabajo_id = ?
      ORDER BY sm.fecha ASC, sm.id ASC
    `;
    return await executeQuery(query, [descripcionTrabajoId]);
  }

  static async obtenerLogsPorMaterial(descripcionTrabajoId, materialId) {
    const query = `
      SELECT sm.*
      FROM tb_seguimiento_materiales sm
      WHERE sm.descripcion_trabajo_id = ? AND sm.material_id = ?
      ORDER BY sm.fecha ASC, sm.id ASC
    `;
    return await executeQuery(query, [descripcionTrabajoId, materialId]);
  }
}

module.exports = SeguimientoMaterialModel;