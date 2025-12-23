const mongoose = require("mongoose");

const MeetingSchema = new mongoose.Schema({
  interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  interviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  // This will store the link for the video call later
  roomId: {
    type: String,
    required: true,
  },
  // This will store the AI Feedback after the call
  aiAnalysis: {
    summary: String,
    suggestions: [String],
  },
});

module.exports = mongoose.model("Meeting", MeetingSchema);
