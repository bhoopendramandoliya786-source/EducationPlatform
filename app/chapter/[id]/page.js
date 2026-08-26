"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { 
  ArrowLeft, BookOpen, CheckCircle2, XCircle, 
  Sparkles, HelpCircle, Trophy, Play, RotateCcw, Timer,
  Share2, Layers, Table
} from "lucide-react";

// 📄 COMPACT PDF-STYLE SMART SHEET RENDERER (TABLES + DUAL COLUMN ONE-LINERS)
function PDFNotesSheet({ notes, chapterName }) {
  return (
    <div className="rounded-2xl bg-slate-950 border border-slate-800/80 shadow-2xl overflow-hidden font-sans text-slate-200">

      {/* 🏷️ Top Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase block">
            EduAI Pro • REET & RPSC SPECIAL
          </span>
          <h2 className="text-sm sm:text-base font-black text-white">{chapterName} (Smart One-Liners)</h2>
        </div>
        <span className="text-[9px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md">
          50 MARKS SHEET
        </span>
      </div>

      {/* 📜 Continuous Sheet Body */}
      <div className="p-3 sm:p-4 space-y-6">
        {notes.map((note) => {
          const rawLines = note.content.split("\n").map(l => l.trim()).filter(Boolean);

          // Categorize lines into tables and one-liners
          const elements = [];
          let currentTable = null;

          rawLines.forEach((line) => {
            if (line.includes("|")) {
              const cols = line.split("|").map(c => c.trim()).filter(Boolean);
              if (!currentTable) {
                currentTable = { type: "table", rows: [] };
                elements.push(currentTable);
              }
              currentTable.rows.push(cols);
            } else {
              currentTable = null;
              elements.push({ type: "line", text: line });
            }
          });

          return (
            <div key={note.id} className="space-y-2.5">

              {/* Section Header (भाग 1, सारणी 1 आदि) */}
              <div className="flex items-center gap-2 pb-1.5 border-b border-indigo-500/30">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <h3 className="text-xs sm:text-sm font-black text-indigo-300 uppercase tracking-wide">
                  {note.title}
                </h3>
              </div>

              {/* Render Structured Elements */}
              <div className="space-y-2">
                {elements.map((el, elIdx) => {
                  // 1. PDF Style Table (सारणी)
                  if (el.type === "table") {
                    return (
                      <div key={elIdx} className="overflow-x-auto my-2 rounded-xl border border-slate-800 bg-slate-900/60">
                        <table className="w-full text-left text-xs border-collapse">
                          <tbody>
                            {el.rows.map((row, rIdx) => (
                              <tr key={rIdx} className={rIdx === 0 ? "bg-indigo-950/80 font-bold text-indigo-200 border-b border-slate-800" : "border-b border-slate-800/50 hover:bg-slate-800/30"}>
                                {row.map((col, cIdx) => (
                                  <td key={cIdx} className={`py-1.5 px-2.5 ${rIdx === 0 ? "text-indigo-300 font-black text-[11px]" : "text-slate-300 text-xs"} ${cIdx > 0 ? "border-l border-slate-800/50" : ""}`}>
                                    {col}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }

                  // 2. One-Liners (Compact Dual-Column / Rows)
                  const line = el.text;
                  if (line.includes(" - ") || line.includes("?")) {
                    const [qPart, aPart] = line.split(/ - | \? - /);
                    return (
                      <div 
                        key={elIdx} 
                        className="py-1.5 px-2.5 rounded-lg bg-slate-900/50 border border-slate-800/60 flex items-baseline justify-between gap-2 hover:bg-slate-900 transition"
                      >
                        <span className="text-xs font-semibold text-slate-200 leading-snug">
                          {qPart.replace(/^•\s*/, "")}{!qPart.includes("?") && !aPart ? "?" : ""}
                        </span>
                        {aPart && (
                          <span className="text-xs font-black text-amber-400 shrink-0 text-right">
                            👉 {aPart.trim()}
                          </span>
                        )}
                      </div>
                    );
                  }

                  // Headings or single-line special facts
                  return (
                    <div key={elIdx} className="py-1 px-2.5 rounded-md bg-indigo-950/40 border-l-2 border-indigo-400 text-xs text-indigo-200 font-medium">
                      {line}
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

      {/* 📌 Bottom Sheet Footer */}
      <div className="bg-slate-900/90 px-4 py-2.5 border-t border-slate-800 text-center text-[10px] text-slate-500 font-bold">
        ✨ सम्पूर्ण परीक्षा-उपयोगी शीट • EduAI Pro ✨
      </div>

    </div>
  );
}

// 🎯 QUESTION FORMATTER (MATCHING & STATEMENTS)
function FormattedQuestionText({ text }) {
  if (!text) return null;

  // 1. सुमेलित प्रश्न (Matching Questions Detection)
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
        <div className="space-y-2.5">
          <p className="text-white text-xs sm:text-sm font-bold leading-relaxed">{titlePart.trim()}</p>

          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shadow-md">
            <div className="grid grid-cols-2 bg-indigo-950/60 border-b border-slate-800 px-3 py-1.5 text-[11px] font-black text-indigo-300">
              <span>सूची - I</span>
              <span>सूची - II</span>
            </div>
            <div className="divide-y divide-slate-800/60">
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-2 px-3 py-1.5 text-xs">
                  <span className="font-medium pr-2 text-slate-300">{r.col1}</span>
                  <span className="font-bold text-indigo-300 border-l border-slate-800/80 pl-2.5">{r.col2}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 pt-0.5">
            <span>🎯 सही कूट का चयन कीजिए:</span>
          </div>
        </div>
      );
    }
  }

  // 2. कथन एवं कारण (Assertion - Reason)
  if (text.includes("कथन (A)") || text.includes("कथन(A)") || text.includes("कथन:")) {
    const parts = text.split(/(?=कारण\s*\(R\)|कारण:|सही\s*विकल्प|उपर्युक्त)/gi);
    return (
      <div className="space-y-2 text-xs sm:text-sm">
        {parts.map((p, idx) => {
          const str = p.trim();
          if (str.startsWith("कथन")) {
            return (
              <div key={idx} className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 font-medium">
                <strong className="text-indigo-400 block mb-0.5 font-bold">📌 कथन (A):</strong>
                {str.replace(/^कथन\s*(\([A-Z]\)|:)?\s*/i, "")}
              </div>
            );
          }
          if (str.startsWith("कारण")) {
            return (
              <div key={idx} className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 font-medium">
                <strong className="text-purple-400 block mb-0.5 font-bold">💡 कारण (R):</strong>
                {str.replace(/^कारण\s*(\([A-Z]\)|:)?\s*/i, "")}
              </div>
            );
          }
          return <p key={idx} className="text-slate-300 font-bold pt-1">{str}</p>;
        })}
      </div>
    );
  }

  // साधारण प्रश्न
  return <p className="text-white text-xs sm:text-sm font-bold leading-relaxed">{text}</p>;
}

export default function ChapterSingleViewPage() {
  const { id } = useParams();
  const [chapter, setChapter] = useState(null);
  const [activeTab, setActiveTab] = useState("notes");
  const [notes, setNotes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  const [selectedSet, setSelectedSet] = useState(1);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

  const supabase = createClient();

  useEffect(() => {
    async function loadChapterData() {
      if (!id) return;
      setLoading(true);
      try {
        const { data: chapData, error: chapErr } = await supabase
          .from("chapters")
          .select("*, subjects(id, name)")
          .eq("id", id)
          .single();

        if (!chapErr && chapData) setChapter(chapData);

        const { data: nData, error: nErr } = await supabase
          .from("notes")
          .select("*")
          .eq("chapter_id", id)
          .eq("is_published", true)
          .order("sort_order", { ascending: true });

        if (!nErr && nData) setNotes(nData);

        const { data: qData, error: qErr } = await supabase
          .from("questions")
          .select("*")
          .eq("chapter_id", id)
          .eq("is_active", true)
          .order("id", { ascending: true });

        if (!qErr && qData) setQuestions(qData);
      } catch (err) {
        console.error("Chapter load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadChapterData();
  }, [id]);

  useEffect(() => {
    let timer;
    if (quizStarted && !quizSubmitted && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && quizStarted && !quizSubmitted) {
      setQuizSubmitted(true);
    }
    return () => clearInterval(timer);
  }, [quizStarted, quizSubmitted, timeLeft]);

  const handleSelectOption = (qId, optKey) => {
    if (selectedAnswers[qId]) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optKey }));
  };

  const handleQuizAnswer = (qId, optKey) => {
    setQuizAnswers((prev) => ({ ...prev, [qId]: optKey }));
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizSubmitted(false);
    setCurrentQIndex(0);
    setQuizAnswers({});
    setTimeLeft(600);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-900 rounded-lg" />
        <div className="h-28 bg-slate-900 rounded-2xl border border-slate-800" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="max-w-md mx-auto px-4 pt-12 text-center text-xs text-slate-400">
        अध्याय नहीं मिला। <Link href="/" className="text-indigo-400 font-bold ml-1">होम जाएँ</Link>
      </div>
    );
  }

  const mcqsList = questions.filter((q) => !q.is_pyq);
  const pyqsList = questions.filter((q) => q.is_pyq);

  const currentTabList = activeTab === "mcqs" ? mcqsList : activeTab === "pyqs" ? pyqsList : questions;

  const totalSets = Math.max(1, Math.ceil(currentTabList.length / 20));
  const startIndex = (selectedSet - 1) * 20;
  const currentSetQuestions = currentTabList.slice(startIndex, startIndex + 20);

  const speedTestQuestions = questions.slice((selectedSet - 1) * 20, selectedSet * 20);

  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;

  speedTestQuestions.forEach((q) => {
    const ans = quizAnswers[q.id];
    if (!ans) unattemptedCount++;
    else if (ans === q.answer) correctCount++;
    else wrongCount++;
  });

  const accuracyPercent = speedTestQuestions.length > 0 ? Math.round((correctCount / speedTestQuestions.length) * 100) : 0;

  const shareScoreOnWhatsApp = () => {
    const text = `🔥 मैंने EduAI Pro पर "${chapter.name} (Set ${selectedSet})" टेस्ट में ${speedTestQuestions.length} में से ${correctCount} सही (${accuracyPercent}%) स्कोर किया! 🎯\n\nअभी टेस्ट दें: https://education-platform-fawn-six.vercel.app/chapter/${id}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="max-w-md mx-auto px-3.5 space-y-3.5 pb-28 pt-2 font-sans select-none">

      {/* Back Link */}
      <Link 
        href={chapter.subjects ? `/subject/${chapter.subjects.id}` : "/"} 
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> वापस विषय ({chapter.subjects?.name || "विषय"})
      </Link>

      {/* Hero Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-1">
        <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
          {chapter.subjects?.name} • सम्पूर्ण अध्याय
        </div>
        <h1 className="text-base sm:text-lg font-black text-white leading-snug">{chapter.name}</h1>
        <p className="text-[11px] text-slate-300">
          {chapter.description || "थ्योरी नोट्स, अभ्यास MCQs एवं विगत वर्ष PYQs"}
        </p>
      </div>

      {/* 4 Main Tabs */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => { setActiveTab("notes"); setSelectedSet(1); }}
          className={`p-2.5 rounded-xl border text-left space-y-0.5 transition ${
            activeTab === "notes" ? "bg-indigo-600/20 border-indigo-500 shadow" : "bg-slate-900/80 border-slate-800"
          }`}
        >
          <BookOpen className={`w-3.5 h-3.5 ${activeTab === "notes" ? "text-indigo-400" : "text-slate-400"}`} />
          <h3 className="text-xs font-bold text-white">1. स्मार्ट नोट्स</h3>
          <p className="text-[9px] text-slate-400">{notes.length} नोट्स शीट</p>
        </button>

        <button
          onClick={() => { setActiveTab("mcqs"); setSelectedSet(1); }}
          className={`p-2.5 rounded-xl border text-left space-y-0.5 transition ${
            activeTab === "mcqs" ? "bg-emerald-600/20 border-emerald-500 shadow" : "bg-slate-900/80 border-slate-800"
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${activeTab === "mcqs" ? "text-emerald-400" : "text-slate-400"}`} />
          <h3 className="text-xs font-bold text-white">2. अभ्यास MCQs</h3>
          <p className="text-[9px] text-emerald-400 font-bold">{mcqsList.length} प्रश्न ({Math.ceil(mcqsList.length / 20)} Sets)</p>
        </button>

        <button
          onClick={() => { setActiveTab("pyqs"); setSelectedSet(1); }}
          className={`p-2.5 rounded-xl border text-left space-y-0.5 transition ${
            activeTab === "pyqs" ? "bg-amber-600/20 border-amber-500 shadow" : "bg-slate-900/80 border-slate-800"
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${activeTab === "pyqs" ? "text-amber-400" : "text-slate-400"}`} />
          <h3 className="text-xs font-bold text-white">3. विगत वर्ष PYQs</h3>
          <p className="text-[9px] text-amber-400 font-bold">{pyqsList.length} प्रश्न ({Math.ceil(pyqsList.length / 20)} Sets)</p>
        </button>

        <button
          onClick={() => { setActiveTab("quiz"); resetQuiz(); }}
          className={`p-2.5 rounded-xl border text-left space-y-0.5 transition ${
            activeTab === "quiz" ? "bg-purple-600/20 border-purple-500 shadow" : "bg-slate-900/80 border-slate-800"
          }`}
        >
          <Trophy className={`w-3.5 h-3.5 ${activeTab === "quiz" ? "text-purple-400" : "text-slate-400"}`} />
          <h3 className="text-xs font-bold text-white">4. स्पीड टेस्ट</h3>
          <p className="text-[9px] text-purple-300 font-bold">20 Qs • 10 मिनट</p>
        </button>
      </div>

      {/* Set Selector Bar */}
      {activeTab !== "notes" && totalSets > 1 && !quizStarted && (
        <div className="space-y-1 pt-0.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span className="flex items-center gap-1 text-[11px]">
              <Layers className="w-3 h-3 text-indigo-400" /> सेट चुनें (20 Qs / Set):
            </span>
            <span className="text-[10px] text-indigo-400">Set {selectedSet} of {totalSets}</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {Array.from({ length: totalSets }, (_, i) => i + 1).map((sNum) => (
              <button
                key={sNum}
                onClick={() => setSelectedSet(sNum)}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  selectedSet === sNum
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700"
                }`}
              >
                Set {sNum} (Q.{ (sNum - 1) * 20 + 1 } - { Math.min(sNum * 20, currentTabList.length) })
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: Smart Notes Sheet */}
      {activeTab === "notes" && (
        <div className="pt-0.5">
          {notes.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
              इस अध्याय में नोट्स जल्द जोड़े जा रहे हैं।
            </div>
          ) : (
            <PDFNotesSheet notes={notes} chapterName={chapter.name} />
          )}
        </div>
      )}

      {/* TAB 2 & 3: MCQs / PYQs */}
      {(activeTab === "mcqs" || activeTab === "pyqs") && (
        <div className="space-y-2.5 pt-0.5">
          {currentSetQuestions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
              प्रश्न जोड़े जा रहे हैं।
            </div>
          ) : (
            currentSetQuestions.map((q, idx) => {
              const globalIndex = startIndex + idx;
              const userAnswer = selectedAnswers[q.id];
              const isAttempted = Boolean(userAnswer);

              return (
                <div key={q.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                      {q.is_pyq ? `PYQ: ${q.source || "Exam"} ${q.year ? `(${q.year})` : ""}` : "अभ्यास प्रश्न (MCQ)"}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-500 uppercase">{q.difficulty || "Medium"}</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-indigo-400 font-black text-xs block">Q{globalIndex + 1}.</span>
                    <FormattedQuestionText text={q.question} />
                  </div>

                  <div className="grid grid-cols-1 gap-1.5 pt-0.5">
                    {[
                      { key: "A", text: q.option_a },
                      { key: "B", text: q.option_b },
                      { key: "C", text: q.option_c },
                      { key: "D", text: q.option_d }
                    ].map((opt) => {
                      let style = "bg-slate-950/60 border-slate-800/80 text-slate-300";
                      if (isAttempted) {
                        if (opt.key === q.answer) style = "bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold";
                        else if (opt.key === userAnswer) style = "bg-rose-500/20 border-rose-500 text-rose-200 font-bold";
                        else style = "bg-slate-950/40 border-slate-900 text-slate-600 opacity-40";
                      }

                      return (
                        <button
                          key={opt.key}
                          disabled={isAttempted}
                          onClick={() => handleSelectOption(q.id, opt.key)}
                          className={`py-2 px-2.5 rounded-lg border text-left text-xs flex items-center justify-between transition ${style}`}
                        >
                          <span><strong>{opt.key}.</strong> {opt.text}</span>
                          {isAttempted && opt.key === q.answer && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                          {isAttempted && opt.key === userAnswer && opt.key !== q.answer && <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {isAttempted && q.explanation && (
                    <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200 space-y-0.5">
                      <div className="font-bold text-indigo-300 flex items-center gap-1 text-[10px]">
                        <HelpCircle className="w-3 h-3" /> विस्तृत व्याख्या:
                      </div>
                      <p className="text-slate-200 text-[11px] leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 4: Speed Test */}
      {activeTab === "quiz" && (
        <div className="space-y-3 pt-0.5">
          {speedTestQuestions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
              प्रश्न जोड़े जा रहे हैं।
            </div>
          ) : !quizStarted ? (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-3 shadow">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{chapter.name} - Set {selectedSet}</h3>
                <p className="text-xs text-slate-400 mt-0.5">कुल प्रश्न: {speedTestQuestions.length} • समय सीमा: 10 मिनट</p>
              </div>
              <button
                onClick={() => setQuizStarted(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow active:scale-95 transition"
              >
                <Play className="w-3.5 h-3.5 inline-block mr-1" /> Set {selectedSet} टेस्ट शुरू करें
              </button>
            </div>
          ) : quizSubmitted ? (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-3 shadow">
              <Trophy className="w-7 h-7 text-amber-400 mx-auto" />
              <div>
                <h3 className="text-xs font-bold text-slate-400">Set {selectedSet} स्कोरकार्ड</h3>
                <div className="text-3xl font-black text-emerald-400 pt-0.5">{accuracyPercent}%</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-sm font-black text-emerald-400">{correctCount}</div>
                  <div className="text-[9px] text-slate-400">सही</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-sm font-black text-rose-400">{wrongCount}</div>
                  <div className="text-[9px] text-slate-400">गलत</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-sm font-black text-slate-400">{unattemptedCount}</div>
                  <div className="text-[9px] text-slate-400">छोड़े गए</div>
                </div>
              </div>
              <button
                onClick={shareScoreOnWhatsApp}
                className="w-full py-2.5 rounded-xl bg-[#25D366] text-slate-950 font-black text-xs shadow flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <Share2 className="w-3.5 h-3.5" /> WhatsApp पर शेयर करें
              </button>
              <button
                onClick={resetQuiz}
                className="w-full py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> पुनः टेस्ट दें
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Set {selectedSet}: प्रश्न {currentQIndex + 1} / {speedTestQuestions.length}</span>
                <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                  <Timer className="w-3.5 h-3.5" /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>

              <div className="space-y-0.5">
                <FormattedQuestionText text={speedTestQuestions[currentQIndex].question} />
              </div>

              <div className="grid grid-cols-1 gap-1.5 pt-0.5">
                {[
                  { key: "A", text: speedTestQuestions[currentQIndex].option_a },
                  { key: "B", text: speedTestQuestions[currentQIndex].option_b },
                  { key: "C", text: speedTestQuestions[currentQIndex].option_c },
                  { key: "D", text: speedTestQuestions[currentQIndex].option_d }
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleQuizAnswer(speedTestQuestions[currentQIndex].id, opt.key)}
                    className={`py-2 px-2.5 rounded-lg border text-left text-xs transition ${
                      quizAnswers[speedTestQuestions[currentQIndex].id] === opt.key 
                        ? "bg-indigo-600/30 border-indigo-500 text-white font-bold" 
                        : "bg-slate-950/80 border-slate-800 text-slate-300"
                    }`}
                  >
                    <strong>{opt.key}.</strong> {opt.text}
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center pt-1.5">
                <button
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((prev) => prev - 1)}
                  className="px-3.5 py-1.5 bg-slate-800 rounded-lg text-xs font-bold text-slate-300 disabled:opacity-30"
                >
                  ← पिछला
                </button>
                {currentQIndex === speedTestQuestions.length - 1 ? (
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    className="px-4 py-1.5 bg-emerald-600 rounded-lg text-xs font-bold text-white active:scale-95 transition shadow"
                  >
                    सबमिट करें ✓
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQIndex((prev) => prev + 1)}
                    className="px-4 py-1.5 bg-indigo-600 rounded-lg text-xs font-bold text-white active:scale-95 transition shadow"
                  >
                    अगला →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}