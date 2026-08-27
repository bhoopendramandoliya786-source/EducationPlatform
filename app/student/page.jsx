"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { 
  Trophy, BookOpen, Flame, Award, ArrowLeft, 
  CheckCircle2, Zap, Bookmark, Clock, Share2, 
  Settings2, Sparkles, ChevronRight, Target
} from "lucide-react";

export default function StudentProfilePage() {
  const [user, setUser] = useState(null);
  const [targetExam, setTargetExam] = useState("CET / REET 2026");
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    async function getUserData() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (isMounted && authUser) setUser(authUser);
      } catch (err) {
        console.error("Auth User Fetch Error:", err);
      }
    }
    getUserData();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const shareProfileStats = () => {
    const text = `🔥 EduAI Pro पर मेरी 12 दिनों की डेली स्ट्रीक और 240 XP रैंक पॉइंट्स हैं! 🎯\n\nआप भी राजस्थान GK और 100 PYQ टेस्ट्स की तैयारी करें: https://education-platform-fawn-six.vercel.app`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <main className="max-w-md mx-auto px-4 pb-28 pt-1 space-y-4 font-sans select-none">

      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between pt-1">
        <Link 
          href="/" 
          aria-label="होमपेज पर वापस जाएँ"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> वापस होम
        </Link>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" /> Student Dashboard
        </span>
      </div>

      {/* User Info Card */}
      <section aria-label="यूज़र प्रोफाइल विवरण" className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/60 border border-indigo-500/20 flex items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/30">
            {user?.email?.substring(0, 1).toUpperCase() || "S"}
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white leading-tight">
              {user?.email?.split("@")[0] || "प्रतियोगी छात्र"}
            </h1>
            <p className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {user?.email || "निःशुल्क शिक्षार्थी"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={shareProfileStats}
          aria-label="प्रोफाइल प्रोग्रेस WhatsApp पर शेयर करें"
          className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-emerald-400 hover:bg-slate-800 transition active:scale-95 cursor-pointer flex-shrink-0"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </section>

      {/* Target Exam Goal Card */}
      <section aria-label="लक्ष्य परीक्षा चयन" className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase">लक्ष्य परीक्षा</span>
            <span className="text-xs font-bold text-white">{targetExam}</span>
          </div>
        </div>
        <select
          aria-label="लक्ष्य परीक्षा चुनें"
          value={targetExam}
          onChange={(e) => setTargetExam(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-indigo-300 outline-none cursor-pointer"
        >
          <option value="CET / REET 2026">CET / REET 2026</option>
          <option value="RPSC 2nd Grade">RPSC 2nd Grade</option>
          <option value="RAS Pre 2026">RAS Pre 2026</option>
          <option value="Rajasthan Police">Rajasthan Police</option>
        </select>
      </section>

      {/* Stats Cards */}
      <section aria-label="अध्ययन आंकड़े" className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1 shadow-md">
          <Flame className="w-5 h-5 text-amber-400 mx-auto fill-current" />
          <div className="text-sm font-black text-white">12 दिन</div>
          <div className="text-[9px] text-slate-400 font-medium">डेली स्ट्रीक</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1 shadow-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
          <div className="text-sm font-black text-white">100%</div>
          <div className="text-[9px] text-slate-400 font-medium">सटीकता दर</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1 shadow-md">
          <Award className="w-5 h-5 text-indigo-400 mx-auto" />
          <div className="text-sm font-black text-white">240 XP</div>
          <div className="text-[9px] text-slate-400 font-medium">रैंक पॉइंट्स</div>
        </div>
      </section>

      {/* Study & Future Features Hub */}
      <section aria-label="अध्ययन हब लिंक्स" className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-xl">
        <h2 className="text-xs font-bold text-slate-200 px-1">अध्ययन ट्रैकर एवं सेशन्स</h2>

        <div className="grid gap-2 text-xs">
          <Link 
            href="/notes" 
            aria-label="पढ़े गए थ्योरी नोट्स देखें"
            className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white flex items-center justify-between group transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold">पढ़े गए स्मार्ट नोट्स</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition" />
          </Link>

          <Link 
            href="/quiz" 
            aria-label="स्पीड टेस्ट और टेस्ट रिकॉर्ड्स देखें"
            className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white flex items-center justify-between group transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">दिए गए मॉक टेस्ट व PYQ परिणाम</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition" />
          </Link>

          <Link 
            href="/ai-tutor" 
            aria-label="AI डाउट हिस्ट्री खोलें"
            className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white flex items-center justify-between group transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="font-semibold">AI ट्यूटर डाउट हिस्ट्री</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition" />
          </Link>

          <Link 
            href="/creator" 
            aria-label="HD क्विज़ रील्स क्रिएटर खोलें"
            className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white flex items-center justify-between group transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span className="font-semibold">1-क्लिक रील्स क्रिएटर</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-rose-400 transition" />
          </Link>
        </div>
      </section>

      {/* Upcoming Cloud Sync Box */}
      <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5 text-indigo-300 font-medium">
          <Clock className="w-3.5 h-3.5" /> क्लाउड ऑटो-सिंक एक्टिव
        </span>
        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
          ✓ ऑनलाइन
        </span>
      </div>

    </main>
  );
}