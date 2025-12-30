const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth"); // We need middleware for protection
const User = require("../models/User");

// @route   POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, role, company, position } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    user = new User({
      name,
      email,
      password,
      role,
      company: role === "interviewer" ? company : "",
      position: role === "interviewer" ? position : "",
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, role: user.role }); // Send role back
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, role: user.role });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET /api/auth/interviewers
router.get("/interviewers", async (req, res) => {
  try {
    const interviewers = await User.find({ role: "interviewer" }).select(
      "-password"
    );
    res.json(interviewers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile (to see my availability)
router.get("/me", async (req, res) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/auth/availability
// @desc    Interviewer adds a slot
router.post("/availability", async (req, res) => {
  const token = req.header("x-auth-token");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id);

    const { date, time } = req.body;
    user.availability.push({ date, time, isBooked: false });

    await user.save();
    res.json(user.availability);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   DELETE /api/auth/availability/:slotId
// @desc    Interviewer deletes a slot
router.delete("/availability/:slotId", async (req, res) => {
  const token = req.header("x-auth-token");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id);

    // Filter out the slot we want to remove
    user.availability = user.availability.filter(
      (slot) => slot._id.toString() !== req.params.slotId
    );

    await user.save();
    res.json(user.availability); // Return updated list
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
