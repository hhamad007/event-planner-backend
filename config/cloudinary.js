const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Memory storage for multer (we'll upload to Cloudinary manually)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Multer configuration for event images
const uploadEventImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Multer configuration for user avatars
const uploadAvatar = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for avatars
  },
  fileFilter: fileFilter,
});

// Upload to Cloudinary function
const uploadToCloudinary = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: "auto",
      ...options,
    };

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });
};

// Upload event image to Cloudinary
const uploadEventImageToCloud = async (buffer, eventId) => {
  const options = {
    folder: "event-planner/events",
    public_id: `event_${eventId}_${Date.now()}`,
    transformation: [
      { width: 800, height: 600, crop: "fill" },
      { quality: "auto" },
    ],
  };

  return await uploadToCloudinary(buffer, options);
};

// Upload avatar to Cloudinary
const uploadAvatarToCloud = async (buffer, userId) => {
  const options = {
    folder: "event-planner/avatars",
    public_id: `avatar_${userId}_${Date.now()}`,
    transformation: [
      { width: 200, height: 200, crop: "fill", gravity: "face" },
      { quality: "auto" },
    ],
  };

  return await uploadToCloudinary(buffer, options);
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadEventImage,
  uploadAvatar,
  uploadEventImageToCloud,
  uploadAvatarToCloud,
  deleteImage,
};
