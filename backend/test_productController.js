const productController = require('./controllers/productController');

// Mock req, res, next
const mockRes = () => {
  const res = {};
  res.status = (statusCode) => {
    res.statusCode = statusCode;
    return res;
  };
  res.json = (data) => {
    res.data = data;
    return res;
  };
  return res;
};

const mockNext = (err) => {
  if (err) console.error("Error capturado por next:", err);
};

// Mocking the database
const db = require('./config/db');
db.query = async (queryStr, params) => {
  console.log("-> Ejecutando query SQL:", queryStr, params ? `| Params: ${JSON.stringify(params)}` : '');
  
  if (queryStr.includes('SELECT * FROM productos ORDER BY id DESC')) {
    // Return a list of fake products
    return [[
      { id: 1, nombre: 'Laptop Gamer', descripcion: 'Laptop de alta gama', precio: '1500.50', stock: 10, sku: 'LAP-123' },
      { id: 2, nombre: 'Ratón Inalámbrico', descripcion: null, precio: '25.00', stock: 0, sku: 'MOUSE-456' }
    ]];
  }
  
  if (queryStr.includes('INSERT INTO productos')) {
    // Return an insertId
    return [{ insertId: 3 }];
  }

  return [[]];
};

async function testGetAllProducts() {
  console.log("\n--- PROBANDO getAllProducts (Prueba de Repository y DTO) ---");
  const req = {};
  const res = mockRes();

  await productController.getAllProducts(req, res, mockNext);
  console.log("Código de estado:", res.statusCode);
  console.log("Respuesta formateada con DTO:", JSON.stringify(res.data, null, 2));
}

async function testCreateProduct() {
  console.log("\n--- PROBANDO createProduct (Prueba de Repository y DTO) ---");
  const req = {
    body: {
      nombre: 'Teclado Mecánico',
      descripcion: 'Teclado RGB',
      precio: 100,
      stock: 5,
      sku: 'KB-789'
    }
  };
  const res = mockRes();

  await productController.createProduct(req, res, mockNext);
  console.log("Código de estado:", res.statusCode);
  console.log("Respuesta con DTO devuelto:", JSON.stringify(res.data, null, 2));
}

async function runTests() {
  try {
    await testGetAllProducts();
    await testCreateProduct();
    console.log("\n✅ Todas las pruebas finalizaron correctamente.");
    process.exit(0);
  } catch (error) {
    console.error("Error en las pruebas:", error);
    process.exit(1);
  }
}

runTests();
