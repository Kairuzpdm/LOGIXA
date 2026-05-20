const db = require('../config/db');

exports.getAllClients = async (req, res, next) => {
  try {
    const [clients] = await db.query('SELECT * FROM clientes ORDER BY id DESC');
    res.status(200).json({
      status: 'success',
      data: clients
    });
  } catch (error) {
    next(error);
  }
};

exports.getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM clientes WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Cliente no encontrado'
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

exports.createClient = async (req, res, next) => {
  try {
    const { nombre, email, telefono, direccion, latitud, longitud } = req.body;

    const [result] = await db.query(
      'INSERT INTO clientes (nombre, email, telefono, direccion, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, email, telefono, direccion, latitud, longitud]
    );

    res.status(201).json({
      status: 'success',
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
      return res.status(400).json({
        status: 'error',
        message: 'El correo electrónico ya está registrado con otro cliente.'
      });
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

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Cliente no encontrado para actualizar.'
      });
    }

    res.status(200).json({
      status: 'success',
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
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Cliente no encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Cliente eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};
