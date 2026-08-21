"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData?.session) {
      setMessage("Session creation failed. Please retry.");
      setLoading(false);
      return;
    }

    // Hard Redirect: ब्राउज़र की सारी पुरानी मेमोरी साफ़ करके सीधे स्टूडेंट डैशबोर्ड लोड होगा
    window.location.href = "/student";
  }

  return (
    <main className="min-h-screen bg-[#050711] text-slate-100 flex items-center justify-center p-4">

      {/* Background Ambient Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-2xl p-7 sm:p-9 shadow-2xl space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <span className="text-white font-black text-xl">E</span>
            </div>
            <span className="text-2xl font-black text-white">Edu<span className="text-indigo-400">AI</span> PRO</span>
          </Link>

          <h1 className="text-2xl font-black text-white">
            Welcome Back 👋
          </h1>
          <p className="text-xs text-slate-400">
            अपनी पढ़ाई और टेस्ट सीरीज़ जारी रखने के लिए लॉगिन करें
          </p>
        </div>

        {/* Error / Alert Message */}
        {message && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center">
            {message}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 ml-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login to Student Portal ➔"}
          </button>
        </form>

        {/* Sign Up Footer */}
        <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
          खाता नहीं है?{" "}
          <Link href="/signup" className="text-amber-400 hover:text-amber-300 font-bold ml-1">
            नया अकाउंट बनाएँ (Start Free)
          </Link>
        </div>

      </div>
    </main>
  );
}