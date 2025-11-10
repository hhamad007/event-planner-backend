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
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes (no authentication needed)
router.get("/", getAllEvents);                    // GET /api/events
router.get("/search", searchEvents);              // GET /api/events/search
router.get("/:id", getEventById);                 // GET /api/events/:id

// Protected routes (authentication required)
router.post("/", protect, createEvent);           // POST /api/events
router.put("/:id", protect, updateEvent);         // PUT /api/events/:id
router.delete("/:id", protect, deleteEvent);      // DELETE /api/events/:id
router.get("/my/events", protect, getMyEvents);   // GET /api/events/my/events

module.exports = router;