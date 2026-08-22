"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { ArrowLeft, Sparkles, CheckCircle2, XCircle, HelpCircle, Calendar, Award } from "lucide-react";

export default function PyqHubPage() {
  const [pyqs, setPyqs] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadPyqs() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("questions")
          .select("*, topics(name, chapters(name, subjects(name)))")
          .eq("is_pyq", true)
          .eq("is_active", true)
          .order("id", { ascending: false });

        if (data) setPyqs(data);
      } catch (err) {
        console.error("PYQ load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPyqs();
  }, []);

  const handleSelect = (qId, optKey) => {
    if (selectedAnswers[qId]) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optKey }));
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-900 rounded-lg" />
        <div className="h-24 bg-slate-900 rounded-3xl border border-slate-800" />
        <div className="h-44 bg-slate-900 rounded-3xl border border-slate-800" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 space-y-5 pb-24 pt-2">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
        <ArrowLeft className="w-3.5 h-3.5" /> वापस होम
      </Link>

      {/* Hero */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-orange-950/40 border border-amber-500/20 space-y-1.5 shadow-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">विगत वर्ष प्रश्न बैंक (Official PYQs)</span>
        </div>
        <h1 className="text-lg font-black text-white">RPSC / RSMSSB विगत वर्ष हल प्रश्न</h1>
        <p className="text-xs text-slate-300">विभिन्न भर्ती परीक्षाओं में पूछे गए वास्तविक प्रश्न एवं विस्तृत व्याख्या</p>
        <div className="pt-1 text-[11px] font-bold text-amber-400">
          कुल {pyqs.length} PYQs उपलब्ध
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {pyqs.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
            विगत वर्षों के प्रश्न जोड़े जा रहे हैं।
          </div>
        ) : (
          pyqs.map((q, idx) => {
            const userAnswer = selectedAnswers[q.id];
            const isAttempted = Boolean(userAnswer);

            return (
              <div key={q.id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">
                    <span className="text-amber-400 mr-1.5 font-black">PYQ {idx + 1}.</span> {q.question}
                  </h3>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                    {q.source || "Official Exam"} {q.year ? `(${q.year})` : ""}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {[
                    { key: "A", text: q.option_a },
                    { key: "B", text: q.option_b },
                    { key: "C", text: q.option_c },
                    { key: "D", text: q.option_d }
                  ].map((opt) => {
                    let style = "bg-slate-950/80 border-slate-800/90 text-slate-300 hover:border-amber-500/40";
                    if (isAttempted) {
                      if (opt.key === q.answer) {
                        style = "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold";
                      } else if (opt.key === userAnswer) {
                        style = "bg-rose-500/10 border-rose-500/40 text-rose-300 font-bold";
                      } else {
                        style = "bg-slate-950/40 border-slate-900 text-slate-600 opacity-60";
                      }
                    }
                    return (
                      <button
                        key={opt.key}
                        disabled={isAttempted}
                        onClick={() => handleSelect(q.id, opt.key)}
                        className={`p-3 rounded-2xl border text-left text-xs flex items-center justify-between transition active:scale-[0.98] ${style}`}
                      >
                        <span><strong>{opt.key}.</strong> {opt.text}</span>
                        {isAttempted && opt.key === q.answer && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                        {isAttempted && opt.key === userAnswer && opt.key !== q.answer && <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {isAttempted && q.explanation && (
                  <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 space-y-1">
                    <div className="font-bold text-indigo-400 flex items-center gap-1 text-[11px]">
                      <HelpCircle className="w-3.5 h-3.5" /> विस्तृत व्याख्या:
                    </div>
                    <p className="leading-relaxed text-slate-200">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
