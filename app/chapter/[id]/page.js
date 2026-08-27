"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { 
  ArrowLeft, BookOpen, CheckCircle2, XCircle, 
  Sparkles, HelpCircle, Trophy, Play, RotateCcw,
  Share2, Layers, BookmarkCheck, ChevronRight, ChevronLeft, Clock
} from "lucide-react";

// 🌟 1. SMART BOOKLET RENDERER
function PDFNotesSheet({ notes, chapterName }) {
  return (
    <div className="rounded-3xl bg-[#0e131f] border border-slate-800 shadow-2xl overflow-hidden font-sans text-slate-200">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-purple-950/40 px-4 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> EduAI Pro • नोट्स
          </span>
          <h2 className="text-xs sm:text-sm font-black text-white mt-0.5">{chapterName}</h2>
        </div>
        <span className="text-[10px] font-extrabold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
          SMART BOOKLET
        </span>
      </div>

      <div className="p-4 space-y-4">
        {notes.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            इस अध्याय के नोट्स जल्द जोड़े जा रहे हैं।
          </div>
        ) : (
          notes.map((note) => {
            const rawLines = (note.content || "").split("\n").map((l) => l.trim()).filter(Boolean);
            return (
              <div key={note.id} className="space-y-2.5">
                {note.title && (
                  <div className="text-xs font-black text-amber-400 uppercase tracking-wide border-b border-slate-800/80 pb-2 flex items-center gap-1.5">
                    <BookmarkCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{note.title}</span>
                  </div>
                )}
                <div className="space-y-2">
                  {rawLines.map((line, idx) => (
                    <p key={idx} className="text-xs text-slate-300 leading-relaxed py-0.5 break-words">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// 🎯 2. QUESTION TEXT FORMATTER
function FormattedQuestionText({ text }) {
  if (!text) return null;
  return <p className="text-white text-xs sm:text-sm font-bold leading-relaxed whitespace-pre-line">{text}</p>;
}

// 🚀 3. MAIN INTERACTIVE PAGE
export default function ChapterSingleViewPage() {
  const { id } = useParams();
  const [chapter, setChapter] = useState(null);
  const [activeTab, setActiveTab] = useState("quiz"); // Default open in Visily test view
  const [notes, setNotes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedSet, setSelectedSet] = useState(1);
  const [qIndex, setQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(594); // 09:54
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const { data: chapData } = await supabase
          .from("chapters")
          .select("*, subjects(id, name)")
          .eq("id", id)
          .single();

        const { data: nData } = await supabase
          .from("notes")
          .select("*")
          .eq("chapter_id", id)
          .eq("is_published", true)
          .order("sort_order", { ascending: true });

        const { data: qData } = await supabase
          .from("questions")
          .select("*")
          .eq("chapter_id", id)
          .eq("is_active", true)
          .order("id", { ascending: true });

        if (isMounted) {
          if (chapData) setChapter(chapData);
          if (nData) setNotes(nData);
          if (qData) setQuestions(qData);
        }
      } catch (err) {
        console.error("Chapter load error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();

    return () => { isMounted = false; };
  }, [id, supabase]);

  // Timer Countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const mcqsList = questions.filter((q) => !q.is_pyq);
  const pyqsList = questions.filter((q) => q.is_pyq);

  const currentTabList = activeTab === "mcqs" ? mcqsList : activeTab === "pyqs" ? pyqsList : questions;
  const totalSets = Math.max(1, Math.ceil(currentTabList.length / 20));

  const currentSetQuestions = currentTabList.slice((selectedSet - 1) * 20, selectedSet * 20);
  const currentQ = currentSetQuestions[qIndex] || currentSetQuestions[0];

  const handleSelectOption = (qId, key) => {
    setUserAnswers({ ...userAnswers, [qId]: key });
  };

  if (loading) {
    return (
      <main className="max-w-md mx-auto px-4 pt-6 space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-900 rounded-lg" />
        <div className="h-28 bg-slate-900 rounded-3xl border border-slate-800" />
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 pb-28 pt-1 space-y-3.5 font-sans select-none">

      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link 
          href={chapter?.subjects ? `/subject/${chapter.subjects.id}` : "/"} 
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> वापस विषय ({chapter?.subjects?.name || "विषय"})
        </Link>
        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">
          {chapter?.name}
        </span>
      </div>

      {/* Hero Masterclass Banner */}
      <section className="p-4 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/50 border border-purple-500/20 shadow-xl space-y-1 relative overflow-hidden">
        <h1 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 leading-snug">
          {chapter?.name || "मास्टरक्लास"}
        </h1>
        <p className="text-[11px] text-slate-300">
          अवधारणाओं को गहराई से समझें एवं 20-20 टेस्ट सेट्स का अभ्यास करें।
        </p>
      </section>

      {/* 4 Main Action Cards Grid (Visily Exact Match) */}
      <section className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => { setActiveTab("notes"); setQIndex(0); }}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            activeTab === "notes" ? "bg-purple-950/40 border-purple-500 shadow-md shadow-purple-900/30" : "bg-[#0e131f] border-slate-800/90"
          }`}
        >
          <BookOpen className="w-4 h-4 text-purple-400 mb-1.5" />
          <h2 className="text-xs font-bold text-white leading-tight">स्मार्ट नोट्स</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">{notes.length} शीट उपलब्ध</p>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("mcqs"); setQIndex(0); }}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            activeTab === "mcqs" ? "bg-purple-950/40 border-purple-500 shadow-md shadow-purple-900/30" : "bg-[#0e131f] border-slate-800/90"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1.5" />
          <h2 className="text-xs font-bold text-white leading-tight">अभ्यास MCQs</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">{mcqsList.length} प्रश्न ({Math.ceil(mcqsList.length / 20)} Sets)</p>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("pyqs"); setQIndex(0); }}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            activeTab === "pyqs" ? "bg-purple-950/40 border-purple-500 shadow-md shadow-purple-900/30" : "bg-[#0e131f] border-slate-800/90"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400 mb-1.5" />
          <h2 className="text-xs font-bold text-white leading-tight">विगत वर्ष PYQs</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">{pyqsList.length} प्रश्न ({Math.ceil(pyqsList.length / 20)} Sets)</p>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("quiz"); setQIndex(0); }}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            activeTab === "quiz" ? "bg-purple-950/40 border-purple-500 shadow-md shadow-purple-900/30" : "bg-[#0e131f] border-slate-800/90"
          }`}
        >
          <Trophy className="w-4 h-4 text-purple-400 mb-1.5" />
          <h2 className="text-xs font-bold text-white leading-tight">स्पीड टेस्ट</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">20 Qs • 10 मिनट</p>
        </button>
      </section>

      {/* Practice Sets Pills Selector (Visily Exact Match) */}
      {activeTab !== "notes" && (
        <section className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
            <span className="flex items-center gap-1 text-purple-400">
              <Sparkles className="w-3 h-3" /> प्रैक्टिस सेट्स
            </span>
            <span className="text-[10px] text-slate-500 uppercase">SET {selectedSet} OF {totalSets}</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {Array.from({ length: totalSets }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { setSelectedSet(idx + 1); setQIndex(0); }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedSet === idx + 1
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-105"
                    : "bg-[#0e131f] text-slate-400 border border-slate-800"
                }`}
              >
                Set {idx + 1} (Q.{idx * 20 + 1}-{Math.min((idx + 1) * 20, currentTabList.length)})
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Notes View */}
      {activeTab === "notes" && (
        <PDFNotesSheet notes={notes} chapterName={chapter?.name} />
      )}

      {/* Interactive Single Question Card (Visily Exact Dark Glass Card) */}
      {activeTab !== "notes" && currentQ && (
        <section className="p-5 rounded-3xl bg-[#0e131f] border border-slate-800/90 shadow-2xl space-y-4 relative">

          {/* Card Top: HARD Badge + Timer */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase tracking-wide">
              {currentQ.is_pyq ? (currentQ.exam_tag || "PYQ") : "HARD"}
            </span>
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> {formatTime(timeLeft)}
            </div>
          </div>

          {/* Question Number & Text */}
          <div>
            <span className="text-[10px] font-bold text-purple-400 block mb-1">
              प्रश्न {qIndex + 1} / {currentSetQuestions.length}
            </span>
            <FormattedQuestionText text={currentQ.question} />
          </div>

          {/* Options (A, B, C, D) */}
          <div className="space-y-2 pt-1">
            {[
              { key: "A", text: currentQ.option_a },
              { key: "B", text: currentQ.option_b },
              { key: "C", text: currentQ.option_c },
              { key: "D", text: currentQ.option_d }
            ].map((opt) => {
              const isSelected = userAnswers[currentQ.id] === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, opt.key)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                    isSelected
                      ? "bg-purple-600/20 border-purple-500 text-white font-semibold"
                      : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isSelected ? "bg-purple-600 text-white" : "bg-slate-800/90 text-slate-400"
                  }`}>
                    {opt.key}
                  </span>
                  <span className="text-xs leading-relaxed">{opt.text || `विकल्प ${opt.key}`}</span>
                </button>
              );
            })}
          </div>

          {/* Action Buttons: पिछला / अगला (Visily Style) */}
          <div className="flex items-center justify-between pt-2 gap-3">
            <button
              type="button"
              disabled={qIndex === 0}
              onClick={() => setQIndex((prev) => prev - 1)}
              className="flex-1 py-2.5 rounded-xl bg-slate-800/90 text-slate-300 font-bold text-xs disabled:opacity-40 flex items-center justify-center gap-1 cursor-pointer transition active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" /> पिछला
            </button>
            <button
              type="button"
              disabled={qIndex === currentSetQuestions.length - 1}
              onClick={() => setQIndex((prev) => prev + 1)}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs disabled:opacity-40 flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-purple-600/30 transition active:scale-95"
            >
              अगला <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </section>
      )}

    </main>
  );
}