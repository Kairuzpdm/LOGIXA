const orderController = require('./controllers/orderController');
const { sendSuccess, sendError, sendNotFound } = require('./utils/response');

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

// Test for CreateOrder
async function testCreateOrder() {
  console.log("--- PROBANDO createOrder ---");
  const req = {
    body: {
      cliente_id: 1,
      producto_id: 10,
      cantidad: 2
    }
  };
  const res = mockRes();

  // Mocking the db module which orderController imports
  const db = require('./config/db');
  
  // We need to mock getConnection
  db.getConnection = async () => {
    return {
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {
        console.log("Transaction rolled back");
      },
      release: () => {},
      query: async (queryStr, params) => {
        if (queryStr.includes('SELECT stock')) {
          // Mock product search
          return [[{ stock: 5, nombre: 'Producto Mock' }]]; // success case
        }
        if (queryStr.includes('UPDATE productos SET stock')) {
          console.log("Actualizando stock...");
          return [{}];
        }
        if (queryStr.includes('INSERT INTO pedidos')) {
          console.log("Insertando pedido...");
          return [{ insertId: 99 }];
        }
        return [[]];
      }
    };
  };

  await orderController.createOrder(req, res, mockNext);
  console.log("Respuesta createOrder:", res.statusCode, res.data);
}

// Test for updateOrderStatus
async function testUpdateOrderStatus() {
  console.log("\n--- PROBANDO updateOrderStatus ---");
  const req = {
    params: { id: 99 },
    body: { estado: 'entregado' }
  };
  const res = mockRes();

  const db = require('./config/db');
  db.query = async (queryStr, params) => {
    console.log("Ejecutando query:", queryStr, "Params:", params);
    return [{ affectedRows: 1 }];
  };

  await orderController.updateOrderStatus(req, res, mockNext);
  console.log("Respuesta updateOrderStatus:", res.statusCode, res.data);
}

async function runTests() {
  await testCreateOrder();
  await testUpdateOrderStatus();
}

runTests();
