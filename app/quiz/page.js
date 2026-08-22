"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { Trophy, Clock, ArrowRight, ArrowLeft, Flame, CheckCircle, Award } from "lucide-react";

export default function QuizHubPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadQuizzes() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("quizzes")
          .select("*, chapters(name, subjects(name))")
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

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="w-3.5 h-3.5" /> होम
        </Link>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
          <Trophy className="w-3 h-3" /> Live Test Engine
        </span>
      </div>

      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/40 border border-emerald-500/20 space-y-2 shadow-xl">
        <h1 className="text-xl font-black text-white">डेली स्पीड क्विज़ और टेस्ट सीरीज़ 🎯</h1>
        <p className="text-xs text-slate-300">समयबद्ध टेस्ट दें, XP पॉइंट्स जीतें और अपनी रैंकिंग सुधारें।</p>
      </div>

      {/* Quizzes List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300">उपलब्ध मॉक टेस्ट ({quizzes.length})</h3>

        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-900 rounded-3xl border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
            नए टेस्ट जल्द ही अपलोड किए जा रहे हैं।
          </div>
        ) : (
          <div className="grid gap-2.5">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 flex items-center justify-between transition shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                      {quiz.quiz_type || "Practice"}
                    </span>
                    {quiz.chapters?.subjects?.name && (
                      <span className="text-[10px] text-slate-500">{quiz.chapters.subjects.name}</span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white">{quiz.title}</h4>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span>{quiz.total_questions || 15} Questions</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {quiz.duration_minutes || 10} मिनट
                    </span>
                  </div>
                </div>

                <Link
                  href={`/quiz/${quiz.id}`}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold text-white shadow-md shadow-emerald-500/20 active:scale-95 transition whitespace-nowrap"
                >
                  Start Test →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
