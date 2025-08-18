// routes/schedule.routes.js
const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');

router.get('/available-slots', scheduleController.getAvailableSlots);

module.exports = router;
