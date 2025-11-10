const RSVP = require('../models/RSVP');
const Event = require('../models/Event');

// @desc    RSVP to an event
// @route   POST /api/events/:id/rsvp
// @access  Private
const createRSVP = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the organizer
    if (event.organizer.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot RSVP to your own event'
      });
    }

    // Check if user already RSVPed
    const existingRSVP = await RSVP.findOne({
      user: req.user.id,
      event: req.params.id
    });

    if (existingRSVP) {
      return res.status(400).json({
        success: false,
        message: 'Already RSVPed to this event'
      });
    }

    // Check if event is full
    const currentAttendees = await RSVP.countDocuments({ 
      event: req.params.id,
      status: 'confirmed'
    });

    if (event.maxAttendees && currentAttendees >= event.maxAttendees) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // Create RSVP
    const rsvp = await RSVP.create({
      user: req.user.id,
      event: req.params.id,
      status: 'confirmed'
    });

    await rsvp.populate('user', 'name email');
    await rsvp.populate('event', 'title date location');

    // Update event attendee count
    await Event.findByIdAndUpdate(req.params.id, {
      $inc: { attendeeCount: 1 }
    });

    res.status(201).json({
      success: true,
      data: rsvp
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel RSVP
// @route   DELETE /api/events/:id/rsvp
// @access  Private
const cancelRSVP = async (req, res) => {
  try {
    const rsvp = await RSVP.findOne({
      user: req.user.id,
      event: req.params.id
    });

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: 'RSVP not found'
      });
    }

    await RSVP.findByIdAndDelete(rsvp._id);

    // Update event attendee count
    await Event.findByIdAndUpdate(req.params.id, {
      $inc: { attendeeCount: -1 }
    });

    res.json({
      success: true,
      message: 'RSVP cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get event attendees
// @route   GET /api/events/:id/attendees
// @access  Public
const getEventAttendees = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const attendees = await RSVP.find({ 
      event: req.params.id,
      status: 'confirmed' 
    })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: attendees.length,
      data: attendees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createRSVP,
  cancelRSVP,
  getEventAttendees
};