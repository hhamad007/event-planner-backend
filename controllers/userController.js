const User = require("../models/User");
const Event = require("../models/Event");
const RSVP = require("../models/RSVP");

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      "name",
      "email",
      "phone",
      "bio",
      "location",
      "interests",
    ];
    const updates = {};

    // Only allow specific fields to be updated
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user's created events
// @route   GET /api/users/my-events
// @access  Private
const getUserEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user's RSVP history
// @route   GET /api/users/my-rsvps
// @access  Private
const getUserRSVPs = async (req, res) => {
  try {
    const rsvps = await RSVP.find({ user: req.user.id })
      .populate("event", "title description date location price")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: rsvps.length,
      data: rsvps,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user's event history (created + attended)
// @route   GET /api/users/event-history
// @access  Private
const getUserEventHistory = async (req, res) => {
  try {
    // Get events created by user
    const createdEvents = await Event.find({ organizer: req.user.id })
      .select("title date location status")
      .lean();

    // Get events user has RSVPed to
    const rsvps = await RSVP.find({ user: req.user.id })
      .populate("event", "title date location status")
      .lean();

    const attendedEvents = rsvps.map((rsvp) => rsvp.event);

    res.json({
      success: true,
      data: {
        created: {
          count: createdEvents.length,
          events: createdEvents,
        },
        attended: {
          count: attendedEvents.length,
          events: attendedEvents,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserEvents,
  getUserRSVPs,
  getUserEventHistory,
};
