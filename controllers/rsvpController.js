const RSVP = require("../models/RSVP");
const Event = require("../models/Event");
const User = require("../models/User");

// @desc    RSVP to an event
// @route   POST /api/rsvp/:eventId
// @access  Private
const createRSVP = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if user is the organizer
    if (event.organizer.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot RSVP to your own event",
      });
    }

    // Check if user already RSVPed
    const existingRSVP = await RSVP.findOne({
      user: req.user.id,
      event: req.params.eventId,
    });

    if (existingRSVP) {
      return res.status(400).json({
        success: false,
        message: "Already RSVPed to this event",
      });
    }

    // Check event capacity with guest count
    const { numberOfGuests = 0 } = req.body;
    const totalAttendees = 1 + numberOfGuests; // User + guests

    const currentRSVPs = await RSVP.find({
      event: req.params.eventId,
      status: "attending",
    });

    const currentAttendeeCount = currentRSVPs.reduce((total, rsvp) => {
      return total + 1 + (rsvp.numberOfGuests || 0);
    }, 0);

    if (
      event.maxAttendees &&
      currentAttendeeCount + totalAttendees > event.maxAttendees
    ) {
      return res.status(400).json({
        success: false,
        message: `Event capacity exceeded. Available spots: ${
          event.maxAttendees - currentAttendeeCount
        }`,
      });
    }

    // Create RSVP
    const rsvp = await RSVP.create({
      user: req.user.id,
      event: req.params.eventId,
      status: req.body.status || "attending",
      numberOfGuests: numberOfGuests,
      specialRequests: req.body.specialRequests,
    });

    await rsvp.populate("user", "name email");
    await rsvp.populate("event", "title date location");

    // Update event attendee count
    await Event.findByIdAndUpdate(req.params.eventId, {
      $inc: { attendeeCount: totalAttendees },
    });

    res.status(201).json({
      success: true,
      data: rsvp,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Cancel RSVP
// @route   DELETE /api/rsvp/:eventId
// @access  Private
const cancelRSVP = async (req, res) => {
  try {
    const rsvp = await RSVP.findOne({
      user: req.user.id,
      event: req.params.eventId,
    });

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: "RSVP not found",
      });
    }

    const attendeeReduction = 1 + (rsvp.numberOfGuests || 0);

    await RSVP.findByIdAndDelete(rsvp._id);

    // Update event attendee count
    await Event.findByIdAndUpdate(req.params.eventId, {
      $inc: { attendeeCount: -attendeeReduction },
    });

    res.json({
      success: true,
      message: "RSVP cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get event attendees
// @route   GET /api/rsvp/:eventId/attendees
// @access  Public
const getEventAttendees = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const attendees = await RSVP.find({
      event: req.params.eventId,
      status: "attending",
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: attendees.length,
      data: attendees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update RSVP
// @route   PUT /api/rsvp/:eventId
// @access  Private
const updateRSVP = async (req, res) => {
  try {
    const rsvp = await RSVP.findOne({
      user: req.user.id,
      event: req.params.eventId
    });

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: 'RSVP not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['status', 'numberOfGuests', 'specialRequests'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedRSVP = await RSVP.findByIdAndUpdate(
      rsvp._id,
      updates,
      { new: true, runValidators: true }
    ).populate('user', 'name email')
     .populate('event', 'title date location');

    res.json({
      success: true,
      data: updatedRSVP
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's RSVPs
// @route   GET /api/rsvp/my-rsvps
// @access  Private
const getUserRSVPs = async (req, res) => {
  try {
    const rsvps = await RSVP.find({ user: req.user.id })
      .populate('event', 'title date location price category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: rsvps.length,
      data: rsvps
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check RSVP status for a specific event
// @route   GET /api/rsvp/:eventId/status
// @access  Private
const getRSVPStatus = async (req, res) => {
  try {
    const rsvp = await RSVP.findOne({
      user: req.user.id,
      event: req.params.eventId
    }).populate('event', 'title date maxAttendees attendeeCount');

    if (!rsvp) {
      return res.json({
        success: true,
        data: {
          hasRSVP: false,
          status: null,
          message: 'No RSVP found for this event'
        }
      });
    }

    res.json({
      success: true,
      data: {
        hasRSVP: true,
        rsvp: rsvp,
        status: rsvp.status,
        numberOfGuests: rsvp.numberOfGuests || 0,
        rsvpDate: rsvp.rsvpDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; // Fixed: Added missing closing brace

module.exports = {
  createRSVP,
  cancelRSVP,
  getEventAttendees,
  updateRSVP,
  getUserRSVPs,
  getRSVPStatus
};