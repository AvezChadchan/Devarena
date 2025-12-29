"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await axios.post("http://localhost:4000/api/v1/auth/login", {
                username,
                email,
                password
            }, {
                withCredentials: true
            });

            console.log("Logged in user:", res.data);

            router.push("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-background-dark text-white font-display overflow-hidden flex flex-col">

            <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] bg-grid -z-10" />
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 blur-[100px] rounded-full -z-10" />

            <header className="relative z-10 flex justify-between px-6 sm:px-10 py-5 sm:py-6">
                <h2 className="font-extrabold text-xl sm:text-2xl">DevArena</h2>
                <span className="text-sm text-slate-400">
                    Don’t have an account?{" "}
                    <a href="/register">
                        <span className="text-primary cursor-pointer hover:underline" >Sign Up</span>
                    </a>
                </span>
            </header>

            <main className="relative z-10 flex-1 grid lg:grid-cols-2 gap-10 max-w-7xl mx-auto px-6 sm:px-10 pb-10 items-center">

                <div className="hidden lg:flex flex-col justify-center gap-6">
                    <h1 className="text-4xl sm:text-5xl font-black leading-tight">
                        Master the Art of <br />
                        <span className="text-primary">Competitive Coding</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-md">
                        Join thousands of developers sharpening their skills in real-time contests.
                    </p>

                    <div className="glass-card rounded-2xl p-6 max-w-md">
                        <pre className="text-sm text-primary font-mono overflow-x-auto">
                            {`def solve_problem(user):
    if user.status == "ready":
        return "Win Contest"
    else:
        user.train_harder()`}
                        </pre>
                    </div>
                </div>

                <div className="glass-card neon-glow rounded-2xl p-8 sm:p-10 max-w-md w-full mx-auto">
                    <h3 className="text-3xl font-bold mb-2">Welcome back</h3>
                    <p className="text-slate-400 mb-8">
                        Enter your credentials to access the arena.
                    </p>

                    {error && (
                        <p className="mb-6 text-red-400 bg-red-500/10 p-3 rounded text-center">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-sm text-slate-300">Username</label>
                            <input
                                type="text"
                                className="w-full mt-1 h-12 px-4 rounded-xl bg-[#1e2329] border border-[#2d372a] focus:border-primary focus:outline-none transition"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="coder"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-slate-300">Email</label>
                            <input
                                type="email"
                                className="w-full mt-1 h-12 px-4 rounded-xl bg-[#1e2329] border border-[#2d372a] focus:border-primary focus:outline-none transition"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="code@devarena.com"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-slate-300">Password</label>
                            <input
                                type="password"
                                className="w-full mt-1 h-12 px-4 rounded-xl bg-[#1e2329] border border-[#2d372a] focus:border-primary focus:outline-none transition"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="w-full h-12 bg-primary hover:bg-primary-hover text-black font-bold rounded-full transition transform hover:scale-105 disabled:opacity-70"
                        >
                            {loading ? "Signing in..." : "SIGN IN →"}
                        </button>
                    </form>
                </div>
            </main>

            <footer className="relative z-10 text-center text-slate-600 text-xs sm:text-sm py-4">
                © 2025 DevArena Inc. All rights reserved.
            </footer>
        </div>
    );
}