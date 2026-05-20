// Middleware de validación reutilizable para solicitudes entrantes
// Valida parámetros comunes antes de que alcancen a los controladores

const validate = {
  // Valida que los campos requeridos estén presentes en el body
  requiredFields: (fields) => {
    return (req, res, next) => {
      const missing = fields.filter(field => req.body[field] === undefined || req.body[field] === null || req.body[field] === '');
      if (missing.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: `Faltan campos requeridos: ${missing.join(', ')}`
        });
      }
      next();
    };
  },

  // Valida coordenadas geográficas correctas
  coordinates: (req, res, next) => {
    const { latitud, longitud } = req.body;
    if (latitud !== undefined && longitud !== undefined) {
      const lat = parseFloat(latitud);
      const lng = parseFloat(longitud);

      if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
        return res.status(400).json({
          status: 'error',
          message: 'Coordenadas geográficas inválidas. Latitud debe estar entre -90 y 90, Longitud entre -180 y 180.'
        });
      }
    }
    next();
  },

  // Valida que el stock y precio sean números positivos
  productPricing: (req, res, next) => {
    const { precio, stock } = req.body;
    
    if (precio !== undefined) {
      const p = parseFloat(precio);
      if (isNaN(p) || p < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'El precio debe ser un número positivo.'
        });
      }
    }

    if (stock !== undefined) {
      const s = parseInt(stock);
      if (isNaN(s) || s < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'El stock debe ser un número entero mayor o igual a cero.'
        });
      }
    }
    next();
  }
};

module.exports = validate;
