"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { ArrowLeft, Lock, Mail, Sparkles, UserPlus } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const supabase = createClient();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message || "रजिस्ट्रेशन विफल रहा।");
      } else {
        setSuccessMsg("सफल रजिस्ट्रेशन! अब आप लॉगिन कर सकते हैं।");
        setTimeout(() => router.push("/login"), 1500);
      }
    } catch (err) {
      setErrorMsg("नेटवर्क समस्या। पुनः प्रयास करें।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-4 space-y-5">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
        <ArrowLeft className="w-3.5 h-3.5" /> वापस होम पर
      </Link>

      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/20 space-y-4 shadow-xl">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-black text-white">नया खाता बनाएँ (Sign Up)</h1>
          <p className="text-xs text-slate-400">100% निशुल्क - सभी नोट्स और टेस्ट सीरीज़</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300">ईमेल आईडी</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300">पासवर्ड (न्यूनतम 6 अक्षर)</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 active:scale-95 disabled:opacity-50 transition"
          >
            {loading ? "खाता बन रहा है..." : "अकाउंट बनाएँ →"}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-400">
          पहले से खाता है?{" "}
          <Link href="/login" className="text-indigo-400 font-bold hover:underline">
            लॉगिन करें
          </Link>
        </div>
      </div>
    </div>
  );
}
