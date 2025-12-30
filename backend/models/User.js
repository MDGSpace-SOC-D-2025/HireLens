const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["interviewer", "interviewee"], required: true },

  // Interviewer Details
  company: { type: String },
  position: { type: String },

  // NEW: Availability Slots
  availability: [
    {
      date: String, // e.g., "2023-12-25"
      time: String, // e.g., "14:00"
      isBooked: { type: Boolean, default: false },
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
