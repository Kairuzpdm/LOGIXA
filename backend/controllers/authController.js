const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Buscar el usuario por email
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ? AND activo = 1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas o usuario inactivo.'
      });
    }

    const user = rows[0];

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas.'
      });
    }

    // Generar el Token JWT
    const token = jwt.sign(
      { id: user.id, rol: user.rol, nombre: user.nombre },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '8h' }
    );

    res.status(200).json({
      status: 'success',
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
    // Listar todos los repartidores
    const [drivers] = await db.query('SELECT id, nombre, email, activo FROM usuarios WHERE rol = "repartidor"');
    res.status(200).json({
      status: 'success',
      data: drivers
    });
  } catch (error) {
    next(error);
  }
};

exports.createDriver = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;

    // Verificar que el email no exista ya en la base de datos
    const [existing] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'Ya existe un usuario con ese correo electrónico.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (?, ?, ?, "repartidor", 1)',
      [nombre, email, hashedPassword]
    );

    res.status(201).json({
      status: 'success',
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
