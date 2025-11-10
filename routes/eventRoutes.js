const express = require("express");
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  searchEvents,
  getMyEvents,
} = require("../controllers/eventController");
const {
  createRSVP,
  cancelRSVP,
  getEventAttendees,
} = require("../controllers/rsvpController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes (no authentication needed)
router.get("/", getAllEvents);
router.get("/search", searchEvents);
router.get("/:id", getEventById);
router.get("/:id/attendees", getEventAttendees);

// Protected routes (authentication required)
router.post("/", protect, createEvent);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);
router.get("/my/events", protect, getMyEvents);

// RSVP routes (authentication required)
router.post("/:id/rsvp", protect, createRSVP);
router.delete("/:id/rsvp", protect, cancelRSVP);

module.exports = router;
