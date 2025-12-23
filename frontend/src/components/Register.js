import React, { useState } from "react";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "interviewee",
  });

  const { name, email, password, role } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/register",
        formData
      );

      console.log("Registration Success:", res.data);
      alert("Registered Successfully! Token: " + res.data.token);
    } catch (err) {
      console.error("Full Error Object:", err);

      if (err.response && err.response.data) {
        alert("Server Error: " + err.response.data.msg);
      } else {
        alert(
          "Network Error: Could not connect to Backend at Port 5001. Is it running?"
        );
      }
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Sign Up for HireLens</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={name}
            onChange={onChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={email}
            onChange={onChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={onChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>I am an: </label>
          <select
            name="role"
            value={role}
            onChange={onChange}
            style={{ padding: "8px" }}
          >
            <option value="interviewee">Interviewee (Student)</option>
            <option value="interviewer">Interviewer (Expert)</option>
          </select>
        </div>
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
