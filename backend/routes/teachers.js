const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createTeacher, getTeachers, getTeacher,
  updateTeacher, deleteTeacher, getTeacherStats,
} = require('../middleware/controllers/teacherController');

router.use(protect);

router.route('/')
  .get(authorize('admin'), getTeachers)
  .post(authorize('admin'), createTeacher);

router.route('/:id')
  .get(authorize('admin', 'teacher'), getTeacher)
  .put(authorize('admin'), updateTeacher)
  .delete(authorize('admin'), deleteTeacher);

router.get('/:id/stats', authorize('admin', 'teacher'), getTeacherStats);

module.exports = router;
