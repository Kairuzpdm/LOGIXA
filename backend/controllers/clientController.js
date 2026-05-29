const db = require('../config/db');
const { sendSuccess, sendError, sendNotFound, sendConflict, ensureRecordExists, ensureAffectedRows } = require('../utils/response');

exports.getAllClients = async (req, res, next) => {
  try {
    const [clients] = await db.query('SELECT * FROM clientes ORDER BY id DESC');
    return sendSuccess(res, 200, { data: clients });
  } catch (error) {
    next(error);
  }
};

exports.getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM clientes WHERE id = ?', [id]);

    if (!ensureRecordExists(rows, res, 'Cliente no encontrado')) {
      return;
    }

    return sendSuccess(res, 200, { data: rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.createClient = async (req, res, next) => {
  try {
    const { nombre, email, telefono, direccion, latitud, longitud } = req.body;

    const [result] = await db.query(
      'INSERT INTO clientes (nombre, email, telefono, direccion, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, email, telefono, direccion, latitud, longitud]
    );

    return sendSuccess(res, 201, {
      message: 'Cliente registrado exitosamente',
      data: {
        id: result.insertId,
        nombre,
        email,
        telefono,
        direccion,
        latitud,
        longitud
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return sendConflict(res, 'El correo electrónico ya está registrado con otro cliente.');
    }
    next(error);
  }
};

exports.updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, email, telefono, direccion, latitud, longitud } = req.body;

    const [result] = await db.query(
      'UPDATE clientes SET nombre = ?, email = ?, telefono = ?, direccion = ?, latitud = ?, longitud = ? WHERE id = ?',
      [nombre, email, telefono, direccion, latitud, longitud, id]
    );

    if (!ensureAffectedRows(result, res, 'Cliente no encontrado para actualizar.')) {
      return;
    }

    return sendSuccess(res, 200, {
      message: 'Cliente actualizado correctamente',
      data: { id, nombre, email, telefono, direccion, latitud, longitud }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM clientes WHERE id = ?', [id]);

    if (!ensureAffectedRows(result, res, 'Cliente no encontrado')) {
      return;
    }

    return sendSuccess(res, 200, {
      message: 'Cliente eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};
