const { cloudinary, deleteImage } = require("../config/cloudinary");
const Event = require("../models/Event");
const User = require("../models/User");

// @desc    Upload event image
// @route   POST /api/upload/event/:eventId
// @access  Private (Event owner only)

const uploadEventImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      // Delete uploaded image if event not found
      await deleteImage(req.file.filename);
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if user owns the event
    if (event.organiser.toString() !== req.user.id) {
      // Delete uploaded image if not authorized
      await deleteImage(req.file.filename);
      return res.status(403).json({
        success: false,
        message: "Not authorised to update this event",
      });
    }

    // Delete old image if exists
    if (event.image && event.image.publicId) {
      await deleteImage(event.image.publicId);
    }

    // Update event with new image
    event.image = {
      url: req.file.path,
      publicId: req.file.filename,
    };

    await event.save();

    res.json({
      success: true,
      message: "Event image uploaded successfully",
      data: {
        imageUrl: req.file.path,
        publicId: req.file.filename,
      },
    });
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file && req.file.filename) {
      await deleteImage(req.file.filename);
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Upload user avatar
// @route   POST /api/upload/avatar
// @access  Private

const uploadUserAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const user = await User.findById(req.user.id);

    // Delete old avatar if exists
    if (user.profilePicture && user.profilePicture.publicId) {
      await deleteImage(user.profilePicture.publicId);
    }

    // Update user with new avatar
    user.profilePicture = {
      url: req.file.path,
      publicId: req.file.filename,
    };

    await user.save();

    res.json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        imageUrl: req.file.path,
        publicId: req.file.filename,
      },
    });
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file && req.file.filename) {
      await deleteImage(req.file.filename);
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete event image
// @route   DELETE /api/upload/event/:eventId
// @access  Private (Event owner only)
const deleteEventImage = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if user owns the event
    if (event.organiser.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to update this event",
      });
    }

    if (!event.image || !event.image.publicId) {
      return res.status(400).json({
        success: false,
        message: "No image to delete",
      });
    }

    // Delete image from Cloudinary
    await deleteImage(event.image.publicId);

    // Remove image from event
    event.image = undefined;
    await event.save();

    res.json({
      success: true,
      message: "Event image deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete user avatar
// @route   DELETE /api/upload/avatar
// @access  Private
const deleteUserAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.profilePicture || !user.profilePicture.publicId) {
      return res.status(400).json({
        success: false,
        message: "No avatar to delete",
      });
    }

    // Delete image from Cloudinary
    await deleteImage(user.profilePicture.publicId);

    // Remove avatar from user
    user.profilePicture = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Avatar deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  uploadEventImage,
  uploadUserAvatar,
  deleteEventImage,
  deleteUserAvatar,
};
