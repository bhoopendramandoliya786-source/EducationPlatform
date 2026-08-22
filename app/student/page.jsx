"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { User, Trophy, BookOpen, Flame, Award, ArrowLeft, CheckCircle2, Zap } from "lucide-react";

export default function StudentProfilePage() {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    async function getUserData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) setUser(authUser);
    }
    getUserData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-4">
      <div className="flex items-center justify-between pt-1">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="w-3.5 h-3.5" /> होम
        </Link>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Student Dashboard
        </span>
      </div>

      {/* User Info Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/20 flex items-center gap-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-500/30">
          {user?.email?.substring(0, 1).toUpperCase() || "S"}
        </div>
        <div>
          <h2 className="text-base font-black text-white">{user?.email?.split("@")[0] || "प्रतियोगी छात्र"}</h2>
          <p className="text-xs text-slate-400">{user?.email || "निःशुल्क शिक्षार्थी"}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
          <Flame className="w-5 h-5 text-amber-400 mx-auto" />
          <div className="text-base font-black text-white">12 दिन</div>
          <div className="text-[10px] text-slate-400">डेली स्ट्रीक</div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
          <div className="text-base font-black text-white">100%</div>
          <div className="text-[10px] text-slate-400">सटीकता दर</div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
          <Award className="w-5 h-5 text-indigo-400 mx-auto" />
          <div className="text-base font-black text-white">240 XP</div>
          <div className="text-[10px] text-slate-400">रैंक पॉइंट्स</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-200">अध्ययन सेटिंग्स</h3>
        <div className="grid gap-2 text-xs">
          <Link href="/notes" className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-slate-300 hover:text-white flex items-center justify-between">
            <span>पढ़े गए नोट्स</span>
            <span>→</span>
          </Link>
          <Link href="/quiz" className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-slate-300 hover:text-white flex items-center justify-between">
            <span>दिए गए टेस्ट परिणाम</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
