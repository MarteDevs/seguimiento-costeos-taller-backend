const { testConnection } = require('./src/config/database');

async function testDatabaseConnection() {
    console.log('🔍 Probando conexión a la base de datos...');
    
    try {
        await testConnection();
        console.log('✅ Conexión a la base de datos exitosa');
        
        // Probar una consulta simple
        const { executeQuery } = require('./src/config/database');
        const result = await executeQuery('SELECT 1 as test');
        console.log('✅ Consulta de prueba exitosa:', result);
        
        // Verificar que las tablas existen
        const tables = await executeQuery('SHOW TABLES');
        console.log('📋 Tablas disponibles en la base de datos:');
        tables.forEach(table => {
            console.log(`   - ${Object.values(table)[0]}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la conexión a la base de datos:', error.message);
        console.error('💡 Verifica que:');
        console.error('   - MySQL esté ejecutándose en 127.0.0.1:3306');
        console.error('   - El usuario "root" tenga la contraseña "marte"');
        console.error('   - La base de datos "db_costeos_seguimiento" exista');
        console.error('   - El archivo .env esté configurado correctamente');
        process.exit(1);
    }
}

testDatabaseConnection();