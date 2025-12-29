"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

export default function Register() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [fullname, setfullname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!fullname || !username || !email || !password) {
            setError("All fields are required");
            setLoading(false);
            return;
        }
        try {
            const res = await axios.post("http://localhost:4000/api/v1/auth/register", {
                username,
                fullname,
                email,
                password
            }, { withCredentials: true });
            console.log("Registered:", res.data);
            router.push("/login");

        } catch (error) {
            setError(error.response?.data?.message || "Registration failed")
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="min-h-screen bg-background-dark text-white font-display flex flex-col relative overflow-x-hidden bg-mesh">
            <header className="relative z-10 flex justify-between px-6 sm:px-10 py-5 sm:py-6">
                <h2 className="font-extrabold text-xl sm:text-2xl">DevArena</h2>
                <span className="text-sm text-slate-400">
                    Already have an account?{" "}
                    <a href="/login"><span className="text-primary cursor-pointer hover:underline">Sign In</span></a>
                </span>
            </header>
            <main className="flex-grow flex items-center justify-center p-4 py-7 relative z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>

                <div className="glass-card shadow-glass w-full max-w-[480px] rounded-2xl p-8 md:p-10 relative overflow-hidden group/card animate-fade-in-up">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Enter the Arena</h1>
                        <p className="text-gray-400 text-sm">Join the community of developers</p>
                    </div>
                    {error && (
                        <p className="mb-4 text-red-400 bg-red-500/10 p-3 rounded text-center">
                            {error}
                        </p>
                    )}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="input-glass rounded-full flex items-center px-5 h-12 group/input">
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={fullname}
                                onChange={(e) => setfullname(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 w-full text-sm h-full p-0 outline-none"
                                required
                            />
                        </div>
                        <div className="input-glass rounded-full flex items-center px-5 h-12 group/input">
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 w-full text-sm h-full p-0 outline-none"
                                required
                            />
                        </div>
                        <div className="input-glass rounded-full flex items-center px-5 h-12 group/input">
                            <input
                                type="email"
                                placeholder="Email "
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 w-full text-sm h-full p-0 outline-none"
                                required
                            />
                        </div>

                        <div className="input-glass rounded-full flex items-center px-5 h-12 group/input">

                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 w-full text-sm h-full p-0 outline-none flex-grow"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-500 hover:text-white transition-colors focus:outline-none ml-2"
                            >
                                <span className="material-symbols-outlined text-sm">
                                    {showPassword ? "hide" : "show"}
                                </span>
                            </button>
                        </div>
                        <button type="submit" disabled={loading} className="mt-2 w-full h-12 rounded-full bg-primary hover:bg-primary-hover/90 hover:shadow-[0_0_20px_rgba(83,210,45,0.4)] text-black font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70">
                            {loading ? "Registering..." : "REGISTER →"}
                        </button>
                    </form>
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Already have an account?{" "}
                            <a href="/login" className="text-primary hover:text-white font-semibold transition-colors">
                                Log In
                            </a>
                        </p>
                    </div>
                </div>
            </main>
            <footer className="w-full py-6 text-center text-xs text-gray-600 relative z-10">
                <p>© 2025 DevArena Inc. All rights reserved.</p>
            </footer>
        </div>
    );
}