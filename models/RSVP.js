const mongoose = require("mongoose");

const rsvpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required for RSVP"],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required for RSVP"],
    },
    status: {
      type: String,
      enum: {
        values: ["attending", "maybe", "not_attending", "waitlist"],
        message: "Status must be: attending, maybe, not_attending, or waitlist",
      },
      required: [true, "RSVP status is required"],
    },
    rsvpDate: {
      type: Date,
      default: Date.now,
    },
    numberOfGuests: {
      type: Number,
      default: 0,
      min: [0, "Number of guests cannot be negative"],
      max: [10, "Cannot bring more than 10 guests"],
    },
    specialRequests: {
      type: String,
      maxlength: [300, "Special requests cannot exceed 300 characters"],
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkInTime: {
      type: Date,
    },
    qrCode: {
      type: String, // For event check-in QR codes
    },
    reminder: {
      sent: {
        type: Boolean,
        default: false,
      },
      sentAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one RSVP per user per event
rsvpSchema.index({ user: 1, event: 1 }, { unique: true });

// Index for queries
rsvpSchema.index({ event: 1, status: 1 });
rsvpSchema.index({ user: 1 });

// Virtual to get total attendees (user + guests)
rsvpSchema.virtual("totalAttendees").get(function () {
  return 1 + this.numberOfGuests; // User + guests
});

// Static method to get event attendance count
rsvpSchema.statics.getEventAttendance = async function (eventId) {
  const result = await this.aggregate([
    {
      $match: {
        event: mongoose.Types.ObjectId(eventId),
        status: "attending",
      },
    },
    {
      $group: {
        _id: null,
        totalAttendees: {
          $sum: { $add: [1, "$numberOfGuests"] },
        },
        rsvpCount: { $sum: 1 },
      },
    },
  ]);

  return result[0] || { totalAttendees: 0, rsvpCount: 0 };
};

// Method to check if user can still bring guests
rsvpSchema.methods.canBringGuests = function (additionalGuests = 0) {
  return this.numberOfGuests + additionalGuests <= 10;
};

// Ensure virtuals are included in JSON output
rsvpSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("RSVP", rsvpSchema);
