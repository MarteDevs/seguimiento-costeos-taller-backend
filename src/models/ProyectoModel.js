const { executeQuery, executeTransaction } = require('../config/database');

class ProyectoModel {
  // Crear un nuevo proyecto
  static async crear(proyectoData) {
    const {
      fecha,
      nombre_del_proyecto,
      mina,
      equipo,
      habilitado_estimado,
      días_trabajados,
      números_de_trabajadores_por_dia,
      numero_de_tareas_por_dia
    } = proyectoData;

    const query = `
      INSERT INTO tb_descripción_trabajo 
      (fecha, nombre_del_proyecto, mina, equipo, habilitado_estimado, 
       días_trabajados, números_de_trabajadores_por_dia, numero_de_tareas_por_dia)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      fecha,
      nombre_del_proyecto,
      mina,
      equipo,
      habilitado_estimado,
      días_trabajados,
      números_de_trabajadores_por_dia,
      numero_de_tareas_por_dia
    ];

    const result = await executeQuery(query, params);
    return result.insertId;
  }

  // Obtener todos los proyectos
  static async obtenerTodos() {
    const query = `
      SELECT 
        dt.*,
        rp.costo_fijo,
        rp.costo_variable,
        rp.costo_directo,
        rp.costo_indirecto,
        rp.costo_total,
        rp.costo_total_igv
      FROM tb_descripción_trabajo dt
      LEFT JOIN tb_resumen_proyecto rp ON dt.id = rp.descripcion_trabajo_id
      ORDER BY dt.fecha DESC
    `;

    return await executeQuery(query);
  }

  // Obtener proyecto por ID
  static async obtenerPorId(id) {
    const query = `
      SELECT 
        dt.*,
        rp.costo_fijo,
        rp.costo_variable,
        rp.costo_directo,
        rp.costo_indirecto,
        rp.costo_total,
        rp.costo_total_igv
      FROM tb_descripción_trabajo dt
      LEFT JOIN tb_resumen_proyecto rp ON dt.id = rp.descripcion_trabajo_id
      WHERE dt.id = ?
    `;

    const result = await executeQuery(query, [id]);
    return result[0];
  }

  // Actualizar proyecto
  static async actualizar(id, proyectoData) {
    const {
      fecha,
      nombre_del_proyecto,
      mina,
      equipo,
      habilitado_estimado,
      días_trabajados,
      números_de_trabajadores_por_dia,
      numero_de_tareas_por_dia
    } = proyectoData;

    const query = `
      UPDATE tb_descripción_trabajo 
      SET fecha = ?, nombre_del_proyecto = ?, mina = ?, equipo = ?,
          habilitado_estimado = ?, días_trabajados = ?, 
          números_de_trabajadores_por_dia = ?, numero_de_tareas_por_dia = ?
      WHERE id = ?
    `;

    const params = [
      fecha,
      nombre_del_proyecto,
      mina,
      equipo,
      habilitado_estimado,
      días_trabajados,
      números_de_trabajadores_por_dia,
      numero_de_tareas_por_dia,
      id
    ];

    const result = await executeQuery(query, params);
    return result.affectedRows > 0;
  }

  // Eliminar proyecto
  static async eliminar(id) {
    const query = 'DELETE FROM tb_descripción_trabajo WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  // Obtener resumen completo del proyecto con todos los costos
  static async obtenerResumenCompleto(id) {
    const queries = [
      // Información básica del proyecto
      {
        query: `SELECT * FROM tb_descripción_trabajo WHERE id = ?`,
        params: [id]
      },
      // Mano de obra
      {
        query: `SELECT * FROM tb_mano_de_obra WHERE descripcion_trabajo_id = ?`,
        params: [id]
      },
      // Costos locales
      {
        query: `SELECT * FROM tb_local WHERE descripcion_trabajo_id = ?`,
        params: [id]
      },
      // Vigilancia
      {
        query: `SELECT * FROM tb_vigilancia WHERE descripcion_trabajo_id = ?`,
        params: [id]
      },
      // Energía
      {
        query: `SELECT * FROM tb_energia WHERE descripcion_trabajo_id = ?`,
        params: [id]
      },
      // Herramientas y otros
      {
        query: `SELECT * FROM tb_herramientos_otros WHERE descripcion_trabajo_id = ?`,
        params: [id]
      },
      // Materiales
      {
        query: `SELECT * FROM tb_materiales WHERE descripcion_trabajo_id = ?`,
        params: [id]
      },
      // Implementos de seguridad
      {
        query: `SELECT * FROM tb_implementos_seguridad WHERE descripcion_trabajo_id = ?`,
        params: [id]
      },
      // Petróleo
      {
        query: `SELECT * FROM tb_petroleo WHERE descripcion_trabajo_id = ?`,
        params: [id]
      },
      // Gasolina
      {
        query: `SELECT * FROM tb_gasolina WHERE descripcion_trabajo_id = ?`,
        params: [id]
      },
      // Tópico
      {
        query: `SELECT * FROM tb_topico WHERE descripcion_trabajo_id = ?`,
        params: [id]
      },
      // Equipo otro
      {
        query: `SELECT * FROM tb_equipo_otro WHERE descripcion_trabajo_id = ?`,
        params: [id]
      },
      // Resumen del proyecto
      {
        query: `SELECT * FROM tb_resumen_proyecto WHERE descripcion_trabajo_id = ?`,
        params: [id]
      }
    ];

    const results = await Promise.all(
      queries.map(({ query, params }) => executeQuery(query, params))
    );

    return {
      proyecto: results[0][0],
      mano_de_obra: results[1],
      local: results[2],
      vigilancia: results[3],
      energia: results[4],
      herramientos_otros: results[5],
      materiales: results[6],
      implementos_seguridad: results[7],
      petroleo: results[8],
      gasolina: results[9],
      topico: results[10],
      equipo_otro: results[11],
      resumen: results[12][0]
    };
  }

  // Actualizar resumen del proyecto
  static async actualizarResumen(id) {
    const query = 'CALL sp_actualizar_resumen(?)';
    return await executeQuery(query, [id]);
  }
}

module.exports = ProyectoModel;