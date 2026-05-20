const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const validate = require('../middlewares/validate');

router.get('/', orderController.getAllOrders);
router.post('/', validate.requiredFields(['cliente_id', 'producto_id', 'cantidad']), orderController.createOrder);
router.put('/:id/assign', validate.requiredFields(['repartidor_id']), orderController.assignDriver);
router.put('/:id/status', validate.requiredFields(['estado']), orderController.updateOrderStatus);
router.get('/driver/:driverId', orderController.getDriverOrders);

module.exports = router;
