import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role"); // Get role from storage

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Dashboard</h1>

      {role === "interviewer" ? (
        <div
          style={{
            backgroundColor: "#e3f2fd",
            padding: "20px",
            margin: "20px",
          }}
        >
          <h2>👨‍🏫 Interviewer Panel</h2>
          <p>Here you can schedule new meetings and review candidates.</p>
          <button style={{ padding: "10px", fontSize: "16px" }}>
            + Schedule New Interview
          </button>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#fff3e0",
            padding: "20px",
            margin: "20px",
          }}
        >
          <h2>👨‍🎓 Student Portal</h2>
          <p>Your upcoming mock interviews will appear here.</p>
          <button style={{ padding: "10px", fontSize: "16px" }}>
            Join Interview Room
          </button>
        </div>
      )}

      <button
        onClick={handleLogout}
        style={{
          marginTop: "20px",
          backgroundColor: "red",
          color: "white",
          padding: "10px",
          border: "none",
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
