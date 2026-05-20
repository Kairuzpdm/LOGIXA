const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const validate = require('../middlewares/validate');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post(
  '/', 
  validate.requiredFields(['nombre', 'precio', 'stock']), 
  validate.productPricing, 
  productController.createProduct
);
router.put(
  '/:id', 
  validate.requiredFields(['nombre', 'precio', 'stock', 'sku']), 
  validate.productPricing, 
  productController.updateProduct
);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
