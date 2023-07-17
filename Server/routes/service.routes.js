const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/Services.controller');
const authController = require("../controllers/admin.auth");
// Routes
router.post('/add', authController.authenticateToken, serviceController.addService);

router.get('/search', serviceController.searchServices);

router.get('/', serviceController.getAllServices);

router.put('/:id', authController.authenticateToken, serviceController.updateService);

router.delete('/:id', authController.authenticateToken, serviceController.deleteService);

router.get('/:id', serviceController.getServiceById);

module.exports = router;