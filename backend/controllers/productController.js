const ProductRepository = require('../repositories/ProductRepository');
const ProductDTO = require('../dtos/ProductDTO');
const { sendSuccess, sendError, sendNotFound, sendConflict, ensureRecordExists, ensureAffectedRows } = require('../utils/response');

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await ProductRepository.findAll();
    // Usamos el DTO para transformar la lista completa
    const productsDTO = ProductDTO.fromList(products);
    return sendSuccess(res, 200, { data: productsDTO });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rows = await ProductRepository.findById(id);

    if (!ensureRecordExists(rows, res, 'Producto no encontrado')) {
      return;
    }

    // Usamos el DTO para transformar un producto individual
    const productDTO = new ProductDTO(rows[0]);
    return sendSuccess(res, 200, { data: productDTO });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { nombre, descripcion, precio, stock, sku } = req.body;
    const finalSku = sku || `SKU-${Date.now()}`;

    const insertId = await ProductRepository.create({ nombre, descripcion, precio, stock, sku: finalSku });

    // Devolvemos el DTO como buena práctica
    const newProductDTO = new ProductDTO({ 
      id: insertId, nombre, descripcion, precio, stock, sku: finalSku 
    });

    return sendSuccess(res, 201, {
      message: 'Producto creado exitosamente',
      data: newProductDTO
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return sendConflict(res, 'El SKU o código de producto ya está registrado.');
    }
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, sku } = req.body;

    const result = await ProductRepository.update(id, { nombre, descripcion, precio, stock, sku });

    if (!ensureAffectedRows(result, res, 'Producto no encontrado para actualizar.')) {
      return;
    }

    const updatedProductDTO = new ProductDTO({ id, nombre, descripcion, precio, stock, sku });

    return sendSuccess(res, 200, {
      message: 'Producto actualizado exitosamente',
      data: updatedProductDTO
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await ProductRepository.delete(id);

    if (!ensureAffectedRows(result, res, 'Producto no encontrado')) {
      return;
    }

    return sendSuccess(res, 200, {
      message: 'Producto eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};
