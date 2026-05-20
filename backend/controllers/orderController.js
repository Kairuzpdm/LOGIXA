const db = require('../config/db');

exports.getAllOrders = async (req, res, next) => {
  try {
    const query = `
      SELECT p.id, p.cantidad, p.estado, p.fecha_creacion, p.fecha_entrega,
             c.id AS cliente_id, c.nombre AS cliente_nombre, c.direccion AS cliente_direccion, c.latitud AS cliente_latitud, c.longitud AS cliente_longitud, c.telefono AS cliente_telefono,
             pr.id AS producto_id, pr.nombre AS producto_nombre, pr.precio AS producto_precio,
             u.id AS repartidor_id, u.nombre AS repartidor_nombre
      FROM pedidos p
      JOIN clientes c ON p.cliente_id = c.id
      JOIN productos pr ON p.producto_id = pr.id
      LEFT JOIN usuarios u ON p.repartidor_id = u.id
      ORDER BY p.id DESC
    `;
    const [orders] = await db.query(query);
    res.status(200).json({
      status: 'success',
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

exports.createOrder = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { cliente_id, producto_id, cantidad } = req.body;
    const qty = parseInt(cantidad) || 1;

    // 1. Verificar stock del producto
    const [prodRows] = await connection.query('SELECT stock, nombre FROM productos WHERE id = ? FOR UPDATE', [producto_id]);
    if (prodRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'El producto seleccionado no existe.'
      });
    }

    const producto = prodRows[0];
    if (producto.stock < qty) {
      await connection.rollback();
      return res.status(400).json({
        status: 'error',
        message: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}, Solicitado: ${qty}.`
      });
    }

    // 2. Restar stock (ERP core logic!)
    await connection.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [qty, producto_id]);

    // 3. Crear el pedido
    const [result] = await connection.query(
      'INSERT INTO pedidos (cliente_id, producto_id, cantidad, estado) VALUES (?, ?, ?, "pendiente")',
      [cliente_id, producto_id, qty]
    );

    await connection.commit();

    res.status(201).json({
      status: 'success',
      message: 'Pedido creado y stock reservado correctamente.',
      data: {
        id: result.insertId,
        cliente_id,
        producto_id,
        cantidad: qty,
        estado: 'pendiente'
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

exports.assignDriver = async (req, res, next) => {
  try {
    const { id } = req.params; // Order ID
    const { repartidor_id } = req.body;

    // Verificar que el pedido exista
    const [orderRows] = await db.query('SELECT id, estado FROM pedidos WHERE id = ?', [id]);
    if (orderRows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Pedido no encontrado.'
      });
    }

    // Actualizar pedido a asignado y cambiar estado a 'en_ruta'
    await db.query(
      'UPDATE pedidos SET repartidor_id = ?, estado = "en_ruta" WHERE id = ?',
      [repartidor_id, id]
    );

    res.status(200).json({
      status: 'success',
      message: 'Repartidor asignado y pedido puesto en ruta.'
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body; // 'pendiente', 'en_ruta', 'entregado', 'incidencia'

    let query = 'UPDATE pedidos SET estado = ?';
    const params = [estado];

    if (estado === 'entregado') {
      query += ', fecha_entrega = CURRENT_TIMESTAMP';
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await db.query(query, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Pedido no encontrado.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Estado del pedido actualizado a: ${estado}`
    });
  } catch (error) {
    next(error);
  }
};

exports.getDriverOrders = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const query = `
      SELECT p.id, p.cantidad, p.estado, p.fecha_creacion,
             c.nombre AS cliente_nombre, c.direccion AS cliente_direccion, c.latitud AS cliente_latitud, c.longitud AS cliente_longitud, c.telefono AS cliente_telefono,
             pr.nombre AS producto_nombre
      FROM pedidos p
      JOIN clientes c ON p.cliente_id = c.id
      JOIN productos pr ON p.producto_id = pr.id
      WHERE p.repartidor_id = ? AND p.estado IN ('en_ruta', 'pendiente')
      ORDER BY p.id ASC
    `;
    const [orders] = await db.query(query, [driverId]);
    res.status(200).json({
      status: 'success',
      data: orders
    });
  } catch (error) {
    next(error);
  }
};
