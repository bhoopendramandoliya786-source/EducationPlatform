"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { 
  ArrowLeft, Clock, Sparkles, ChevronRight, ChevronLeft, 
  BookOpen, HelpCircle, CheckCircle2, RotateCcw, Flame
} from "lucide-react";

export default function ChapterInteractivePage() {
  const { id } = useParams();
  const [chapter, setChapter] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("mcq"); // mcq, pyq, notes
  const [currentSet, setCurrentSet] = useState(1);
  const [qIndex, setQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 मिनट
  const [timerActive, setTimerActive] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const { data: chapData } = await supabase
          .from("chapters")
          .select("id, name, subjects(id, name)")
          .eq("id", id)
          .single();

        const { data: qData } = await supabase
          .from("questions")
          .select("*")
          .eq("chapter_id", id)
          .order("id", { ascending: true });

        if (isMounted) {
          if (chapData) setChapter(chapData);
          if (qData) setQuestions(qData);
        }
      } catch (err) {
        console.error("Load Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();

    return () => { isMounted = false; };
  }, [id, supabase]);

  // 10 मिनट का टाइमर
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // 20-20 प्रश्नों के सेट्स
  const itemsPerSet = 20;
  const totalSets = Math.max(1, Math.ceil(questions.length / itemsPerSet));
  const currentSetQuestions = questions.slice((currentSet - 1) * itemsPerSet, currentSet * itemsPerSet);
  const currentQ = currentSetQuestions[qIndex] || currentSetQuestions[0];

  const handleSelectOption = (optKey) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQ?.id]: optKey });
  };

  if (loading) {
    return (
      <main className="max-w-md mx-auto px-4 pt-6 space-y-4 animate-pulse">
        <div className="h-28 bg-slate-900 rounded-3xl border border-slate-800" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-slate-900 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-slate-900 rounded-3xl" />
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 pb-28 pt-1 space-y-4 font-sans select-none">

      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link href={chapter?.subjects?.id ? `/subject/${chapter.subjects.id}` : "/"} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-3.5 h-3.5" /> वापस विषय
        </Link>
        <span className="text-[10px] font-bold text-slate-400">
          {chapter?.subjects?.name || "सामान्य अध्ययन"}
        </span>
      </div>

      {/* Chapter Masterclass Hero Banner */}
      <section className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/60 border border-indigo-500/20 shadow-xl space-y-1 relative overflow-hidden">
        <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
          मास्टरक्लास
        </span>
        <h1 className="text-base font-black text-white leading-snug">{chapter?.name || "अध्याय"}</h1>
        <p className="text-[11px] text-slate-300">अवधारणाओं एवं 20-20 स्पीड टेस्ट सेट्स का अभ्यास करें।</p>
      </section>

      {/* 4 Feature Action Grid (Visily Layout) */}
      <section className="grid grid-cols-2 gap-2.5">
        <button 
          type="button"
          onClick={() => setActiveTab("notes")}
          className={`p-3.5 rounded-2xl border text-left transition ${activeTab === "notes" ? "bg-purple-950/50 border-purple-500" : "bg-slate-900/90 border-slate-800"}`}
        >
          <div className="text-purple-400 mb-1 font-bold text-xs flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> स्मार्ट नोट्स</div>
          <div className="text-[10px] text-slate-400">टू-द-पॉइंट बुलेट्स</div>
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab("mcq")}
          className={`p-3.5 rounded-2xl border text-left transition ${activeTab === "mcq" ? "bg-purple-950/50 border-purple-500" : "bg-slate-900/90 border-slate-800"}`}
        >
          <div className="text-emerald-400 mb-1 font-bold text-xs flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> अभ्यास MCQs</div>
          <div className="text-[10px] text-slate-400">{questions.length} प्रश्न उपलब्ध</div>
        </button>
      </section>

      {/* Practice Sets Navigation Bar */}
      <section className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
          <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-purple-400" /> प्रैक्टिस सेट्स</span>
          <span>SET {currentSet} OF {totalSets}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {Array.from({ length: totalSets }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => { setCurrentSet(idx + 1); setQIndex(0); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                currentSet === idx + 1
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-105"
                  : "bg-slate-900 text-slate-400 border border-slate-800"
              }`}
            >
              Set {idx + 1} (Q.{idx * 20 + 1}-{Math.min((idx + 1) * 20, questions.length)})
            </button>
          ))}
        </div>
      </section>

      {/* Interactive Question Card */}
      {currentQ ? (
        <section className="p-5 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
              HARD
            </span>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
              <Clock className="w-3.5 h-3.5" /> {formatTime(timeLeft)}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-purple-400 block mb-1">
              प्रश्न {qIndex + 1} / {currentSetQuestions.length}
            </span>
            <p className="text-xs sm:text-sm font-bold text-white leading-relaxed whitespace-pre-line">
              {currentQ.question}
            </p>
          </div>

          {/* 4 Options Grid */}
          <div className="space-y-2 pt-1">
            {[
              { key: "A", text: currentQ.option_a },
              { key: "B", text: currentQ.option_b },
              { key: "C", text: currentQ.option_c },
              { key: "D", text: currentQ.option_d }
            ].map((opt) => {
              const isSelected = selectedAnswers[currentQ.id] === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelectOption(opt.key)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                    isSelected
                      ? "bg-purple-600/20 border-purple-500 text-white font-semibold"
                      : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${isSelected ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                    {opt.key}
                  </div>
                  <span className="text-xs">{opt.text || `विकल्प ${opt.key}`}</span>
                </button>
              );
            })}
          </div>

          {/* Action Buttons: पिछला / अगला */}
          <div className="flex items-center justify-between pt-2 gap-3">
            <button
              type="button"
              disabled={qIndex === 0}
              onClick={() => setQIndex((prev) => prev - 1)}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs disabled:opacity-40 flex items-center justify-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> पिछला
            </button>
            <button
              type="button"
              disabled={qIndex === currentSetQuestions.length - 1}
              onClick={() => setQIndex((prev) => prev + 1)}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs disabled:opacity-40 flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-purple-600/25"
            >
              अगला <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      ) : (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
          इस अध्याय में प्रश्न जल्द जोड़े जा रहे हैं।
        </div>
      )}

    </main>
  );
}