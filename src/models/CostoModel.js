const { executeQuery } = require('../config/database');

class CostoModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  // Crear un nuevo registro de costo
  async crear(descripcionTrabajoId, costoData) {
    const campos = Object.keys(costoData);
    const valores = Object.values(costoData);
    
    const query = `
      INSERT INTO ${this.tableName} 
      (descripcion_trabajo_id, ${campos.join(', ')})
      VALUES (?, ${campos.map(() => '?').join(', ')})
    `;

    const params = [descripcionTrabajoId, ...valores];
    const result = await executeQuery(query, params);
    return result.insertId;
  }

  // Obtener todos los registros por proyecto
  async obtenerPorProyecto(descripcionTrabajoId) {
    const query = `SELECT * FROM ${this.tableName} WHERE descripcion_trabajo_id = ? ORDER BY created_at DESC`;
    return await executeQuery(query, [descripcionTrabajoId]);
  }

  // Obtener registro por ID
  async obtenerPorId(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const result = await executeQuery(query, [id]);
    return result[0];
  }

  // Actualizar registro
  async actualizar(id, costoData) {
    const campos = Object.keys(costoData);
    const valores = Object.values(costoData);
    
    const setClauses = campos.map(campo => `${campo} = ?`).join(', ');
    const query = `UPDATE ${this.tableName} SET ${setClauses} WHERE id = ?`;
    
    const params = [...valores, id];
    const result = await executeQuery(query, params);
    return result.affectedRows > 0;
  }

  // Eliminar registro
  async eliminar(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  // Obtener total de costos por proyecto
  async obtenerTotalPorProyecto(descripcionTrabajoId) {
    let totalColumn = 'total';
    
    // Para mano de obra, el campo total se llama sub_total
    if (this.tableName === 'tb_mano_de_obra') {
      totalColumn = 'sub_total';
    }
    
    const query = `
      SELECT COALESCE(SUM(${totalColumn}), 0) as total 
      FROM ${this.tableName} 
      WHERE descripcion_trabajo_id = ?
    `;
    
    const result = await executeQuery(query, [descripcionTrabajoId]);
    return parseFloat(result[0].total) || 0;
  }
}

// Instancias específicas para cada tabla
const ManoDeObraModel = new CostoModel('tb_mano_de_obra');
const LocalModel = new CostoModel('tb_local');
const VigilanciaModel = new CostoModel('tb_vigilancia');
const EnergiaModel = new CostoModel('tb_energia');
const HerramientosOtrosModel = new CostoModel('tb_herramientos_otros');
const MaterialesModel = new CostoModel('tb_materiales');
const ImplementosSeguridadModel = new CostoModel('tb_implementos_seguridad');
const PetroleoModel = new CostoModel('tb_petroleo');
const GasolinaModel = new CostoModel('tb_gasolina');
const TopicoModel = new CostoModel('tb_topico');
const EquipoOtroModel = new CostoModel('tb_equipo_otro');

module.exports = {
  CostoModel,
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
};