const express = require('express');
const {
  uploadEventImage,
  uploadUserAvatar,
  deleteEventImage,
  deleteUserAvatar
} = require('../controllers/uploadController');
const { uploadEventImage: multerEventImage, uploadAvatar: multerAvatar } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Debug route (no auth needed) - for testing
router.get('/debug', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Upload routes are working!',
    availableRoutes: [
      'POST /api/upload/event/:eventId',
      'POST /api/upload/avatar',
      'DELETE /api/upload/event/:eventId',
      'DELETE /api/upload/avatar'
    ],
    timestamp: new Date().toISOString()
  });
});

// All OTHER routes require authentication
router.use(protect);

// Event image routes
router.post('/event/:eventId', multerEventImage.single('image'), uploadEventImage);
router.delete('/event/:eventId', deleteEventImage);

// User avatar routes
router.post('/avatar', multerAvatar.single('avatar'), uploadUserAvatar);
router.delete('/avatar', deleteUserAvatar);

module.exports = router;