const express = require('express');
const {
  register,
  login,
  getProfile,
  updateProfile,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

// router.post('/logout', protect, (req, res) => {
//   res.json({
//     success: true,
//     message: 'Logout successful. Please remove token from client storage.'
//   })
// })


module.exports = router;