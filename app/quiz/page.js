"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Trophy, Clock, ArrowLeft, Sparkles, Filter, ChevronRight, Zap, Target } from "lucide-react";

export default function QuizHubPage() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadAllQuizData() {
      setLoading(true);
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const [subRes, chapRes] = await Promise.all([
          supabase
            .from("subjects")
            .select("id, name")
            .order("id", { ascending: true }),
          supabase
            .from("chapters")
            .select("id, name, subject_id, sort_order, subjects(id, name)")
            .order("sort_order", { ascending: true })
            .order("id", { ascending: true })
        ]);

        if (isMounted) {
          if (subRes.data) setSubjects(subRes.data);
          if (chapRes.data) setChapters(chapRes.data);
        }
      } catch (err) {
        console.error("Quiz Hub Load Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAllQuizData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredChapters = selectedSubjectId === "all"
    ? chapters
    : chapters.filter((c) => c.subject_id === Number(selectedSubjectId));

  return (
    <main className="max-w-lg mx-auto px-3.5 pb-24 pt-2 space-y-4 font-sans select-none">

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link 
          href="/" 
          aria-label="होमपेज पर वापस जाएँ"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-4 h-4" /> वापस होम
        </Link>
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-emerald-400" /> Rajasthan Test Arena
        </span>
      </div>

      {/* Hero Banner */}
      <section aria-label="टेस्ट हब बैनर" className="p-5 rounded-[28px] bg-gradient-to-b from-slate-900/95 to-slate-950 border border-emerald-500/20 shadow-xl space-y-2 relative overflow-hidden">
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> सभी विषयों के स्पीड टेस्ट
        </div>
        <h1 className="text-xl font-black text-white leading-snug tracking-tight">
          राजस्थान प्रतियोगी परीक्षा टेस्ट सेट्स 🎯
        </h1>
        <p className="text-xs text-slate-300 leading-relaxed">
          प्रत्येक विषय और अध्याय के 20-20 प्रश्नों के समयबद्ध सेट्स हल करें।
        </p>
      </section>

      {/* Subject Filter Chips */}
      <section aria-label="विषय फ़िल्टर" className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Filter className="w-3.5 h-3.5 text-emerald-400" /> विषय चुनें:
          </span>
          <span className="text-emerald-400 font-semibold">{subjects.length} विषय उपलब्ध</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedSubjectId("all")}
            aria-pressed={selectedSubjectId === "all"}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedSubjectId === "all"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-emerald-500/30"
            }`}
          >
            🔥 सभी विषय ({chapters.length} टेस्ट)
          </button>
          {subjects.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelectedSubjectId(sub.id)}
              aria-pressed={selectedSubjectId === sub.id}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedSubjectId === sub.id
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                  : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-emerald-500/30"
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </section>

      {/* Dynamic Test Sets List */}
      <section aria-label="अध्याय टेस्ट सूची" className="space-y-3 pt-1">
        <div className="flex justify-between items-center text-xs font-bold text-slate-300 px-1">
          <span>उपलब्ध अध्याय टेस्ट ({filteredChapters.length})</span>
          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            100% नि:शुल्क
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-slate-900/80 rounded-2xl border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredChapters.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">इस विषय में टेस्ट जल्द ही जोड़े जा रहे हैं।</p>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {filteredChapters.map((chap) => (
              <article
                key={chap.id}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-emerald-500/40 transition shadow-sm flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                    {chap.subjects?.name || "GK Subject"}
                  </span>
                  <h2 className="text-xs sm:text-sm font-bold text-white leading-snug group-hover:text-emerald-300 transition">
                    {chap.name}
                  </h2>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="text-slate-300 font-medium flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-400" /> 20 प्रश्न / सेट
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                      <Clock className="w-3 h-3" /> 10 मिनट
                    </span>
                  </div>
                </div>

                <Link
                  href={`/chapter/${chap.id}`}
                  aria-label={`${chap.name} का स्पीड टेस्ट शुरू करें`}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-black text-slate-950 shadow-md shadow-emerald-500/20 active:scale-95 transition whitespace-nowrap flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  टेस्ट दें <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

    </main>
  );
}