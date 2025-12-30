import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import VideoRoom from "./components/VideoRoom";

function App() {
  return (
    <Router>
      <div className="App">
        {}
        <nav style={{ padding: "10px", background: "#333", color: "white" }}>
          <Link to="/register" style={{ color: "white", marginRight: "15px" }}>
            Register
          </Link>
          <Link to="/login" style={{ color: "white", marginRight: "15px" }}>
            Login
          </Link>
          <Link to="/dashboard" style={{ color: "white" }}>
            Dashboard
          </Link>
        </nav>

        {}
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Login />} />
          <Route path="/room/:roomId" element={<VideoRoom />} /> //
        </Routes>
      </div>
    </Router>
  );
}

export default App;
