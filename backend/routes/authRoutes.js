const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');

router.post('/login', validate.requiredFields(['email', 'password']), authController.login);
router.get('/repartidores', authController.getDrivers);
router.post('/repartidores', validate.requiredFields(['nombre', 'email', 'password']), authController.createDriver);

module.exports = router;
