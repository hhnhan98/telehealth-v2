const express = require('express');
const router = express.Router();
const { getAllLocations } = require('../controllers/location.controller');

router.get('/', getAllLocations);

module.exports = router;
