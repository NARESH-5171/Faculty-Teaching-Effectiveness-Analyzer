const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { submitResponse, getSessionStats, getSessions } = require('../middleware/controllers/liveController');

router.use(protect);
router.post('/respond', authorize('student'), submitResponse);
router.get('/stats/:teacherId/:sessionId', authorize('admin', 'teacher'), getSessionStats);
router.get('/sessions/:teacherId', authorize('admin', 'teacher'), getSessions);

module.exports = router;
