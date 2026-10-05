const express = require('express');
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, adminController.createReport);

module.exports = router;
