import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !username || !password) {
      setError("All fields are required")
      return;
    }
    try {
      setLoading(true);
      const response = await fetch("api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password }),
        credentials: "include"
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }
      console.log("Login success", data);
      alert("Login Successfull");

    } catch (err) {
      setError(err)
    }
    finally {
      setLoading(false)
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => { setEmail(e.target.value) }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? "Logging in" : "Login"}</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}

    </div>
  )

}
