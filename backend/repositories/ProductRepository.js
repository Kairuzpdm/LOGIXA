const db = require('../config/db');

// Patrón REPOSITORY
// Justificación: Centraliza y encapsula la lógica de acceso a datos. 
// Evita que los controladores tengan consultas SQL escritas directamente, 
// facilitando el testing (mock del repositorio) y posibles migraciones de BD.

class ProductRepository {
  async findAll() {
    const [rows] = await db.query('SELECT * FROM productos ORDER BY id DESC');
    return rows;
  }

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);
    return rows;
  }

  async create(productData) {
    const { nombre, descripcion, precio, stock, sku } = productData;
    const [result] = await db.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock, sku) VALUES (?, ?, ?, ?, ?)',
      [nombre, descripcion, precio, stock, sku]
    );
    return result.insertId;
  }

  async update(id, productData) {
    const { nombre, descripcion, precio, stock, sku } = productData;
    const [result] = await db.query(
      'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, sku = ? WHERE id = ?',
      [nombre, descripcion, precio, stock, sku, id]
    );
    return result;
  }

  async delete(id) {
    const [result] = await db.query('DELETE FROM productos WHERE id = ?', [id]);
    return result;
  }
}

module.exports = new ProductRepository();
