"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { Trophy, Clock, ArrowLeft, Flame, Sparkles, Filter, ChevronRight, CheckCircle2 } from "lucide-react";

export default function QuizHubPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const supabase = createClient();

  useEffect(() => {
    async function loadQuizzes() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("quizzes")
          .select("*, chapters(name, subjects(name, id))")
          .eq("is_published", true)
          .order("id", { ascending: false });

        if (data) setQuizzes(data);
      } catch (err) {
        console.error("Quizzes Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuizzes();
  }, []);

  // Filter Quizzes by Subject
  const filteredQuizzes = selectedSubject === "all"
    ? quizzes
    : quizzes.filter((q) => q.chapters?.subjects?.name === selectedSubject);

  // Extract unique subjects
  const subjectsList = ["all", ...new Set(quizzes.map((q) => q.chapters?.subjects?.name).filter(Boolean))];

  return (
    <div className="max-w-2xl mx-auto px-4 pb-28 pt-2 space-y-4 font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="w-4 h-4" /> होमपेज
        </Link>
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5 text-emerald-400" /> CET • REET 2026 Live Arena
        </span>
      </div>

      {/* Hero Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl space-y-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-bold border border-amber-500/30">
          <Flame className="w-3 h-3 text-amber-400" /> लाइव मॉक टेस्ट सीरीज़
        </div>
        <h1 className="text-lg font-black text-white leading-snug">
          राजस्थान प्रतियोगी परीक्षा स्पीड टेस्ट 🎯
        </h1>
        <p className="text-xs text-slate-300 leading-relaxed">
          समयबद्ध टेस्ट दें, ऑल-राजस्थान रैंकिंग देखें और अपनी कमजोरियों को सुधारें।
        </p>
      </div>

      {/* Subject Filter Chips */}
      {subjectsList.length > 1 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
            <Filter className="w-3 h-3" /> विषय अनुसार चुनें:
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {subjectsList.map((subj, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedSubject === subj
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {subj === "all" ? "🔥 सभी विषय" : subj}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quizzes List */}
      <div className="space-y-3 pt-1">
        <div className="flex justify-between items-center text-xs font-bold text-slate-300">
          <span>उपलब्ध टेस्ट सेट्स ({filteredQuizzes.length})</span>
          <span className="text-[10px] text-emerald-400 font-semibold">100% नि:शुल्क</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-900/80 rounded-2xl border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">इस विषय में टेस्ट जल्द ही जोड़े जा रहे हैं।</p>
            <button
              onClick={() => setSelectedSubject("all")}
              className="text-xs font-bold text-indigo-400 underline"
            >
              सभी टेस्ट देखें
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/50 transition shadow-lg flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wide">
                      {quiz.quiz_type || "MOCK TEST"}
                    </span>
                    {quiz.chapters?.subjects?.name && (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {quiz.chapters.subjects.name}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {quiz.title}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">
                      📝 {quiz.total_questions || 20} प्रश्न
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-amber-400/90">
                      <Clock className="w-3 h-3" /> {quiz.duration_minutes || 10} मिनट
                    </span>
                  </div>
                </div>

                <Link
                  href={`/quiz/${quiz.id}`}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-xs font-bold text-white shadow-md shadow-indigo-900/40 flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
                >
                  टेस्ट शुरू करें <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
