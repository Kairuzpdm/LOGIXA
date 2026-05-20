const db = require('../config/db');

exports.getAllProducts = async (req, res, next) => {
  try {
    const [products] = await db.query('SELECT * FROM productos ORDER BY id DESC');
    res.status(200).json({
      status: 'success',
      data: products
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { nombre, descripcion, precio, stock, sku } = req.body;
    
    // Generar SKU único si no se proporciona
    const finalSku = sku || `SKU-${Date.now()}`;

    const [result] = await db.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock, sku) VALUES (?, ?, ?, ?, ?)',
      [nombre, descripcion, precio, stock, finalSku]
    );

    res.status(201).json({
      status: 'success',
      message: 'Producto creado exitosamente',
      data: {
        id: result.insertId,
        nombre,
        descripcion,
        precio,
        stock,
        sku: finalSku
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: 'El SKU o código de producto ya está registrado.'
      });
    }
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, sku } = req.body;

    const [result] = await db.query(
      'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, sku = ? WHERE id = ?',
      [nombre, descripcion, precio, stock, sku, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado para actualizar.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Producto actualizado exitosamente',
      data: { id, nombre, descripcion, precio, stock, sku }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM productos WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Producto eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};
