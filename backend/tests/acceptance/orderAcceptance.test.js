const request = require('supertest');
const app = require('../../server');

jest.mock('../../config/db', () => {
  return {
    query: jest.fn(),
    getConnection: jest.fn()
  };
});

describe('Prueba de Aceptación (End-to-End simulado) - Flujo de Pedidos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Como usuario cliente, quiero crear un pedido y como repartidor quiero actualizar su estado', async () => {
    const db = require('../../config/db');
    
    // Mock for transactions
    const mockConnection = {
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
      query: jest.fn()
    };
    db.getConnection.mockResolvedValue(mockConnection);

    // 1. Cliente crea pedido
    // Simulamos respuesta del SELECT stock FOR UPDATE
    mockConnection.query.mockResolvedValueOnce([[{ stock: 10, nombre: 'Producto A' }]]);
    // Simulamos UPDATE stock
    mockConnection.query.mockResolvedValueOnce([{}]);
    // Simulamos INSERT pedido
    mockConnection.query.mockResolvedValueOnce([{ insertId: 50 }]);

    const createOrderRes = await request(app)
      .post('/api/pedidos')
      .send({
        cliente_id: 1,
        producto_id: 1,
        cantidad: 2
      });

    expect(createOrderRes.statusCode).toBe(201);
    expect(createOrderRes.body.data.id).toBe(50);
    expect(createOrderRes.body.data.estado).toBe('pendiente');

    // 2. Repartidor actualiza el estado a "entregado"
    // Simulamos la BD para updateOrderStatus
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const updateStatusRes = await request(app)
      .put('/api/pedidos/50/status')
      .send({ estado: 'entregado' });

    expect(updateStatusRes.statusCode).toBe(200);
    expect(updateStatusRes.body.message).toContain('entregado');
  });
});
