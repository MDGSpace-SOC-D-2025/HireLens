const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Meeting = require("../models/Meeting");
const User = require("../models/User");

// @route   POST /api/meetings
// @desc    Student books an Interviewer (and consumes a time slot)
router.post("/", auth, async (req, res) => {
  try {
    const { interviewerId, date, time } = req.body;

    //Check if the logged-in user is a Student
    if (req.user.role !== "interviewee") {
      return res.status(400).json({ msg: "Only students can book interviews" });
    }

    //Find the Interviewer
    const interviewer = await User.findById(interviewerId);
    if (!interviewer) {
      return res.status(404).json({ msg: "Interviewer not found" });
    }

    //Find the specific slot in their availability
    // We look for a slot that matches the Date + Time AND is not yet booked
    const slotIndex = interviewer.availability.findIndex(
      (s) => s.date === date && s.time === time && s.isBooked === false
    );

    if (slotIndex === -1) {
      return res.status(400).json({ msg: "This slot is no longer available!" });
    }

    //Mark the slot as booked
    interviewer.availability[slotIndex].isBooked = true;
    await interviewer.save(); // Save the interviewer's new schedule

    //Create the Meeting
    const newMeeting = new Meeting({
      interviewer: interviewerId,
      interviewee: req.user.id,
      date: new Date(`${date}T${time}`),
      roomId: "room-" + Date.now(), // Generate unique room ID
    });

    const meeting = await newMeeting.save();
    res.json(meeting);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/meetings
// @desc    Get all meetings for the logged-in user
router.get("/", auth, async (req, res) => {
  try {
    // Find meetings where I am EITHER the interviewer OR the interviewee
    const meetings = await Meeting.find({
      $or: [{ interviewer: req.user.id }, { interviewee: req.user.id }],
    })
      .populate("interviewer", "name company position") // Get expert details
      .populate("interviewee", "name"); // Get student details

    res.json(meetings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
