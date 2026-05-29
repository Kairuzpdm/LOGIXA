const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendSuccess, sendError, sendConflict } = require('../utils/response');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ? AND activo = 1', [email]);
    if (rows.length === 0) {
      return sendError(res, 401, 'Credenciales inválidas o usuario inactivo.');
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 401, 'Credenciales inválidas.');
    }

    const token = jwt.sign(
      { id: user.id, rol: user.rol, nombre: user.nombre },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '8h' }
    );

    return sendSuccess(res, 200, {
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getDrivers = async (req, res, next) => {
  try {
    const [drivers] = await db.query('SELECT id, nombre, email, activo FROM usuarios WHERE rol = "repartidor"');
    return sendSuccess(res, 200, { data: drivers });
  } catch (error) {
    next(error);
  }
};

exports.createDriver = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;

    const [existing] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      return sendConflict(res, 'Ya existe un usuario con ese correo electrónico.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (?, ?, ?, "repartidor", 1)',
      [nombre, email, hashedPassword]
    );

    return sendSuccess(res, 201, {
      data: {
        id: result.insertId,
        nombre,
        email,
        rol: 'repartidor'
      }
    });
  } catch (error) {
    next(error);
  }
};
