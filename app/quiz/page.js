"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { Trophy, Clock, ArrowLeft, Sparkles, Filter, ChevronRight } from "lucide-react";

export default function QuizHubPage() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadAllQuizData() {
      setLoading(true);
      try {
        // Supabase se saare subjects aur unke chapters dynamically fetch karna
        const { data: subData } = await supabase
          .from("subjects")
          .select("*")
          .order("id", { ascending: true });

        const { data: chapData } = await supabase
          .from("chapters")
          .select("*, subjects(id, name)")
          .order("id", { ascending: true });

        if (subData) setSubjects(subData);
        if (chapData) setChapters(chapData);
      } catch (err) {
        console.error("Quiz Hub Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAllQuizData();
  }, []);

  // Filter Chapters by Subject
  const filteredChapters = selectedSubjectId === "all"
    ? chapters
    : chapters.filter((c) => c.subject_id === Number(selectedSubjectId));

  return (
    <div className="max-w-md mx-auto px-4 pb-28 pt-2 space-y-4 font-sans select-none">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> वापस होम
        </Link>
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5 text-emerald-400" /> Rajasthan Test Arena
        </span>
      </div>

      {/* Hero Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/60 border border-indigo-500/20 shadow-2xl space-y-1.5 relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-bold border border-amber-500/30">
          <Sparkles className="w-3 h-3 text-amber-400" /> सभी विषयों के स्पीड टेस्ट
        </div>
        <h1 className="text-lg font-black text-white leading-snug">
          राजस्थान प्रतियोगी परीक्षा टेस्ट सेट्स 🎯
        </h1>
        <p className="text-xs text-slate-300 leading-relaxed">
          प्रत्येक विषय और अध्याय के 20-20 प्रश्नों के समयबद्ध सेट्स हल करें।
        </p>
      </div>

      {/* Subject Filter Chips */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
          <span className="flex items-center gap-1"><Filter className="w-3 h-3 text-indigo-400" /> विषय चुनें:</span>
          <span className="text-indigo-400">{subjects.length} विषय</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedSubjectId("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedSubjectId === "all"
                ? "bg-indigo-600 text-white shadow-md scale-105"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700"
            }`}
          >
            🔥 सभी विषय ({chapters.length} टेस्ट)
          </button>
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedSubjectId === sub.id
                  ? "bg-indigo-600 text-white shadow-md scale-105"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700"
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Test Sets List */}
      <div className="space-y-3 pt-1">
        <div className="flex justify-between items-center text-xs font-bold text-slate-300 px-1">
          <span>उपलब्ध अध्याय टेस्ट ({filteredChapters.length})</span>
          <span className="text-[10px] text-emerald-400 font-semibold">100% नि:शुल्क</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
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
              <div
                key={chap.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/40 transition shadow-lg flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                    {chap.subjects?.name || "GK Subject"}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                    {chap.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="text-slate-300 font-medium">⚡ 20 प्रश्न / सेट</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                      <Clock className="w-3 h-3" /> 10 मिनट
                    </span>
                  </div>
                </div>

                <Link
                  href={`/chapter/${chap.id}`}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-md active:scale-95 transition whitespace-nowrap flex items-center gap-1"
                >
                  टेस्ट दें <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}