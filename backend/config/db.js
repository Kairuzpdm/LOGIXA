const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración del pool de conexión
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'logistica_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Comprobar la conexión inicial de forma asíncrona
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('⚡ Conexión exitosa a la base de datos MySQL en XAMPP.');
    connection.release();
  } catch (error) {
    console.error('❌ Error crítico al conectar a MySQL:', error.message);
    console.error('👉 Asegúrate de que XAMPP esté encendido y que el servicio de MySQL esté corriendo.');
  }
})();

module.exports = pool;
