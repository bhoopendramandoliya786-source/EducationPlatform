"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  Trophy, BookOpen, Flame, Award, ArrowLeft, 
  CheckCircle2, Zap, Clock, Share2, 
  Sparkles, ChevronRight, Target, ShieldCheck, LogOut, Loader2
} from "lucide-react";

export default function StudentProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ streak: 0, solved: 0, accuracy: 100, xp: 0 });
  const [targetExam, setTargetExam] = useState("CET / REET 2026");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          router.push("/login");
          return;
        }

        if (isMounted) setUser(authUser);

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profileData && isMounted) {
          setProfile(profileData);
        }

        const { count: solvedCount } = await supabase
          .from("progress")
          .select("id", { count: "exact", head: true })
          .eq("user_id", authUser.id);

        const currentStreak = profileData?.streak_count || 0;
        const totalSolved = solvedCount || 0;
        const calculatedXP = (totalSolved * 10) + (currentStreak * 25);

        if (isMounted) {
          setStats({
            streak: currentStreak,
            solved: totalSolved,
            accuracy: totalSolved > 0 ? 92 : 100,
            xp: calculatedXP
          });
        }
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const shareProfileStats = () => {
    const text = `🔥 EduAI Pro पर मेरी ${stats.streak} दिनों की डेली स्ट्रीक और ${stats.xp} XP पॉइंट्स हैं! 🎯\n\nआप भी राजस्थान GK और 100 PYQ टेस्ट्स की तैयारी करें: https://education-platform-fawn-six.vercel.app`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-2.5 text-emerald-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-xs text-slate-400 font-medium">VIP डैशबोर्ड लोड हो रहा है...</p>
      </div>
    );
  }

  const studentName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "प्रतियोगी छात्र";

  return (
    <main className="max-w-lg mx-auto px-3.5 pb-24 pt-2 space-y-4 font-sans select-none">

      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link 
          href="/" 
          aria-label="होमपेज पर वापस जाएँ"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-4 h-4" /> वापस होम
        </Link>
        <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm shadow-emerald-500/10">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> VIP MEMBER
        </span>
      </div>

      {/* VIP Profile Banner Card */}
      <section className="p-5 rounded-[28px] bg-gradient-to-b from-slate-900/95 to-slate-950 border border-emerald-500/25 shadow-2xl relative overflow-hidden backdrop-blur-xl space-y-4">
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-[2px] shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-emerald-400 text-lg">
                  {studentName.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-0.5 border border-slate-950 shadow">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black text-white leading-tight">
                  {studentName}
                </h1>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 rounded">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {user?.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={shareProfileStats}
            title="WhatsApp पर शेयर करें"
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition active:scale-95 shadow cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Target Exam Selector */}
      <section className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase">टारगेट एग्जाम</span>
            <span className="text-xs font-bold text-white">{targetExam}</span>
          </div>
        </div>
        <select
          value={targetExam}
          onChange={(e) => setTargetExam(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-emerald-300 outline-none cursor-pointer hover:border-emerald-500/40"
        >
          <option value="CET / REET 2026">CET / REET 2026</option>
          <option value="RPSC 2nd Grade">RPSC 2nd Grade</option>
          <option value="RAS Pre 2026">RAS Pre 2026</option>
          <option value="Rajasthan Police">Rajasthan Police</option>
          <option value="Patwar Exam 2026">Patwar Exam 2026</option>
        </select>
      </section>

      {/* Real Performance Metrics (3 Pillars) */}
      <section className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/20 text-center space-y-1 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4 animate-pulse fill-current" />
          </div>
          <div className="text-sm font-black text-white">{stats.streak} दिन</div>
          <div className="text-[9px] text-amber-400/90 font-bold uppercase tracking-wider">डेली स्ट्रीक</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/20 text-center space-y-1 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-sm font-black text-white">{stats.solved} हल</div>
          <div className="text-[9px] text-emerald-400/90 font-bold uppercase tracking-wider">PYQ प्रश्न</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-teal-500/20 text-center space-y-1 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 mx-auto flex items-center justify-center text-teal-400">
            <Award className="w-4 h-4" />
          </div>
          <div className="text-sm font-black text-white">{stats.xp} XP</div>
          <div className="text-[9px] text-teal-400/90 font-bold uppercase tracking-wider">रैंक पॉइंट्स</div>
        </div>
      </section>

      {/* Quick Action Navigation */}
      <section className="p-4 rounded-[28px] bg-slate-900/80 border border-slate-800/90 space-y-2.5 shadow-xl">
        <h2 className="text-xs font-bold text-slate-300 px-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>अध्ययन हब एवं टेस्ट सीरीज़</span>
        </h2>

        <div className="grid gap-2 text-xs">
          <Link 
            href="/quiz" 
            className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-emerald-500/50 text-slate-300 hover:text-white flex items-center justify-between group transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold block text-white">स्पीड टेस्ट और PYQ सेट्स</span>
                <span className="text-[10px] text-slate-400">अध्यायवार 20-20 टेस्ट सीरीज दें</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition" />
          </Link>

          <Link 
            href="/notes" 
            className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-emerald-500/50 text-slate-300 hover:text-white flex items-center justify-between group transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold block text-white">स्मार्ट रिवीजन नोट्स</span>
                <span className="text-[10px] text-slate-400">टू-द-पॉइंट संक्षिप्त नोट्स पढ़ें</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition" />
          </Link>

          <Link 
            href="/ai-tutor" 
            className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-emerald-500/50 text-slate-300 hover:text-white flex items-center justify-between group transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold block text-white">AI डाउट सॉल्वर</span>
                <span className="text-[10px] text-slate-400">कठिन प्रश्नों की तुरंत व्याख्या पूछें</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition" />
          </Link>
        </div>
      </section>

      {/* Sync Status & Sign Out */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
          <Clock className="w-3 h-3 text-emerald-400" />
          <span>क्लाउड डेटा सिंक सक्रिय</span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl transition active:scale-95 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>लॉगआउट</span>
        </button>
      </div>

    </main>
  );
}