"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { 
  ArrowLeft, BookOpen, CheckCircle2, XCircle, 
  Sparkles, HelpCircle, Trophy, Play, RotateCcw,
  Share2, Layers, BookmarkCheck, ChevronRight, ChevronLeft, Clock,
  Eye, Check, X
} from "lucide-react";

// 🌟 1. SMART RESPONSIVE BOOKLET RENDERER
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

// 🎯 2. ADVANCED QUESTION FORMATTER
function FormattedQuestionText({ text }) {
  if (!text) return null;

  const isMatching = 
    text.includes("सुमेलन") || 
    text.includes("सुमेलित") || 
    text.includes("सूची-I") || 
    text.includes("सूची - I") || 
    text.includes("सूची-1") || 
    (/\([A-D]\)/.test(text) && /\((?:i|ii|iii|iv|1|2|3|4)\)/i.test(text));

  if (isMatching) {
    const regex = /\(([A-D])\)\s*([\s\S]*?)\s*\(((?:i|ii|iii|iv|1|2|3|4))\)\s*([\s\S]*?)(?=\([B-D]\)|कूट:|$)/gi;
    const rows = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      rows.push({
        col1: `(${match[1]}) ${match[2].trim()}`,
        col2: `(${match[3]}) ${match[4].trim()}`
      });
    }

    const titlePart = text.split(/\([A-D]\)|सूची-I|सूची - I/)[0] || "निम्नलिखित का सही सुमेलन कीजिए:";

    if (rows.length >= 2) {
      return (
        <div className="space-y-2">
          <p className="text-white text-xs sm:text-sm font-bold leading-relaxed">{titlePart.trim()}</p>
          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
            <div className="grid grid-cols-2 bg-indigo-950/60 border-b border-slate-800 px-3 py-1.5 text-[11px] font-black text-indigo-300">
              <span>सूची - I</span>
              <span>सूची - II</span>
            </div>
            <div className="divide-y divide-slate-800/60">
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-2 px-3 py-2 text-xs">
                  <span className="font-medium pr-2 text-slate-300">{r.col1}</span>
                  <span className="font-bold text-indigo-300 border-l border-slate-800/80 pl-2.5">{r.col2}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  }

  if (text.includes("कथन (A)") || text.includes("कथन(A)") || text.includes("कथन:")) {
    const parts = text.split(/(?=कारण\s*\(R\)|कारण:|सही\s*विकल्प|उपर्युक्त)/gi);
    return (
      <div className="space-y-2 text-xs sm:text-sm">
        {parts.map((p, idx) => {
          const str = p.trim();
          if (str.startsWith("कथन")) {
            return (
              <div key={idx} className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200">
                <strong className="text-indigo-400 block font-bold mb-0.5">📌 कथन (A):</strong>
                {str.replace(/^कथन\s*(\([A-Z]\)|:)?\s*/i, "")}
              </div>
            );
          }
          if (str.startsWith("कारण")) {
            return (
              <div key={idx} className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-200">
                <strong className="text-purple-400 block font-bold mb-0.5">💡 कारण (R):</strong>
                {str.replace(/^कारण\s*(\([A-Z]\)|:)?\s*/i, "")}
              </div>
            );
          }
          return <p key={idx} className="text-slate-300 font-bold">{str}</p>;
        })}
      </div>
    );
  }

  return <p className="text-white text-xs sm:text-sm font-bold leading-relaxed whitespace-pre-line">{text}</p>;
}

// 🚀 3. MAIN PAGE COMPONENT
export default function ChapterSingleViewPage() {
  const { id } = useParams();
  const [chapter, setChapter] = useState(null);
  const [activeTab, setActiveTab] = useState("quiz");
  const [notes, setNotes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedInstantAnswers, setSelectedInstantAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  // Set & Quiz States
  const [selectedSet, setSelectedSet] = useState(1);
  const [qIndex, setQIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [showReview, setShowReview] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    async function loadChapterData() {
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
    loadChapterData();

    return () => { isMounted = false; };
  }, [id, supabase]);

  // Timer
  useEffect(() => {
    if (quizSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [quizSubmitted, timeLeft]);

  const handleInstantSelect = (qId, optKey) => {
    if (selectedInstantAnswers[qId]) return;
    setSelectedInstantAnswers((prev) => ({ ...prev, [qId]: optKey }));
  };

  const handleQuizAnswer = (qId, optKey) => {
    setQuizAnswers((prev) => ({ ...prev, [qId]: optKey }));
  };

  const resetQuiz = () => {
    setQuizSubmitted(false);
    setShowReview(false);
    setQIndex(0);
    setQuizAnswers({});
    setTimeLeft(600);
  };

  if (loading) {
    return (
      <main className="max-w-md mx-auto px-4 pt-6 space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-900 rounded-lg" />
        <div className="h-28 bg-slate-900 rounded-3xl border border-slate-800" />
      </main>
    );
  }

  if (!chapter) {
    return (
      <main className="max-w-md mx-auto px-4 pt-12 text-center text-xs text-slate-400">
        अध्याय नहीं मिला। <Link href="/" className="text-indigo-400 font-bold ml-1">होम जाएँ</Link>
      </main>
    );
  }

  const mcqsList = questions.filter((q) => !q.is_pyq);
  const pyqsList = questions.filter((q) => q.is_pyq);
  const currentTabList = activeTab === "mcqs" ? mcqsList : activeTab === "pyqs" ? pyqsList : questions;

  const totalSets = Math.max(1, Math.ceil(currentTabList.length / 20));
  const startIndex = (selectedSet - 1) * 20;
  const currentSetQuestions = currentTabList.slice(startIndex, startIndex + 20);
  const currentQ = currentSetQuestions[qIndex] || currentSetQuestions[0];

  // Results calculation
  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;

  currentSetQuestions.forEach((q) => {
    const ans = quizAnswers[q.id];
    if (!ans) unattemptedCount++;
    else if (ans === q.answer) correctCount++;
    else wrongCount++;
  });

  const accuracyPercent = currentSetQuestions.length > 0 ? Math.round((correctCount / currentSetQuestions.length) * 100) : 0;

  const shareScoreOnWhatsApp = () => {
    const text = `🔥 मैंने EduAI Pro पर "${chapter.name} (Set ${selectedSet})" टेस्ट में ${currentSetQuestions.length} में से ${correctCount} सही (${accuracyPercent}%) स्कोर किया! 🎯\n\nअभी टेस्ट दें: https://education-platform-fawn-six.vercel.app/chapter/${id}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <main className="max-w-md mx-auto px-3 space-y-3 pb-28 pt-1 font-sans select-none">

      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link 
          href={chapter.subjects ? `/subject/${chapter.subjects.id}` : "/"} 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> वापस विषय ({chapter.subjects?.name || "विषय"})
        </Link>
        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">
          {chapter.name}
        </span>
      </div>

      {/* Hero Card */}
      <section className="p-3.5 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/60 border border-purple-500/20 shadow-xl space-y-1 relative overflow-hidden">
        <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
          {chapter.subjects?.name} • सम्पूर्ण मास्टरक्लास
        </div>
        <h1 className="text-sm sm:text-base font-black text-white leading-snug">{chapter.name}</h1>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          {chapter.description || "अवधारणाओं को गहराई से समझें एवं 20-20 टेस्ट सेट्स का अभ्यास करें।"}
        </p>
      </section>

      {/* 4 Main Tabs */}
      <section className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => { setActiveTab("notes"); setSelectedSet(1); setQIndex(0); }}
          className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
            activeTab === "notes" ? "bg-purple-950/40 border-purple-500 shadow-md" : "bg-[#0e131f] border-slate-800/90"
          }`}
        >
          <BookOpen className="w-4 h-4 text-purple-400 mb-1" />
          <h2 className="text-xs font-bold text-white leading-tight">स्मार्ट नोट्स</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">{notes.length} शीट उपलब्ध</p>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("mcqs"); setSelectedSet(1); setQIndex(0); }}
          className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
            activeTab === "mcqs" ? "bg-purple-950/40 border-purple-500 shadow-md" : "bg-[#0e131f] border-slate-800/90"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1" />
          <h2 className="text-xs font-bold text-white leading-tight">अभ्यास MCQs</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">{mcqsList.length} प्रश्न ({Math.ceil(mcqsList.length / 20)} Sets)</p>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("pyqs"); setSelectedSet(1); setQIndex(0); }}
          className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
            activeTab === "pyqs" ? "bg-purple-950/40 border-purple-500 shadow-md" : "bg-[#0e131f] border-slate-800/90"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400 mb-1" />
          <h2 className="text-xs font-bold text-white leading-tight">विगत वर्ष PYQs</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">{pyqsList.length} प्रश्न ({Math.ceil(pyqsList.length / 20)} Sets)</p>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("quiz"); setSelectedSet(1); setQIndex(0); resetQuiz(); }}
          className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
            activeTab === "quiz" ? "bg-purple-950/40 border-purple-500 shadow-md" : "bg-[#0e131f] border-slate-800/90"
          }`}
        >
          <Trophy className="w-4 h-4 text-purple-400 mb-1" />
          <h2 className="text-xs font-bold text-white leading-tight">स्पीड टेस्ट</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">20 Qs • 10 मिनट</p>
        </button>
      </section>

      {/* Practice Sets Selector */}
      {activeTab !== "notes" && (
        <section className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
            <span className="flex items-center gap-1 text-purple-400">
              <Sparkles className="w-3.5 h-3.5" /> प्रैक्टिस सेट्स
            </span>
            <span className="text-[10px] text-slate-500 uppercase">SET {selectedSet} OF {totalSets}</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {Array.from({ length: totalSets }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { setSelectedSet(idx + 1); setQIndex(0); resetQuiz(); }}
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

      {/* 📖 TAB 1: NOTES */}
      {activeTab === "notes" && (
        <PDFNotesSheet notes={notes} chapterName={chapter.name} />
      )}

      {/* 🎯 TAB 2 & 3: MCQs / PYQs */}
      {(activeTab === "mcqs" || activeTab === "pyqs") && (
        <section className="space-y-3">
          {currentSetQuestions.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
              इस सेक्शन में प्रश्न जल्द जोड़े जा रहे हैं।
            </div>
          ) : (
            currentSetQuestions.map((q, idx) => {
              const userAns = selectedInstantAnswers[q.id];
              const isAnswered = !!userAns;

              return (
                <article key={q.id} className="p-4 rounded-3xl bg-[#0e131f] border border-slate-800 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300">
                      प्रश्न #{startIndex + idx + 1}
                    </span>
                    {q.is_pyq && (
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {q.exam_tag || "RPSC PYQ"}
                      </span>
                    )}
                  </div>

                  <FormattedQuestionText text={q.question} />

                  <div className="space-y-2 pt-1">
                    {[
                      { key: "A", text: q.option_a },
                      { key: "B", text: q.option_b },
                      { key: "C", text: q.option_c },
                      { key: "D", text: q.option_d }
                    ].map((opt) => {
                      let btnStyle = "bg-slate-950/60 border-slate-800 text-slate-300";
                      if (isAnswered) {
                        if (opt.key === q.answer) btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                        else if (userAns === opt.key) btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300 line-through";
                        else btnStyle = "opacity-50 border-slate-900";
                      }

                      return (
                        <button
                          key={opt.key}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => handleInstantSelect(q.id, opt.key)}
                          className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${btnStyle}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                              {opt.key}
                            </span>
                            <span className="text-xs">{opt.text}</span>
                          </div>
                          {isAnswered && opt.key === q.answer && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {isAnswered && userAns === opt.key && opt.key !== q.answer && <XCircle className="w-4 h-4 text-rose-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && q.explanation && (
                    <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
                      <div className="font-bold flex items-center gap-1 text-indigo-300">
                        <HelpCircle className="w-3.5 h-3.5" /> विस्तृत व्याख्या:
                      </div>
                      <p className="text-[11px] leading-relaxed whitespace-pre-line text-slate-200">{q.explanation}</p>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>
      )}

      {/* 🏆 TAB 4: SPEED TEST & ANSWERS REVIEW */}
      {activeTab === "quiz" && (
        <section className="space-y-4">
          {!quizSubmitted ? (
            currentQ && (
              <div className="p-5 rounded-3xl bg-[#0e131f] border border-slate-800/90 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase">
                    {currentQ.is_pyq ? (currentQ.exam_tag || "PYQ") : "HARD"}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {formatTime(timeLeft)}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-purple-400 block mb-1">
                    प्रश्न {qIndex + 1} / {currentSetQuestions.length}
                  </span>
                  <FormattedQuestionText text={currentQ.question} />
                </div>

                <div className="space-y-2 pt-1">
                  {[
                    { key: "A", text: currentQ.option_a },
                    { key: "B", text: currentQ.option_b },
                    { key: "C", text: currentQ.option_c },
                    { key: "D", text: currentQ.option_d }
                  ].map((opt) => {
                    const isSelected = quizAnswers[currentQ.id] === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleQuizAnswer(currentQ.id, opt.key)}
                        className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                          isSelected ? "bg-purple-600/20 border-purple-500 text-white font-semibold" : "bg-slate-950/60 border-slate-800/80 text-slate-300"
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isSelected ? "bg-purple-600 text-white" : "bg-slate-800/90 text-slate-400"
                        }`}>
                          {opt.key}
                        </span>
                        <span className="text-xs leading-relaxed">{opt.text || `विकल्प ${opt.key}`}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 gap-3">
                  <button
                    type="button"
                    disabled={qIndex === 0}
                    onClick={() => setQIndex((prev) => prev - 1)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800/90 text-slate-300 font-bold text-xs disabled:opacity-40 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> पिछला
                  </button>

                  {qIndex === currentSetQuestions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setQuizSubmitted(true)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1 cursor-pointer"
                    >
                      सबमिट करें
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setQIndex((prev) => prev + 1)}
                      className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1 cursor-pointer"
                    >
                      अगला <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          ) : (
            /* 🏆 100% VISIBLE RESULT & FULL EXPLANATION REVIEW */
            <div className="space-y-4 animate-fadeIn">
              {/* Score Card */}
              <div className="p-6 rounded-3xl bg-[#0e131f] border border-slate-800 text-center space-y-4 shadow-2xl">
                <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">स्पीड टेस्ट परिणाम</h3>
                  <p className="text-xs text-slate-400">{chapter.name} • Set {selectedSet}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="text-emerald-400 font-black text-base">{correctCount}</div>
                    <div className="text-[10px] text-slate-400">सही उत्तर</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="text-rose-400 font-black text-base">{wrongCount}</div>
                    <div className="text-[10px] text-slate-400">गलत उत्तर</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="text-amber-400 font-black text-base">{accuracyPercent}%</div>
                    <div className="text-[10px] text-slate-400">सटीकता</div>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={resetQuiz}
                    className="flex-1 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" /> री-टेस्ट
                  </button>
                  <button
                    type="button"
                    onClick={shareScoreOnWhatsApp}
                    className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" /> WhatsApp शेयर
                  </button>
                </div>
              </div>

              {/* 🔍 DETAILED ANSWER & EXPLANATION REVIEW */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
                  <span className="flex items-center gap-1 text-purple-400">
                    <Eye className="w-4 h-4" /> सभी प्रश्नों के सही उत्तर एवं व्याख्या ({currentSetQuestions.length})
                  </span>
                </div>

                {currentSetQuestions.map((q, idx) => {
                  const userAns = quizAnswers[q.id];
                  const isCorrect = userAns === q.answer;
                  const isUnattempted = !userAns;

                  return (
                    <div key={q.id} className="p-4 rounded-3xl bg-[#0e131f] border border-slate-800 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          प्रश्न #{idx + 1}
                        </span>
                        {isUnattempted ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            अनुत्तरित (Unattempted)
                          </span>
                        ) : isCorrect ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <Check className="w-3 h-3" /> सही उत्तर (+1)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                            <X className="w-3 h-3" /> गलत उत्तर (-0.33)
                          </span>
                        )}
                      </div>

                      <FormattedQuestionText text={q.question} />

                      {/* Options with Answer Highlight */}
                      <div className="space-y-1.5 pt-1">
                        {[
                          { key: "A", text: q.option_a },
                          { key: "B", text: q.option_b },
                          { key: "C", text: q.option_c },
                          { key: "D", text: q.option_d }
                        ].map((opt) => {
                          let optStyle = "bg-slate-950/40 border-slate-800/80 text-slate-400";

                          if (opt.key === q.answer) {
                            optStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                          } else if (userAns === opt.key && !isCorrect) {
                            optStyle = "bg-rose-500/20 border-rose-500 text-rose-300 line-through font-semibold";
                          }

                          return (
                            <div key={opt.key} className={`p-2.5 rounded-2xl border text-xs flex items-center justify-between ${optStyle}`}>
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                  {opt.key}
                                </span>
                                <span>{opt.text}</span>
                              </div>
                              {opt.key === q.answer && <span className="text-[10px] text-emerald-400 font-bold">✓ सही उत्तर</span>}
                              {userAns === opt.key && !isCorrect && <span className="text-[10px] text-rose-400 font-bold">✗ आपका चयन</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
                          <div className="font-bold flex items-center gap-1 text-indigo-300">
                            <HelpCircle className="w-3.5 h-3.5" /> व्याख्या (Explanation):
                          </div>
                          <p className="text-[11px] leading-relaxed whitespace-pre-line text-slate-200">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

    </main>
  );
}