const db = require('../config/db');

exports.updateLocation = async (req, res, next) => {
  try {
    const { repartidor_id, latitud, longitud } = req.body;

    // INSERT ... ON DUPLICATE KEY UPDATE para actualizar la ubicación
    const query = `
      INSERT INTO ubicaciones_repartidores (repartidor_id, latitud, longitud, ultima_actualizacion)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE latitud = ?, longitud = ?, ultima_actualizacion = CURRENT_TIMESTAMP
    `;
    await db.query(query, [repartidor_id, latitud, longitud, latitud, longitud]);

    res.status(200).json({
      status: 'success',
      message: 'Ubicación actualizada correctamente.'
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllLocations = async (req, res, next) => {
  try {
    const query = `
      SELECT u.repartidor_id, u.latitud, u.longitud, u.ultima_actualizacion,
             usr.nombre AS repartidor_nombre
      FROM ubicaciones_repartidores u
      JOIN usuarios usr ON u.repartidor_id = usr.id
      WHERE usr.activo = 1
    `;
    const [locations] = await db.query(query);
    res.status(200).json({
      status: 'success',
      data: locations
    });
  } catch (error) {
    next(error);
  }
};
