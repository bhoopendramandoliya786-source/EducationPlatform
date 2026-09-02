"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, Lock, Mail, Loader2, UserCheck, AlertCircle, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMsg(
          error.message === "Invalid login credentials"
            ? "गलत ईमेल या पासवर्ड। कृपया पुनः जांचें।"
            : error.message || "लॉगिन विफल रहा।"
        );
        setLoading(false);
      } else {
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "login", {
            method: "Email",
          });
        }

        router.push("/student");
        router.refresh();
      }
    } catch (err) {
      setErrorMsg("इंटरनेट कनेक्शन धीमा है। कृपया पुनः प्रयास करें।");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-20 space-y-4 font-sans select-none">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> वापस होम
      </Link>

      <div className="p-6 rounded-[28px] bg-gradient-to-b from-slate-900/95 to-slate-950 border border-emerald-500/20 space-y-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">विद्यार्थी लॉगिन</h1>
          <p className="text-xs text-slate-400">अपनी प्रोग्रेस, टेस्ट स्कोर और स्ट्रीक सुरक्षित रखें</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300">ईमेल आईडी</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300">पासवर्ड</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-xs font-black text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-70 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>लॉगिन हो रहा है...</span>
              </>
            ) : (
              <span>लॉगिन करें →</span>
            )}
          </button>
        </form>

        <div className="text-center pt-1 text-xs text-slate-400">
          खाता नहीं है?{" "}
          <Link href="/signup" className="text-emerald-400 font-bold hover:underline ml-0.5">
            निशुल्क रजिस्टर करें
          </Link>
        </div>
      </div>
    </div>
  );
}