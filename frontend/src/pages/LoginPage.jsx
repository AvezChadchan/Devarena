import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {

    e.preventDefault();

    if ((!username && !email) || !password) {
      setError("Username or Email and Password required");
      return;
    }
    setLoading(true)
    setError(null)
    try {

      const response = await axios.post("http://localhost:4000/api/v1/auth/login", {
        username,
        email,
        password
      });
      const data = await response.data;

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      console.log("Logged in user:", data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
    finally {
      setLoading(false);
    }

  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1115] text-white">
      <div className="w-full max-w-md bg-[#181b21] p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
        <p className="text-slate-400 mb-6">
          Please enter your details to sign in.
        </p>

        {/* Error message */}
        {error && (
          <p className="mb-4 text-sm text-red-400 bg-red-500/10 p-2 rounded">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              type="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-[#1e2329] border border-[#2d372a] focus:outline-none"
            />
          </div>
          {/* Email */}
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-[#1e2329] border border-[#2d372a] focus:outline-none"
              placeholder="coder@devarena.com"
            />
          </div>


          {/* Password */}
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-[#1e2329] border border-[#2d372a] focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {/* Button */}
          <button
            disabled={loading}
            className="w-full h-12 bg-primary text-black font-bold rounded-full hover:bg-primary-hover transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
