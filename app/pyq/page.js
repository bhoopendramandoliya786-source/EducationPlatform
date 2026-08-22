"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { HelpCircle, ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";

export default function PYQHubPage() {
  const [pyqs, setPyqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadPYQData() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("questions")
          .select("*, topics(name)")
          .eq("is_pyq", true)
          .eq("is_active", true)
          .order("id", { ascending: false });

        if (data) setPyqs(data);
      } catch (err) {
        console.error("PYQ Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPYQData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-4">
      <div className="flex items-center justify-between pt-1">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="w-3.5 h-3.5" /> होम
        </Link>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
          <HelpCircle className="w-3 h-3" /> Official PYQs Bank
        </span>
      </div>

      <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/20 space-y-2 shadow-xl">
        <h1 className="text-xl font-black text-white">विगत वर्षों के हल प्रश्न (PYQs)</h1>
        <p className="text-xs text-slate-300">RPSC एवं RSMSSB की विभिन्न परीक्षाओं में पूछे गए वास्तविक प्रश्न पत्र।</p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-900 rounded-3xl border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : pyqs.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
            विगत वर्ष प्रश्न लोड किए जा रहे हैं।
          </div>
        ) : (
          pyqs.map((q, idx) => (
            <div key={q.id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-white">
                  <span className="text-amber-400 mr-1.5">Q{idx + 1}.</span> {q.question}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                  {q.source || "Official Exam"} {q.year ? `(${q.year})` : ""}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-xl border ${q.answer === "A" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold" : "bg-slate-950/80 border-slate-800 text-slate-400"}`}>
                  A. {q.option_a}
                </div>
                <div className={`p-2.5 rounded-xl border ${q.answer === "B" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold" : "bg-slate-950/80 border-slate-800 text-slate-400"}`}>
                  B. {q.option_b}
                </div>
                <div className={`p-2.5 rounded-xl border ${q.answer === "C" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold" : "bg-slate-950/80 border-slate-800 text-slate-400"}`}>
                  C. {q.option_c}
                </div>
                <div className={`p-2.5 rounded-xl border ${q.answer === "D" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold" : "bg-slate-950/80 border-slate-800 text-slate-400"}`}>
                  D. {q.option_d}
                </div>
              </div>

              {q.explanation && (
                <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200">
                  <strong>व्याख्या:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
