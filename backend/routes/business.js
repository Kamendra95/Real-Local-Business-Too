const express = require('express');
const router = express.Router();
const { getBusiness, updateBusiness } = require('../controllers/businessController');
const { protect, admin } = require('../middleware/auth');

router.get('/:type', getBusiness);
router.put('/:type', protect, admin, updateBusiness);

module.exports = router;