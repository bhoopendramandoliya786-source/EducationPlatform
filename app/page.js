"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import { 
  BookOpen, Trophy, 
  ChevronRight, ChevronDown, ArrowRight, Zap, FolderTree, Sparkles 
} from "lucide-react";

export default function HomePage() {
  const [subjects, setSubjects] = useState([]);
  const [banners, setBanners] = useState([]);
  const [counts, setCounts] = useState({ notes: 0, tests: 0, subjects: 0 });
  const [isOpenSubjects, setIsOpenSubjects] = useState(true);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    async function loadAllData() {
      try {
        const [subsRes, bannersRes, notesRes, quizRes] = await Promise.all([
          supabase
            .from("subjects")
            .select("id, name, icon, is_active")
            .eq("is_active", true)
            .order("sort_order", { ascending: true })
            .order("id", { ascending: true }),
          supabase
            .from("banners")
            .select("id, title, badge_text, link")
            .order("created_at", { ascending: false })
            .limit(3),
          supabase.from("notes").select("id", { count: "exact", head: true }),
          supabase.from("quizzes").select("id", { count: "exact", head: true })
        ]);

        if (isMounted) {
          const loadedSubs = subsRes.data || [];
          setSubjects(loadedSubs);
          setBanners(bannersRes.data || []);
          setCounts({
            notes: notesRes.count || 0,
            tests: quizRes.count || 0,
            subjects: loadedSubs.length
          });
        }
      } catch (err) {
        console.error("Home Load Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAllData();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  return (
    <main className="max-w-md mx-auto px-4 space-y-4 pb-28 pt-1 font-sans select-none">

      {/* 1. Hero Spotlight Banner */}
      <section className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/60 border border-indigo-500/20 space-y-2 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-wider uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Rajasthan Exam Prep 2026
          </span>
          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> {counts.subjects} विषय उपलब्ध
          </span>
        </div>

        <h1 className="text-xl font-black text-white tracking-tight leading-snug">
          दिशा 20-20 & सम्पूर्ण पाठ्यक्रम 🎯
        </h1>

        <p className="text-xs text-slate-300 leading-relaxed">
          राजस्थान सामान्य ज्ञान, इतिहास, कला-संस्कृति, भूगोल एवं राजव्यवस्था के 100% प्रामाणिक नोट्स व PYQ सेट्स।
        </p>
      </section>

      {/* 2. Modern 4 Action Pillars */}
      <section aria-label="Quick Actions" className="grid grid-cols-2 gap-2.5">
        <Link
          href="/notes"
          aria-label="स्मार्ट नोट्स सेक्शन खोलें"
          className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-indigo-950/30 border border-slate-800/90 hover:border-indigo-500/50 space-y-1.5 transition active:scale-[0.98] shadow-md group"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition">
            <BookOpen className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-white group-hover:text-indigo-300 transition">स्मार्ट नोट्स</h2>
          <p className="text-[10px] text-slate-400">{counts.notes}+ टू-द-पॉइंट नोट्स</p>
        </Link>

        <Link
          href="/quiz"
          aria-label="स्पीड टेस्ट और मॉक टेस्ट सेक्शन खोलें"
          className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-emerald-950/30 border border-slate-800/90 hover:border-emerald-500/50 space-y-1.5 transition active:scale-[0.98] shadow-md group"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
            <Trophy className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">स्पीड टेस्ट</h2>
          <p className="text-[10px] text-emerald-400 font-bold">{counts.tests}+ लाइव मॉक टेस्ट</p>
        </Link>

        <Link
          href="/creator"
          aria-label="क्विज़ रील्स क्रिएटर खोलें"
          className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-rose-950/30 border border-slate-800/90 hover:border-rose-500/50 space-y-1.5 transition active:scale-[0.98] shadow-md group"
        >
          <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-400 group-hover:scale-105 transition">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-white group-hover:text-rose-300 transition">रील्स क्रिएटर</h2>
          <p className="text-[10px] text-slate-400">1-क्लिक HD क्विज़ रील्स</p>
        </Link>

        <Link
          href="/ai-tutor"
          aria-label="AI ट्यूटर डाउट सॉल्व खोलें"
          className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-purple-950/30 border border-slate-800/90 hover:border-purple-500/50 space-y-1.5 transition active:scale-[0.98] shadow-md group"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400 group-hover:scale-105 transition">
            <Zap className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-white group-hover:text-purple-300 transition">AI ट्यूटर</h2>
          <p className="text-[10px] text-slate-400">24/7 लाइव डाउट सॉल्व</p>
        </Link>
      </section>

      {/* 3. Live Announcement Banner */}
      <section aria-label="Announcements" className="space-y-2">
        {banners.length > 0 ? (
          banners.map((b) => (
            <div
              key={b.id}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-purple-950/80 border border-indigo-500/30 flex items-center justify-between gap-2 shadow-md"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 whitespace-nowrap">
                  {b.badge_text || "अपडेट"}
                </span>
                <p className="text-xs text-slate-200 font-semibold leading-tight">{b.title}</p>
              </div>
              {b.link && (
                <Link 
                  href={b.link} 
                  aria-label={`Announcement link for ${b.title}`}
                  className="text-indigo-400 hover:text-indigo-300 flex-shrink-0"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          ))
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">CET 2026</span>
              <span className="font-semibold text-white">🎯 100 PYQ व 20-20 MCQ सेट्स लाइव हैं!</span>
            </div>
            <Link 
              href="/quiz" 
              aria-label="टेस्ट दें पेज पर जाएँ"
              className="text-indigo-400 font-bold flex items-center gap-0.5 text-[11px]"
            >
              टेस्ट दें <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </section>

      {/* 4. Syllabus Subjects Accordion & List */}
      <section aria-label="Syllabus Subjects" className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl transition">
        <button
          onClick={() => setIsOpenSubjects(!isOpenSubjects)}
          aria-expanded={isOpenSubjects}
          aria-label="पाठ्यक्रम विषय सूची टॉगल करें"
          className="w-full p-4 flex items-center justify-between bg-slate-900/90 hover:bg-slate-800/80 transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FolderTree className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h2 className="text-xs font-bold text-white">पाठ्यक्रम विषय (Syllabus Subjects)</h2>
              <p className="text-[10px] text-slate-400">{subjects.length} विषय उपलब्ध • टैप करके विषय खोलें</p>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
            {isOpenSubjects ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </button>

        {isOpenSubjects && (
          <div className="p-3 pt-0 grid gap-2 divide-y divide-slate-800/40">
            {loading ? (
              <div className="space-y-2 py-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 bg-slate-950/60 rounded-2xl border border-slate-800 animate-pulse" />
                ))}
              </div>
            ) : subjects.length === 0 ? (
              <div className="p-4 text-center text-xs text-amber-400">
                कोई सक्रिय विषय उपलब्ध नहीं है।
              </div>
            ) : (
              subjects.map((sub) => (
                <Link
                  key={sub.id}
                  href={"/subject/" + sub.id}
                  aria-label={`${sub.name} विषय के अध्याय और नोट्स खोलें`}
                  className="p-3.5 rounded-2xl bg-slate-950/70 hover:bg-indigo-950/40 border border-slate-800/80 hover:border-indigo-500/40 flex items-center justify-between group transition active:scale-[0.99] mt-2 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-black text-sm group-hover:scale-105 transition">
                      {sub.icon || sub.name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition leading-snug">
                        {sub.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">अध्याय ➔ 20-20 सेट्स ➔ नोट्स व PYQs</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
                </Link>
              ))
            )}
          </div>
        )}
      </section>

    </main>
  );
}