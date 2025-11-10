const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  getUserEvents,
  getUserRSVPs,
  getUserEventHistory
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// User profile routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// User event management
router.get('/my-events', getUserEvents);
router.get('/my-rsvps', getUserRSVPs);
router.get('/event-history', getUserEventHistory);

module.exports = router;