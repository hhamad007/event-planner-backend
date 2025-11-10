const express = require("express");
const {
  createRSVP,
  cancelRSVP,
  getEventAttendees,
  updateRSVP,
  getUserRSVPs,
} = require("../controllers/rsvpController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All RSVP routes require authentication
router.use(protect);

router.post("/:eventId", createRSVP); // POST /api/rsvp/:eventId
router.delete("/:eventId", cancelRSVP); // DELETE /api/rsvp/:eventId
router.put("/:eventId", updateRSVP); // PUT /api/rsvp/:eventId
router.get("/my-rsvps", getUserRSVPs); // GET /api/rsvp/my-rsvps
router.get("/:eventId/attendees", getEventAttendees); // GET /api/rsvp/:eventId/attendees

module.exports = router;
