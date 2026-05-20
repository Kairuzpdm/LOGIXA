const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const validate = require('../middlewares/validate');

router.get('/', clientController.getAllClients);
router.get('/:id', clientController.getClientById);
router.post(
  '/', 
  validate.requiredFields(['nombre', 'direccion', 'latitud', 'longitud']), 
  validate.coordinates, 
  clientController.createClient
);
router.put(
  '/:id', 
  validate.requiredFields(['nombre', 'direccion', 'latitud', 'longitud']), 
  validate.coordinates, 
  clientController.updateClient
);
router.delete('/:id', clientController.deleteClient);

module.exports = router;
