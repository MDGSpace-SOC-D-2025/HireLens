const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

//INITIALIZE SOCKET.IO//
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

//Connect to Database
connectDB();

//Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

//Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/meetings", require("./routes/meetings"));

app.get("/", (req, res) => res.send("HireLens API is running..."));

//SOCKET.IO LOGIC (Uses 'io')//
io.on("connection", (socket) => {
  //Give the user their own ID immediately
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callended");
  });

  socket.on("calluser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("calluser", { signal: signalData, from, name });
  });

  socket.on("answercall", (data) => {
    io.to(data.to).emit("callaccepted", data.signal);
  });
});

const PORT = process.env.PORT || 5001;
//Listen on server
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
