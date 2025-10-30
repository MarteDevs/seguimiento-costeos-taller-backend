const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'marte',
  database: process.env.DB_NAME || 'seguimiento-costeos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // mysql2 options: use connectTimeout for connection timeout
  connectTimeout: 60000
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    console.log(`📊 Base de datos: ${dbConfig.database}`);
    console.log(`🌐 Host: ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
    return false;
  }
};

// Función para ejecutar consultas
const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Error en consulta SQL:', error.message);
    throw error;
  }
};

// Función para ejecutar transacciones
const executeTransaction = async (queries) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params || []);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  testConnection,
  executeQuery,
  executeTransaction
};