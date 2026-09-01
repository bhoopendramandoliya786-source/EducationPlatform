"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { ArrowLeft, Lock, Mail, User, Loader2, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const supabase = createClient();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (password.length < 6) {
      setErrorMsg("पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        setErrorMsg(
          error.message === "User already registered"
            ? "यह ईमेल आईडी पहले से पंजीकृत है। कृपया लॉगिन करें।"
            : error.message || "रजिस्ट्रेशन विफल रहा।"
        );
        setLoading(false);
      } else {
        // 1. Google Analytics Sign Up Event Trigger
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "sign_up", {
            method: "Email",
          });
        }

        // 2. Email Confirmation Check
        if (data?.session) {
          // Direct login if email confirmation is disabled
          router.push("/student");
          router.refresh();
        } else {
          // If email confirmation is enabled in Supabase
          setSuccessMsg("खाता सफलतापूर्वक बन गया! अपनी ईमेल पर आए लिंक से वेरिफाई करें या लॉगिन करें।");
          setLoading(false);
        }
      }
    } catch (err) {
      setErrorMsg("इंटरनेट कनेक्शन धीमा है। कृपया पुनः प्रयास करें।");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> वापस होम पर
      </Link>

      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/20 space-y-5 shadow-2xl relative overflow-hidden">
        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-black text-white">नया खाता बनाएं</h1>
          <p className="text-xs text-slate-400">अपनी तैयारी शुरू करें और रैंक ट्रैक करें</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300">पूरा नाम</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                disabled={loading}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="विद्यार्थी का नाम"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
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
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-70 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>खाता बनाया जा रहा है...</span>
              </>
            ) : (
              <span>रजिस्टर करें →</span>
            )}
          </button>
        </form>

        <div className="text-center pt-1 text-xs text-slate-400">
          पहले से खाता है?{" "}
          <Link href="/login" className="text-indigo-400 font-bold hover:underline">
            लॉगिन करें
          </Link>
        </div>
      </div>
    </div>
  );
}