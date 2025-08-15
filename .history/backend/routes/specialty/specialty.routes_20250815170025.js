const express = require('express');
const router = express.Router();
const specialtyController = require('../../controllersspecialty.controller');

// GET /api/specialties
router.get('/', specialtyController.getAllSpecialties);

module.exports = router;
  