const express = require('express');
const router = express.Router();
const { getAllSpecialties } = require('../../controllers/specialty/specialty.controller');
const { verifyToken } = require('../../middlewares/auth/auth');
const { authorize } = require('../../middlewares/auth/role');

router.get('/', getAllSpecialties);

module.exports = router;