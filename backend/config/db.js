const mysql = require('mysql2/promise');
require('dotenv').config();

// Patrón SINGLETON: Asegura que solo exista una única instancia del pool de conexiones en toda la aplicación
class Database {
  constructor() {
    if (!Database.instance) {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'logistica_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      // Comprobación asíncrona inicial de la conexión
      (async () => {
        try {
          const connection = await this.pool.getConnection();
          console.log('Conexión exitosa a la base de datos MySQL (Singleton).');
          connection.release();
        } catch (error) {
          console.error('Error crítico al conectar a MySQL:', error.message);
        }
      })();

      Database.instance = this;
    }

    return Database.instance;
  }

  getPool() {
    return this.pool;
  }
}

// Exportar directamente el pool de la instancia Singleton para mantener la compatibilidad hacia atrás
const instance = new Database();
module.exports = instance.getPool();
