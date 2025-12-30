import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "interviewee",
    company: "",
    position: "", // New State
  });

  const { name, email, password, role, company, position } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/register",
        formData
      );
      alert("Registered Successfully!");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", role);
      navigate("/dashboard");
    } catch (err) {
      alert("Error: " + (err.response?.data?.msg || "Registration failed"));
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
      }}
    >
      <h2>Sign Up for HireLens</h2>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Name"
          name="name"
          value={name}
          onChange={onChange}
          required
          style={{
            display: "block",
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
          }}
        />
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={email}
          onChange={onChange}
          required
          style={{
            display: "block",
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={onChange}
          required
          style={{
            display: "block",
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
          }}
        />

        <label>I am an: </label>
        <select
          name="role"
          value={role}
          onChange={onChange}
          style={{ padding: "8px", marginBottom: "10px" }}
        >
          <option value="interviewee">Student (Interviewee)</option>
          <option value="interviewer">Expert (Interviewer)</option>
        </select>

        {/* Show these fields ONLY if role is Interviewer */}
        {role === "interviewer" && (
          <>
            <input
              type="text"
              placeholder="Company (e.g. Google)"
              name="company"
              value={company}
              onChange={onChange}
              required
              style={{
                display: "block",
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
              }}
            />
            <input
              type="text"
              placeholder="Position (e.g. Senior Dev)"
              name="position"
              value={position}
              onChange={onChange}
              required
              style={{
                display: "block",
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
              }}
            />
          </>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
          }}
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
