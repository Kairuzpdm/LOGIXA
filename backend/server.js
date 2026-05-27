const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Middlewares globales
app.use(cors());
app.use(express.json());

// Mensaje de estado del Servidor (Health check)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Servidor de Logística Urbana y ERP/CRM corriendo correctamente.',
    version: '1.0.0'
  });
});

// Registro de Rutas Modulares
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/productos', require('./routes/productRoutes'));
app.use('/api/clientes', require('./routes/clientRoutes'));
app.use('/api/pedidos', require('./routes/orderRoutes'));
app.use('/api/tracker', require('./routes/trackerRoutes'));

// Manejo centralizado de Errores (Ultimo middleware de Express)
app.use(errorHandler);

// Iniciar Servidor
app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`Servidor ejecutándose en: http://localhost:${PORT}`);
  console.log(`Rutas API expuestas bajo: http://localhost:${PORT}/api/...`);
  console.log(`================================================================`);
});
