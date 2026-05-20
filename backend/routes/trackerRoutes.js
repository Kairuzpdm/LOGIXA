const express = require('express');
const router = express.Router();
const trackerController = require('../controllers/trackerController');
const validate = require('../middlewares/validate');

router.post(
  '/update', 
  validate.requiredFields(['repartidor_id', 'latitud', 'longitud']), 
  validate.coordinates, 
  trackerController.updateLocation
);
router.get('/locations', trackerController.getAllLocations);

module.exports = router;
