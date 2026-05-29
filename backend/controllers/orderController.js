const db = require('../config/db');
const { sendSuccess, sendError, sendNotFound, ensureRecordExists, ensureAffectedRows } = require('../utils/response');

// 1. Extract Method: Función extraída para verificar y actualizar el stock de un producto
const verificarYActualizarStock = async (connection, producto_id, cantidadSolicitada, res) => {
  const [filasProducto] = await connection.query('SELECT stock, nombre FROM productos WHERE id = ? FOR UPDATE', [producto_id]);
  
  if (!ensureRecordExists(filasProducto, res, 'El producto seleccionado no existe.')) {
    return false;
  }

  const productoEncontrado = filasProducto[0];
  if (productoEncontrado.stock < cantidadSolicitada) {
    sendError(res, 400, `Stock insuficiente para ${productoEncontrado.nombre}. Disponible: ${productoEncontrado.stock}, Solicitado: ${cantidadSolicitada}.`);
    return false;
  }

  await connection.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [cantidadSolicitada, producto_id]);
  return true;
};

// 2. Replace Conditional with Polymorphism: Clases para manejar la actualización de estados
class ActualizadorEstadoPedido {
  constructor(id, estado) {
    this.id = id;
    this.estado = estado;
    this.query = 'UPDATE pedidos SET estado = ?';
    this.params = [estado];
  }
  
  construirConsulta() {
    this.params.push(this.id);
    return { query: this.query + ' WHERE id = ?', params: this.params };
  }
}

class ActualizadorEstadoEntregado extends ActualizadorEstadoPedido {
  construirConsulta() {
    this.query += ', fecha_entrega = CURRENT_TIMESTAMP';
    return super.construirConsulta();
  }
}

class CreadorActualizadorEstado {
  static crear(id, estado) {
    if (estado === 'entregado') {
      return new ActualizadorEstadoEntregado(id, estado);
    }
    return new ActualizadorEstadoPedido(id, estado);
  }
}

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
    return sendSuccess(res, 200, { data: orders });
  } catch (error) {
    next(error);
  }
};

exports.createOrder = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { cliente_id, producto_id, cantidad } = req.body;
    // 3. Rename Variable: qty -> cantidadSolicitada, prodRows -> filasProducto, producto -> productoEncontrado (Aplicado también en el Extract Method superior)
    const cantidadSolicitada = parseInt(cantidad) || 1;

    // Uso de Extract Method para encapsular la lógica compleja de stock
    const stockActualizado = await verificarYActualizarStock(connection, producto_id, cantidadSolicitada, res);
    if (!stockActualizado) {
      await connection.rollback();
      return;
    }

    const [result] = await connection.query(
      'INSERT INTO pedidos (cliente_id, producto_id, cantidad, estado) VALUES (?, ?, ?, "pendiente")',
      [cliente_id, producto_id, cantidadSolicitada]
    );

    await connection.commit();

    return sendSuccess(res, 201, {
      message: 'Pedido creado y stock reservado correctamente.',
      data: {
        id: result.insertId,
        cliente_id,
        producto_id,
        cantidad: cantidadSolicitada,
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
    const { id } = req.params;
    const { repartidor_id } = req.body;

    const [orderRows] = await db.query('SELECT id, estado FROM pedidos WHERE id = ?', [id]);
    if (!ensureRecordExists(orderRows, res, 'Pedido no encontrado.')) {
      return;
    }

    await db.query(
      'UPDATE pedidos SET repartidor_id = ?, estado = "en_ruta" WHERE id = ?',
      [repartidor_id, id]
    );

    return sendSuccess(res, 200, {
      message: 'Repartidor asignado y pedido puesto en ruta.'
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Uso de Replace Conditional with Polymorphism
    const actualizador = CreadorActualizadorEstado.crear(id, estado);
    const { query, params } = actualizador.construirConsulta();

    const [result] = await db.query(query, params);
    if (!ensureAffectedRows(result, res, 'Pedido no encontrado.')) {
      return;
    }

    return sendSuccess(res, 200, {
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
    return sendSuccess(res, 200, { data: orders });
  } catch (error) {
    next(error);
  }
};
