// Patrón DTO (Data Transfer Object)
// Justificación: Aisla la representación de los datos de la base de datos de la que se envía al cliente.
// Permite formatear datos, ocultar campos internos o adaptar la estructura sin tocar la lógica de negocio ni la base de datos.

class ProductDTO {
  constructor(productRow) {
    // Transformamos y aseguramos los datos para el frontend sin romper su estructura
    this.id = productRow.id;
    this.nombre = productRow.nombre;
    this.descripcion = productRow.descripcion || 'Sin descripción';
    this.precio = parseFloat(productRow.precio);
    this.stock = productRow.stock;
    this.sku = productRow.sku || 'N/A';
    
    // Campo derivado adicional
    this.inStock = productRow.stock > 0;
  }

  static fromList(productRows) {
    return productRows.map(row => new ProductDTO(row));
  }
}

module.exports = ProductDTO;
