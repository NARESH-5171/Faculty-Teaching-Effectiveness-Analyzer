const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { exportCSV, exportPDF } = require('../middleware/controllers/exportController');

router.use(protect, authorize('admin'));

router.get('/csv', exportCSV);
router.get('/pdf', exportPDF);

module.exports = router;
