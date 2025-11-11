const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
      validate: {
        validator: function (date) {
          return date > new Date();
        },
        message: "Event date must be in the future",
      },
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
      validate: {
        validator: function (time) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
        },
        message: "Time must be in HH:MM format",
      },
    },
    duration: {
      type: Number, // Duration in hours
      default: 2,
      min: [0.5, "Duration must be at least 30 minutes"],
      max: [24, "Duration cannot exceed 24 hours"],
    },
    location: {
      address: {
        type: String,
        required: [true, "Event address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
      },
      coordinates: {
        latitude: {
          type: Number,
          min: [-90, "Latitude must be between -90 and 90"],
          max: [90, "Latitude must be between -90 and 90"],
        },
        longitude: {
          type: Number,
          min: [-180, "Longitude must be between -180 and 180"],
          max: [180, "Longitude must be between -180 and 180"],
        },
      },
    },
    category: {
      type: String,
      required: [true, "Event category is required"],
      enum: {
        values: [
          "conference",
          "workshop",
          "social",
          "sports",
          "music",
          "business",
          "education",
          "other",
        ],
        message:
          "Category must be one of: conference, workshop, social, sports, music, business, education, other",
      },
    },
    maxAttendees: {
      type: Number,
      required: [true, "Maximum attendees is required"],
      min: [1, "Maximum attendees must be at least 1"],
      max: [10000, "Maximum attendees cannot exceed 10,000"],
    },
    currentAttendees: {
      type: Number,
      default: 0,
      min: 0,
    },
    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "CAD"],
    },
    image: {
      type: String,
      default: "https://via.placeholder.com/400x200?text=Event+Image",
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Event organizer is required"],
    },
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "published",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    requirements: {
      type: String,
      maxlength: [500, "Requirements cannot exceed 500 characters"],
    },
    contactEmail: {
      type: String,
      validate: {
        validator: function (email) {
          return !email || /\S+@\S+\.\S+/.test(email);
        },
        message: "Please provide a valid contact email",
      },
    },
    image: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ "location.city": 1 });
eventSchema.index({ tags: 1 });

// Virtual for checking if event is full
eventSchema.virtual("isFull").get(function () {
  return this.currentAttendees >= this.maxAttendees;
});

// Virtual for available spots
eventSchema.virtual("availableSpots").get(function () {
  return this.maxAttendees - this.currentAttendees;
});

// Ensure virtuals are included in JSON output
eventSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Event", eventSchema);
