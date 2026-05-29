const ProductDTO = require('../../dtos/ProductDTO');

describe('Pruebas Unitarias - ProductDTO', () => {
  it('Debe formatear correctamente una fila de base de datos válida', () => {
    const rawData = {
      id: 1,
      nombre: 'Test Product',
      descripcion: 'Description',
      precio: '10.50',
      stock: 5,
      sku: 'SKU-123'
    };

    const dto = new ProductDTO(rawData);

    expect(dto.id).toBe(1);
    expect(dto.nombre).toBe('Test Product');
    expect(dto.descripcion).toBe('Description');
    expect(dto.precio).toBe(10.50);
    expect(dto.stock).toBe(5);
    expect(dto.sku).toBe('SKU-123');
    expect(dto.inStock).toBe(true);
  });

  it('Debe manejar campos opcionales nulos o vacíos', () => {
    const rawData = {
      id: 2,
      nombre: 'No desc',
      precio: '100',
      stock: 0
    };

    const dto = new ProductDTO(rawData);

    expect(dto.descripcion).toBe('Sin descripción');
    expect(dto.sku).toBe('N/A');
    expect(dto.inStock).toBe(false);
  });
});
