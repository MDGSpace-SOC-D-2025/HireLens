import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // Data State
  const [meetings, setMeetings] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [mySlots, setMySlots] = useState([]);

  // Interviewer: Availability Form State
  const [availDate, setAvailDate] = useState("");
  const [availTime, setAvailTime] = useState("");

  // Student: Booking State
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");

  //Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const meetingsRes = await axios.get(
          "http://localhost:5001/api/meetings",
          {
            headers: { "x-auth-token": token },
          }
        );
        setMeetings(meetingsRes.data);

        if (role === "interviewee") {
          const interviewersRes = await axios.get(
            "http://localhost:5001/api/auth/interviewers"
          );
          setInterviewers(interviewersRes.data);
        } else if (role === "interviewer") {
          const myProfileRes = await axios.get(
            "http://localhost:5001/api/auth/me",
            {
              headers: { "x-auth-token": token },
            }
          );
          setMySlots(myProfileRes.data.availability || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [role, token]);

  //INTERVIEWER: Add Availability
  const addAvailability = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/availability",
        { date: availDate, time: availTime },
        { headers: { "x-auth-token": token } }
      );
      alert("Slot Added!");
      setMySlots(res.data);
      setAvailDate("");
      setAvailTime("");
    } catch (err) {
      alert("Error adding slot");
    }
  };

  //INTERVIEWER: Delete Availability
  const deleteSlot = async (slotId) => {
    if (!window.confirm("Are you sure you want to remove this slot?")) return;

    try {
      const res = await axios.delete(
        `http://localhost:5001/api/auth/availability/${slotId}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      setMySlots(res.data);
    } catch (err) {
      alert("Error deleting slot");
    }
  };

  //STUDENT: Book Session
  const bookInterview = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return alert("Please select a time slot");

    const [date, time] = selectedSlot.split("|");

    try {
      await axios.post(
        "http://localhost:5001/api/meetings",
        { interviewerId: selectedInterviewer._id, date, time },
        { headers: { "x-auth-token": token } }
      );
      alert("Booking Successful!");
      window.location.reload();
    } catch (err) {
      alert("Booking Failed: " + (err.response?.data?.msg || "Error"));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>
          {role === "interviewer" ? "Expert Dashboard" : "Student Dashboard"}
        </h1>
        <button
          onClick={handleLogout}
          style={{
            background: "red",
            color: "white",
            border: "none",
            padding: "8px 15px",
            borderRadius: "5px",
          }}
        >
          Logout
        </button>
      </div>

      {/*INTERVIEWER VIEW: Add & Manage Slots*/}
      {role === "interviewer" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {/* Left: Add New Slot */}
          <div
            style={{
              background: "#e3f2fd",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <h3>➕ Add New Slot</h3>
            <form
              onSubmit={addAvailability}
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <input
                type="date"
                value={availDate}
                onChange={(e) => setAvailDate(e.target.value)}
                required
                style={{ padding: "8px" }}
              />
              <input
                type="time"
                value={availTime}
                onChange={(e) => setAvailTime(e.target.value)}
                required
                style={{ padding: "8px" }}
              />
              <button
                type="submit"
                style={{
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "10px",
                  cursor: "pointer",
                }}
              >
                Add Slot
              </button>
            </form>
          </div>

          {/* Right: Manage Existing Slots */}
          <div
            style={{
              background: "#f8f9fa",
              padding: "20px",
              borderRadius: "10px",
              border: "1px solid #ddd",
            }}
          >
            <h3>📋 My Slots</h3>
            {mySlots.length === 0 ? (
              <p>No slots added yet.</p>
            ) : (
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                {mySlots.map((slot) => (
                  <li
                    key={slot._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "white",
                      padding: "8px",
                      marginBottom: "5px",
                      border: "1px solid #eee",
                    }}
                  >
                    {/* Slot Info */}
                    <span>
                      {slot.date} at {slot.time}
                      {slot.isBooked ? (
                        <span style={{ color: "red", marginLeft: "5px" }}>
                          (Booked)
                        </span>
                      ) : (
                        <span style={{ color: "green", marginLeft: "5px" }}>
                          (Free)
                        </span>
                      )}
                    </span>

                    {/* Delete Button*/}
                    <button
                      onClick={() => deleteSlot(slot._id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "red",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                      title="Remove Slot"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/*STUDENT VIEW: Market + Booking*/}
      {role === "interviewee" && (
        <div style={{ marginTop: "30px" }}>
          <h2>👨‍💻 Available Experts</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {interviewers.map((expert) => (
              <div
                key={expert._id}
                style={{
                  border: "1px solid #ddd",
                  padding: "20px",
                  borderRadius: "10px",
                }}
              >
                <h3>{expert.name}</h3>
                <p>
                  🏢 {expert.company} | 💼 {expert.position}
                </p>
                <button
                  onClick={() => {
                    setSelectedInterviewer(expert);
                    setSelectedSlot("");
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  View Available Slots
                </button>
              </div>
            ))}
          </div>

          {selectedInterviewer && (
            <div
              style={{
                marginTop: "20px",
                padding: "20px",
                background: "#fff3e0",
                borderRadius: "10px",
                border: "1px solid orange",
              }}
            >
              <h3>Book with {selectedInterviewer.name}</h3>
              <form onSubmit={bookInterview}>
                <label>Select a Time:</label>
                <select
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px",
                    margin: "10px 0",
                  }}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  required
                >
                  <option value="">-- Choose a Slot --</option>
                  {selectedInterviewer.availability
                    .filter((slot) => !slot.isBooked)
                    .map((slot, index) => (
                      <option key={index} value={`${slot.date}|${slot.time}`}>
                        {slot.date} at {slot.time}
                      </option>
                    ))}
                </select>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    background: "green",
                    color: "white",
                    border: "none",
                  }}
                >
                  Confirm Booking
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInterviewer(null)}
                  style={{
                    marginLeft: "10px",
                    padding: "10px",
                    background: "grey",
                    color: "white",
                    border: "none",
                  }}
                >
                  Cancel
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/*COMMON VIEW: UPCOMING MEETINGS*/}
      <div style={{ marginTop: "50px" }}>
        <h2>📅 Your Schedule</h2>
        {meetings.length === 0 ? (
          <p>No meetings yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {meetings.map((meeting) => (
              <li
                key={meeting._id}
                style={{ borderBottom: "1px solid #eee", padding: "15px 0" }}
              >
                <strong>
                  {new Date(meeting.date).toLocaleDateString()} at{" "}
                  {new Date(meeting.date).toLocaleTimeString()}
                </strong>
                <br />
                <small>Room ID: {meeting.roomId}</small>
                <button
                  onClick={() => navigate(`/room/${meeting.roomId}`)}
                  style={{
                    marginLeft: "20px",
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "5px",
                  }}
                >
                  Join Video Call
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
