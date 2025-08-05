const express = require('express');
const router = express.Router();
const {
  createHealthRecord,
  getAllHealthRecords,
  getHealthRecordById,
  updateHealthRecord,
  deleteHealthRecord,
} = require('../controllers/healthRecord.controller');

router.post('/', createHealthRecord);
router.get('/', getAllHealthRecords);
router.get('/:id', getHealthRecordById);
router.put('/:id', updateHealthRecord);
router.delete('/:id', deleteHealthRecord);

module.exports = router;
