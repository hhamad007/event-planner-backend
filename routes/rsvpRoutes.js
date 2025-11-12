const express = require("express");
const {
  createRSVP,
  cancelRSVP,
  getEventAttendees,
  updateRSVP,
  getUserRSVPs,
  getRSVPStatus
} = require("../controllers/rsvpController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All RSVP routes require authentication
router.use(protect);

// User RSVP routes
router.get('/user', getUserRSVPs);                      // GET /api/rsvp/user

// Event-specific RSVP routes
router.post("/:eventId", createRSVP);                   // POST /api/rsvp/:eventId
router.delete("/:eventId", cancelRSVP);                 // DELETE /api/rsvp/:eventId
router.put("/:eventId", updateRSVP);                    // PUT /api/rsvp/:eventId
router.get("/:eventId/status", getRSVPStatus);          // GET /api/rsvp/:eventId/status
router.get("/:eventId/attendees", getEventAttendees);   // GET /api/rsvp/:eventId/attendees

module.exports = router;