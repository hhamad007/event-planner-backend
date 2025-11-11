const { cloudinary, deleteImage } = require("../config/cloudinary");
const Event = require("../models/Event");
const User = require("../models/User");

// @desc    Upload event image
// @route   POST /api/upload/event/:eventId
// @access  Private (Event owner only)

const uploadEventImage = async (req, res) => {
  try {
    console.log("🔍 Debug Info:");
    console.log("req.user:", req.user);
    console.log("req.user.id:", req.user?.id);
    console.log("req.params.eventId:", req.params.eventId);
    console.log("req.file:", req.file ? "File present" : "No file");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed - req.user is undefined",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

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

    console.log("📤 Uploading to Cloudinary...");

    // FIXED: Use the uploadEventImageToCloud function from config/cloudinary.js
    const { uploadEventImageToCloud } = require("../config/cloudinary");
    const cloudinaryResult = await uploadEventImageToCloud(
      req.file.buffer,
      req.params.eventId
    );

    console.log("Cloudinary result:", cloudinaryResult);

    // Delete old image if exists
    if (event.image && event.image.publicId) {
      await deleteImage(event.image.publicId);
    }

    // FIXED: Update event with Cloudinary response
    event.image = {
      url: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
    };

    await event.save();

    // FIXED: Return Cloudinary URLs
    res.json({
      success: true,
      message: "Event image uploaded successfully",
      data: {
        imageUrl: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
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

    console.log("📤 Uploading avatar to Cloudinary...");

    // FIXED: Use the uploadAvatarToCloud function
    const { uploadAvatarToCloud } = require("../config/cloudinary");
    const cloudinaryResult = await uploadAvatarToCloud(
      req.file.buffer,
      req.user.id
    );

    // Delete old avatar if exists
    if (user.profilePicture && user.profilePicture.publicId) {
      await deleteImage(user.profilePicture.publicId);
    }

    // FIXED: Update user with Cloudinary response
    user.profilePicture = {
      url: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
    };

    await user.save();

    // FIXED: Return Cloudinary URLs
    res.json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        imageUrl: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
      },
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
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
