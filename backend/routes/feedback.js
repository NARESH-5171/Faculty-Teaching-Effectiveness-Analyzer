const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
  submitFeedback, getFeedbackForTeacher,
  getMyFeedbacks, getAvailableTeachers,
} = require('../middleware/controllers/feedbackController');

router.use(protect);

router.post('/', authorize('student'), submitFeedback);
router.get('/my', authorize('student'), getMyFeedbacks);
router.get('/teachers', authorize('student'), getAvailableTeachers);
router.get('/:teacherId', authorize('admin', 'teacher'), getFeedbackForTeacher);

module.exports = router;
