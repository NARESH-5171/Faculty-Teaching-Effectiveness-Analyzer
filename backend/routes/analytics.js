const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { getOverallAnalytics, getTeacherAnalytics, getTopTeachers } = require('../middleware/controllers/analyticsController');

router.use(protect, authorize('admin', 'teacher'));

router.get('/overall', authorize('admin'), getOverallAnalytics);
router.get('/top-teachers', authorize('admin'), getTopTeachers);
router.get('/teacher/:teacherId', getTeacherAnalytics);

module.exports = router;
