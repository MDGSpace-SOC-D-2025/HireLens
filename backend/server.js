const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();

// Connect to Database
connectDB();

// --- CORRECT ORDER STARTS HERE ---

// 1. Middleware (MUST come before Routes)
// This allows the server to read JSON data
app.use(express.json());

// This allows the Frontend to talk to the Backend
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// 2. Define Routes (NOW they can use the middleware above)
app.use("/api/auth", require("./routes/auth"));

// --- CORRECT ORDER ENDS HERE ---

// Test Route
app.get("/", (req, res) => {
  res.send("HireLens API is running...");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
