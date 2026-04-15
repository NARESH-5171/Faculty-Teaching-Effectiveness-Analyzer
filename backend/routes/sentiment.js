const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { getSentimentSummary, getOverallSentiment } = require('../middleware/controllers/sentimentController');

router.use(protect);
router.get('/overall', authorize('admin'), getOverallSentiment);
router.get('/:teacherId', authorize('admin', 'teacher'), getSentimentSummary);

module.exports = router;
