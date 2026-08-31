"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { 
  ArrowLeft, BookOpen, CheckCircle2, XCircle, 
  Sparkles, HelpCircle, Trophy, RotateCcw,
  Share2, BookmarkCheck, ChevronRight, ChevronLeft, Clock,
  ChevronDown, Check, X, Layers, Play, FastForward
} from "lucide-react";

// 🌟 1. SMART BOOKLET RENDERER
function PDFNotesSheet({ notes, chapterName }) {
  return (
    <div className="rounded-3xl bg-[#0e131f] border border-slate-800/90 shadow-2xl overflow-hidden font-sans text-slate-200">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-purple-950/40 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> EduAI Pro • नोट्स
          </span>
          <h2 className="text-sm sm:text-base font-black text-white mt-0.5">{chapterName}</h2>
        </div>
        <span className="text-[10px] font-extrabold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-lg">
          SMART BOOKLET
        </span>
      </div>

      <div className="p-5 space-y-4">
        {notes.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            इस अध्याय के नोट्स जल्द जोड़े जा रहे हैं।
          </div>
        ) : (
          notes.map((note) => {
            const rawLines = (note.content || "").split("\n").map((l) => l.trim()).filter(Boolean);
            return (
              <div key={note.id} className="space-y-3">
                {note.title && (
                  <div className="text-sm font-black text-amber-400 uppercase tracking-wide border-b border-slate-800/80 pb-2 flex items-center gap-2">
                    <BookmarkCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{note.title}</span>
                  </div>
                )}
                <div className="space-y-2">
                  {rawLines.map((line, idx) => (
                    <p key={idx} className="text-xs sm:text-sm text-slate-200 leading-relaxed py-0.5 break-words">
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

// 🎯 2. ADVANCED BIGGER & STABLE QUESTION FORMATTER
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
        <div className="space-y-3">
          <p className="text-white text-base font-bold leading-snug">{titlePart.trim()}</p>
          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
            <div className="grid grid-cols-2 bg-indigo-950/70 border-b border-slate-800 px-3.5 py-2 text-xs font-black text-indigo-300">
              <span>सूची - I (विवरण)</span>
              <span>सूची - II (सुमेलन)</span>
            </div>
            <div className="divide-y divide-slate-800/60">
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-2 px-3.5 py-2.5 text-xs sm:text-sm">
                  <span className="font-medium pr-2 text-slate-300">{r.col1}</span>
                  <span className="font-bold text-indigo-300 border-l border-slate-800/80 pl-3">{r.col2}</span>
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
      <div className="space-y-2.5 text-sm sm:text-base">
        {parts.map((p, idx) => {
          let str = p.trim();
          if (str.startsWith("कथन")) {
            const cleanContent = str.replace(/^कथन\s*(\([A-Z]\)|:)?\s*[:\-]?\s*/i, "");
            return (
              <div key={idx} className="p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 text-indigo-200">
                <strong className="text-indigo-400 block font-black text-xs uppercase tracking-wide mb-1">📌 कथन (A)</strong>
                <span className="text-white font-medium leading-relaxed">{cleanContent}</span>
              </div>
            );
          }
          if (str.startsWith("कारण")) {
            const cleanContent = str.replace(/^कारण\s*(\([A-Z]\)|:)?\s*[:\-]?\s*/i, "");
            return (
              <div key={idx} className="p-3.5 rounded-2xl bg-purple-950/50 border border-purple-500/30 text-purple-200">
                <strong className="text-purple-400 block font-black text-xs uppercase tracking-wide mb-1">💡 कारण (R)</strong>
                <span className="text-white font-medium leading-relaxed">{cleanContent}</span>
              </div>
            );
          }
          return <p key={idx} className="text-slate-300 font-bold text-sm leading-relaxed">{str}</p>;
        })}
      </div>
    );
  }

  return <p className="text-white text-base font-bold leading-relaxed tracking-wide whitespace-pre-line">{text}</p>;
}

// 🚀 3. MAIN COMPONENT
export default function ChapterSingleViewPage() {
  const { id } = useParams();
  const [chapter, setChapter] = useState(null);
  const [activeTab, setActiveTab] = useState("mcqs");
  const [notes, setNotes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Focus Arena State
  const [isArenaOpen, setIsArenaOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState(1);
  const [qIndex, setQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isOpenReview, setIsOpenReview] = useState(false);

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

  // Timer Countdown for Quiz in Arena
  useEffect(() => {
    if (!isArenaOpen || activeTab !== "quiz" || quizSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isArenaOpen, activeTab, quizSubmitted, timeLeft]);

  const handleSelectOption = (qId, optKey) => {
    const isPracticeMode = activeTab !== "quiz";
    if (isPracticeMode && userAnswers[qId]) return;

    setUserAnswers((prev) => ({ ...prev, [qId]: optKey }));
  };

  const openSetArena = (setNum) => {
    setSelectedSet(setNum);
    setQIndex(0);
    setUserAnswers({});
    setQuizSubmitted(false);
    setIsOpenReview(false);
    setTimeLeft(600);
    setIsArenaOpen(true);
  };

  const closeArena = () => {
    setIsArenaOpen(false);
    setQuizSubmitted(false);
    setIsOpenReview(false);
    setUserAnswers({});
  };

  const mcqsList = questions.filter((q) => !q.is_pyq);
  const pyqsList = questions.filter((q) => q.is_pyq);
  const currentTabList = activeTab === "mcqs" ? mcqsList : activeTab === "pyqs" ? pyqsList : questions;

  const totalSets = Math.max(1, Math.ceil(currentTabList.length / 20));
  const startIndex = (selectedSet - 1) * 20;
  const currentSetQuestions = currentTabList.slice(startIndex, startIndex + 20);
  const currentQ = currentSetQuestions[qIndex] || currentSetQuestions[0];

  // ➡️ Handle Next Set Transition
  const handleGoToNextSet = () => {
    if (selectedSet < totalSets) {
      openSetArena(selectedSet + 1);
    } else {
      closeArena();
    }
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

  // Result Calculation
  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;

  currentSetQuestions.forEach((q) => {
    const ans = userAnswers[q.id];
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
    <main className="max-w-md mx-auto px-3 space-y-3.5 pb-28 pt-1 font-sans select-none">

      {/* 🧭 A. SPECIAL FULL-SCREEN TEST ARENA */}
      {isArenaOpen ? (
        <div className="space-y-3 animate-fadeIn">

          {/* Top Arena Exit Bar */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0e131f] border border-slate-800">
            <button
              type="button"
              onClick={closeArena}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 cursor-pointer transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" /> बाहर निकलें
            </button>
            <span className="text-xs font-black text-purple-400">
              {activeTab === "quiz" ? "स्पीड टेस्ट" : activeTab === "pyqs" ? "PYQs अभ्यास" : "MCQs अभ्यास"} • Set {selectedSet}/{totalSets}
            </span>
          </div>

          {/* 🎯 STABLE QUESTION CARD (स्थिर कार्ड - नो जर्क) */}
          {(!quizSubmitted || activeTab !== "quiz") ? (
            currentQ ? (
              <div className="min-h-[520px] p-5 sm:p-6 rounded-3xl bg-[#0e131f] border border-slate-800/90 shadow-2xl flex flex-col justify-between space-y-4">

                <div className="space-y-4">
                  {/* Header: Badge & Timer */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase">
                        {currentQ.is_pyq ? (currentQ.exam_tag || "PYQ") : "HARD"}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        प्रश्न {qIndex + 1} / {currentSetQuestions.length}
                      </span>
                    </div>

                    {activeTab === "quiz" && (
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5" /> {formatTime(timeLeft)}
                      </div>
                    )}
                  </div>

                  {/* Big Formatted Question Text */}
                  <div className="min-h-[48px]">
                    <FormattedQuestionText text={currentQ.question} />
                  </div>

                  {/* Large Options List (स्थिर व स्पष्ट) */}
                  <div className="space-y-2.5 pt-1">
                    {[
                      { key: "A", text: currentQ.option_a },
                      { key: "B", text: currentQ.option_b },
                      { key: "C", text: currentQ.option_c },
                      { key: "D", text: currentQ.option_d }
                    ].map((opt) => {
                      const isSelected = userAnswers[currentQ.id] === opt.key;
                      const isPracticeMode = activeTab !== "quiz";
                      const isAnswered = isPracticeMode && !!userAnswers[currentQ.id];

                      let optClass = "bg-slate-950/70 border-slate-800/90 text-slate-200 hover:border-slate-700";

                      if (isPracticeMode && isAnswered) {
                        if (opt.key === currentQ.answer) {
                          optClass = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-md shadow-emerald-900/20";
                        } else if (isSelected) {
                          optClass = "bg-rose-500/20 border-rose-500 text-rose-300 line-through font-semibold";
                        } else {
                          optClass = "bg-slate-950/30 border-slate-900 text-slate-600 opacity-50";
                        }
                      } else if (isSelected) {
                        optClass = "bg-purple-600/25 border-purple-500 text-white font-bold shadow-md shadow-purple-900/30";
                      }

                      return (
                        <button
                          key={opt.key}
                          type="button"
                          disabled={isPracticeMode && isAnswered}
                          onClick={() => handleSelectOption(currentQ.id, opt.key)}
                          className={`w-full min-h-[50px] p-3.5 sm:p-4 rounded-2xl border text-left flex items-center justify-between gap-3.5 transition cursor-pointer active:scale-[0.99] ${optClass}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${
                              isSelected ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-300"
                            }`}>
                              {opt.key}
                            </span>
                            <span className="text-sm font-medium leading-snug">{opt.text || `विकल्प ${opt.key}`}</span>
                          </div>
                          {isPracticeMode && isAnswered && opt.key === currentQ.answer && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          )}
                          {isPracticeMode && isAnswered && isSelected && opt.key !== currentQ.answer && (
                            <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Instant Explanation in Practice Mode */}
                  {activeTab !== "quiz" && userAnswers[currentQ.id] && currentQ.explanation && (
                    <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 space-y-1.5 animate-fadeIn">
                      <div className="font-bold flex items-center gap-1.5 text-indigo-300 text-xs sm:text-sm">
                        <HelpCircle className="w-4 h-4" /> विस्तृत व्याख्या:
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-200">
                        {currentQ.explanation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Stable Navigation Buttons (नीचे स्थिर) */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-850 gap-3 mt-auto">
                  <button
                    type="button"
                    disabled={qIndex === 0}
                    onClick={() => setQIndex((prev) => prev - 1)}
                    className="flex-1 py-3.5 rounded-2xl bg-slate-800/90 text-slate-300 font-bold text-xs disabled:opacity-40 flex items-center justify-center gap-1 cursor-pointer transition active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" /> पिछला
                  </button>

                  {qIndex === currentSetQuestions.length - 1 ? (
                    activeTab === "quiz" ? (
                      <button
                        type="button"
                        onClick={() => setQuizSubmitted(true)}
                        className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1 cursor-pointer transition active:scale-95"
                      >
                        सबमिट करें
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGoToNextSet}
                        className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95"
                      >
                        {selectedSet < totalSets ? (
                          <>अगला सेट {selectedSet + 1} <FastForward className="w-4 h-4 fill-current" /></>
                        ) : (
                          <>अभ्यास समाप्त • सेट्स देखें <Check className="w-4 h-4" /></>
                        )}
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => setQIndex((prev) => prev + 1)}
                      className="flex-1 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1 cursor-pointer transition active:scale-95"
                    >
                      अगला <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            ) : null
          ) : (
            /* Results Screen */
            <div className="space-y-4 animate-fadeIn">
              <div className="p-6 rounded-3xl bg-[#0e131f] border border-slate-800 text-center space-y-4 shadow-2xl">
                <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">स्पीड टेस्ट परिणाम</h3>
                  <p className="text-xs text-slate-400">{chapter.name} • Set {selectedSet}</p>
                </div>

                <div className="grid grid-cols-3 gap-2.5 py-2">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="text-emerald-400 font-black text-lg">{correctCount}</div>
                    <div className="text-[10px] text-slate-400">सही उत्तर</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="text-rose-400 font-black text-lg">{wrongCount}</div>
                    <div className="text-[10px] text-slate-400">गलत उत्तर</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="text-amber-400 font-black text-lg">{accuracyPercent}%</div>
                    <div className="text-[10px] text-slate-400">सटीकता</div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => openSetArena(selectedSet)}
                    className="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" /> री-टेस्ट
                  </button>
                  <button
                    type="button"
                    onClick={handleGoToNextSet}
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {selectedSet < totalSets ? `सेट ${selectedSet + 1} टेस्ट ➡️` : "अन्य सेट्स देखें"}
                  </button>
                </div>
              </div>

              {/* Accordion Review */}
              <div className="rounded-3xl bg-[#0e131f] border border-slate-800 overflow-hidden shadow-xl">
                <button
                  type="button"
                  onClick={() => setIsOpenReview(!isOpenReview)}
                  className="w-full p-4 flex items-center justify-between bg-slate-900/90 hover:bg-slate-800 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {isOpenReview ? "उत्तर व व्याख्या छिपाएँ" : "🔍 सभी प्रश्नों के उत्तर व व्याख्या देखें"}
                    </span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpenReview ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {isOpenReview && (
                  <div className="p-4 space-y-4 divide-y divide-slate-800/60">
                    {currentSetQuestions.map((q, idx) => {
                      const userAns = userAnswers[q.id];
                      const isCorrect = userAns === q.answer;
                      const isUnattempted = !userAns;

                      return (
                        <div key={q.id} className="pt-4 first:pt-0 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              प्रश्न #{idx + 1}
                            </span>
                            {isUnattempted ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                                अनुत्तरित
                              </span>
                            ) : isCorrect ? (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                <Check className="w-3 h-3" /> सही (+1)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                                <X className="w-3 h-3" /> गलत (-0.33)
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
                              let optStyle = "bg-slate-950/40 border-slate-800/80 text-slate-400";
                              if (opt.key === q.answer) optStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                              else if (userAns === opt.key && !isCorrect) optStyle = "bg-rose-500/20 border-rose-500 text-rose-300 line-through font-semibold";

                              return (
                                <div key={opt.key} className={`p-3 rounded-2xl border text-xs sm:text-sm flex items-center justify-between ${optStyle}`}>
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                                      {opt.key}
                                    </span>
                                    <span>{opt.text}</span>
                                  </div>
                                  {opt.key === q.answer && <span className="text-[11px] text-emerald-400 font-bold">✓ सही उत्तर</span>}
                                  {userAns === opt.key && !isCorrect && <span className="text-[11px] text-rose-400 font-bold">✗ आपका चयन</span>}
                                </div>
                              );
                            })}
                          </div>

                          {q.explanation && (
                            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
                              <div className="font-bold flex items-center gap-1 text-indigo-300">
                                <HelpCircle className="w-3.5 h-3.5" /> व्याख्या:
                              </div>
                              <p className="text-xs leading-relaxed whitespace-pre-line text-slate-200">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 📚 B. CHAPTER MAIN HUB */
        <>
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

          <section className="p-4 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/60 border border-purple-500/20 shadow-xl space-y-1 relative overflow-hidden">
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
              {chapter.subjects?.name} • सम्पूर्ण मास्टरक्लास
            </div>
            <h1 className="text-base sm:text-lg font-black text-white leading-snug">{chapter.name}</h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              {chapter.description || "अवधारणाओं को समझें एवं 20-20 टेस्ट सेट्स का अभ्यास करें।"}
            </p>
          </section>

          <section className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                activeTab === "notes" ? "bg-purple-950/50 border-purple-500 shadow-md" : "bg-[#0e131f] border-slate-800/90"
              }`}
            >
              <BookOpen className="w-4 h-4 text-purple-400 mb-1" />
              <h2 className="text-xs font-bold text-white leading-tight">स्मार्ट नोट्स</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">{notes.length} शीट उपलब्ध</p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("mcqs")}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                activeTab === "mcqs" ? "bg-purple-950/50 border-purple-500 shadow-md" : "bg-[#0e131f] border-slate-800/90"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1" />
              <h2 className="text-xs font-bold text-white leading-tight">अभ्यास MCQs</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">{mcqsList.length} प्रश्न ({Math.ceil(mcqsList.length / 20)} Sets)</p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pyqs")}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                activeTab === "pyqs" ? "bg-purple-950/50 border-purple-500 shadow-md" : "bg-[#0e131f] border-slate-800/90"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400 mb-1" />
              <h2 className="text-xs font-bold text-white leading-tight">विगत वर्ष PYQs</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">{pyqsList.length} प्रश्न ({Math.ceil(pyqsList.length / 20)} Sets)</p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("quiz")}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                activeTab === "quiz" ? "bg-purple-950/50 border-purple-500 shadow-md" : "bg-[#0e131f] border-slate-800/90"
              }`}
            >
              <Trophy className="w-4 h-4 text-purple-400 mb-1" />
              <h2 className="text-xs font-bold text-white leading-tight">स्पीड टेस्ट</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">20 Qs • 10 मिनट</p>
            </button>
          </section>

          {activeTab === "notes" ? (
            <PDFNotesSheet notes={notes} chapterName={chapter.name} />
          ) : (
            <section className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
                <span className="flex items-center gap-1.5 text-purple-400">
                  <Layers className="w-4 h-4" /> उपलब्ध 20-20 टेस्ट सेट्स ({totalSets})
                </span>
                <span className="text-[10px] text-slate-500 uppercase">टैप करके टेस्ट शुरू करें</span>
              </div>

              <div className="grid gap-2.5">
                {Array.from({ length: totalSets }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => openSetArena(idx + 1)}
                    className="w-full p-4 rounded-2xl bg-[#0e131f] hover:bg-purple-950/30 border border-slate-800/90 hover:border-purple-500/50 flex items-center justify-between group transition active:scale-[0.99] cursor-pointer shadow-lg"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/15 border border-purple-500/25 flex items-center justify-center text-purple-400 font-black text-sm group-hover:scale-105 transition">
                        {idx + 1}
                      </div>
                      <div className="text-left">
                        <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-300 transition">
                          प्रैक्टिस सेट #{idx + 1}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          प्रश्न {idx * 20 + 1} से {Math.min((idx + 1) * 20, currentTabList.length)} • 20 MCQs
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:translate-x-1 transition">
                      <Play className="w-3.5 h-3.5 fill-current" /> शुरू करें
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}

    </main>
  );
}