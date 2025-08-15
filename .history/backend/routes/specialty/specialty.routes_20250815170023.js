const express = require('express');
const router = express.Router();
const specialtyController = require('../../controllers/specspecialty.controller');

// GET /api/specialties
router.get('/', specialtyController.getAllSpecialties);

module.exports = router;
  