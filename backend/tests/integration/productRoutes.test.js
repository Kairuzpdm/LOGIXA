const request = require('supertest');
const app = require('../../server');
const db = require('../../config/db');

// Mock db.query to avoid hitting the real database during testing
jest.mock('../../config/db', () => ({
  query: jest.fn()
}));

describe('Pruebas de Integración - API de Productos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/productos - Debe devolver lista de productos', async () => {
    const mockProducts = [
      { id: 1, nombre: 'Test', descripcion: 'Test desc', precio: '10', stock: 5, sku: 'SKU-1' }
    ];
    require('../../config/db').query.mockResolvedValueOnce([mockProducts]);

    const res = await request(app).get('/api/productos');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].nombre).toBe('Test');
    expect(res.body.data[0].inStock).toBe(true);
  });

  it('POST /api/productos - Debe crear un producto y devolver 201', async () => {
    require('../../config/db').query.mockResolvedValueOnce([{ insertId: 2 }]);

    const newProduct = {
      nombre: 'Nuevo',
      descripcion: 'Prod nuevo',
      precio: 20,
      stock: 10,
      sku: 'SKU-2'
    };

    const res = await request(app)
      .post('/api/productos')
      .send(newProduct);

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.id).toBe(2);
    expect(res.body.data.nombre).toBe('Nuevo');
  });
});
