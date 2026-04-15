const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, getMe } = require('../middleware/controllers/authController');
const { protect } = require('../middleware/auth');

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  login
);

router.get('/me', protect, getMe);

module.exports = router;
