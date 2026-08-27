"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { 
  ArrowLeft, BookOpen, CheckCircle2, XCircle, 
  Sparkles, HelpCircle, Trophy, Play, RotateCcw, Timer,
  Share2, Layers, BookmarkCheck
} from "lucide-react";

// 🌟 100% SMART & PREMIUM RESPONSIVE BOOKLET RENDERER
function PDFNotesSheet({ notes, chapterName }) {
  return (
    <div className="rounded-2xl bg-[#090d16] border border-slate-800 shadow-2xl overflow-hidden font-sans text-slate-200">

      {/* 🏷️ Modern Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> EduAI Pro • REET & RPSC SPECIAL
          </span>
          <h2 className="text-xs sm:text-sm font-black text-white mt-0.5">{chapterName}</h2>
        </div>
        <span className="text-[10px] font-extrabold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg shadow-sm shrink-0">
          SMART BOOKLET
        </span>
      </div>

      {/* 📜 Styled Booklet Body */}
      <div className="p-3 sm:p-4 space-y-4">
        {notes.map((note) => {
          const rawLines = note.content.split("\n").map((l) => l.trim()).filter(Boolean);
          const blocks = [];
          let currentTable = null;

          rawLines.forEach((line) => {
            if (line.includes("|")) {
              const cols = line.split("|").map((c) => c.trim()).filter(Boolean);
              if (!currentTable) {
                currentTable = { type: "table", rows: [] };
                blocks.push(currentTable);
              }
              currentTable.rows.push(cols);
            } else {
              currentTable = null;
              blocks.push({ type: "text", content: line });
            }
          });

          return (
            <div key={note.id} className="space-y-3">

              {/* Note Title */}
              {note.title && (
                <div className="text-xs font-black text-amber-400 uppercase tracking-wide border-b border-slate-800 pb-2 flex items-center gap-1.5">
                  <BookmarkCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{note.title}</span>
                </div>
              )}

              {/* Dynamic Auto-Parser */}
              <div className="space-y-2">
                {blocks.map((b, idx) => {
                  // 1. 📊 Modern Glassmorphism Table (Mobile Scroll Proof)
                  if (b.type === "table") {
                    return (
                      <div key={idx} className="overflow-x-auto my-3 rounded-xl border border-slate-800 bg-slate-950/70 shadow-lg">
                        <table className="w-full text-left text-xs border-collapse min-w-[320px]">
                          <tbody>
                            {b.rows.map((row, rIdx) => (
                              <tr
                                key={rIdx}
                                className={
                                  rIdx === 0
                                    ? "bg-indigo-950/60 font-black text-indigo-300 border-b border-slate-800 text-[11px]"
                                    : "border-b border-slate-800/40 hover:bg-slate-900/40 transition"
                                }
                              >
                                {row.map((col, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`py-2 px-3 text-[11px] leading-relaxed break-words ${
                                      cIdx > 0 ? "border-l border-slate-800/40" : ""
                                    } ${rIdx === 0 ? "text-indigo-300 font-bold" : "text-slate-300 font-medium"}`}
                                  >
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

                  const line = b.content;

                  // 2. 📌 Gradient Section Headings (भाग, सारणी आदि)
                  if (/^(📌|\#\#|भाग|सारणी|Chapter|Section|विशेष|महत्वपूर्ण)/i.test(line)) {
                    return (
                      <div
                        key={idx}
                        className="mt-3 mb-1.5 p-2 rounded-xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-transparent border border-indigo-500/30 text-indigo-200 text-xs font-black flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full inline-block shrink-0"></span>
                        <span className="break-words">{line.replace(/^(\#\#\s*|📌\s*)/, "")}</span>
                      </div>
                    );
                  }

                  // 3. 💡 High-Contrast One-Liner (Card Layout - Perfectly Responsive)
                  if (line.includes(" — ") || line.includes(" - ") || line.includes("?")) {
                    const parts = line.split(/\s*—\s*|\s*-\s*/);
                    const qText = parts[0];
                    const aText = parts.slice(1).join(" — ");

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2 hover:border-slate-700 transition w-full"
                      >
                        <div className="text-xs text-slate-100 font-medium leading-relaxed break-words">
                          {qText.replace(/^[•\*]\s*/, "")}
                        </div>
                        {aText && (
                          <div className="self-start px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 font-bold text-[11px] leading-relaxed break-words w-full sm:w-auto">
                            {aText.trim()}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // 4. 🔹 Bullet Points
                  if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
                    return (
                      <div key={idx} className="flex items-start gap-2 py-1 px-1 text-xs text-slate-300 leading-relaxed">
                        <span className="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
                        <span className="break-words">{line.replace(/^[•\-*]\s*/, "")}</span>
                      </div>
                    );
                  }

                  // 5. Normal Text
                  return (
                    <p key={idx} className="text-xs text-slate-300 leading-relaxed py-1 px-1 break-words">
                      {line}
                    </p>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

      {/* 📌 Clean Footer */}
      <div className="bg-slate-900/80 px-4 py-2.5 border-t border-slate-800 text-center text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-1">
        <Sparkles className="w-3 h-3 text-indigo-400" /> सम्पूर्ण अध्ययन सामग्री • EduAI Pro
      </div>

    </div>
  );
}

// 🎯 QUESTION FORMATTER (MATCHING & STATEMENTS)
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

          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
            <div className="grid grid-cols-2 bg-indigo-950/60 border-b border-slate-800 px-3 py-1 text-[11px] font-black text-indigo-300">
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

          <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
            <span>🎯 सही कूट का चयन कीजिए:</span>
          </div>
        </div>
      );
    }
  }

  if (text.includes("कथन (A)") || text.includes("कथन(A)") || text.includes("कथन:")) {
    const parts = text.split(/(?=कारण\s*\(R\)|कारण:|सही\s*विकल्प|उपर्युक्त)/gi);
    return (
      <div className="space-y-1.5 text-xs sm:text-sm">
        {parts.map((p, idx) => {
          const str = p.trim();
          if (str.startsWith("कथन")) {
            return (
              <div key={idx} className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-200">
                <strong className="text-indigo-400 block font-bold">📌 कथन (A):</strong>
                {str.replace(/^कथन\s*(\([A-Z]\)|:)?\s*/i, "")}
              </div>
            );
          }
          if (str.startsWith("कारण")) {
            return (
              <div key={idx} className="p-2 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-200">
                <strong className="text-purple-400 block font-bold">💡 कारण (R):</strong>
                {str.replace(/^कारण\s*(\([A-Z]\)|:)?\s*/i, "")}
              </div>
            );
          }
          return <p key={idx} className="text-slate-300 font-bold">{str}</p>;
        })}
      </div>
    );
  }

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
  }, [id, supabase]);

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
    <div className="max-w-md mx-auto px-3 space-y-3 pb-28 pt-2 font-sans select-none">

      {/* Back Link */}
      <Link 
        href={chapter.subjects ? `/subject/${chapter.subjects.id}` : "/"} 
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> वापस विषय ({chapter.subjects?.name || "विषय"})
      </Link>

      {/* Hero Card */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
        <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
          {chapter.subjects?.name} • सम्पूर्ण अध्याय
        </div>
        <h1 className="text-sm sm:text-base font-black text-white leading-snug">{chapter.name}</h1>
        <p className="text-[11px] text-slate-400">
          {chapter.description || "थ्योरी नोट्स, अभ्यास MCQs एवं विगत वर्ष PYQs"}
        </p>
      </div>

      {/* 4 Main Tabs */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => { setActiveTab("notes"); setSelectedSet(1); }}
          className={`p-2 rounded-xl border text-left transition ${
            activeTab === "notes" ? "bg-indigo-600/20 border-indigo-500" : "bg-slate-900 border-slate-800"
          }`}
        >
          <BookOpen className={`w-3.5 h-3.5 mb-1 ${activeTab === "notes" ? "text-indigo-400" : "text-slate-400"}`} />
          <h2 className="text-xs font-bold text-white leading-tight">1. स्मार्ट नोट्स</h2>
          <p className="text-[9px] text-slate-400">{notes.length} नोट्स शीट</p>
        </button>

        <button
          onClick={() => { setActiveTab("mcqs"); setSelectedSet(1); }}
          className={`p-2 rounded-xl border text-left transition ${
            activeTab === "mcqs" ? "bg-emerald-600/20 border-emerald-500" : "bg-slate-900 border-slate-800"
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 mb-1 ${activeTab === "mcqs" ? "text-emerald-400" : "text-slate-400"}`} />
          <h2 className="text-xs font-bold text-white leading-tight">2. अभ्यास MCQs</h2>
          <p className="text-[9px] text-emerald-400 font-bold">{mcqsList.length} प्रश्न ({Math.ceil(mcqsList.length / 20)} Sets)</p>
        </button>

        <button
          onClick={() => { setActiveTab("pyqs"); setSelectedSet(1); }}
          className={`p-2 rounded-xl border text-left transition ${
            activeTab === "pyqs" ? "bg-amber-600/20 border-amber-500" : "bg-slate-900 border-slate-800"
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 mb-1 ${activeTab === "pyqs" ? "text-amber-400" : "text-slate-400"}`} />
          <h2 className="text-xs font-bold text-white leading-tight">3. विगत वर्ष PYQs</h2>
          <p className="text-[9px] text-amber-400 font-bold">{pyqsList.length} प्रश्न ({Math.ceil(pyqsList.length / 20)} Sets)</p>
        </button>

        <button
          onClick={() => { setActiveTab("quiz"); resetQuiz(); }}
          className={`p-2 rounded-xl border text-left transition ${
            activeTab === "quiz" ? "bg-purple-600/20 border-purple-500" : "bg-slate-900 border-slate-800"
          }`}
        >
          <Trophy className={`w-3.5 h-3.5 mb-1 ${activeTab === "quiz" ? "text-purple-400" : "text-slate-400"}`} />
          <h2 className="text-xs font-bold text-white leading-tight">4. स्पीड टेस्ट</h2>
          <p className="text-[9px] text-purple-300 font-bold">20 Qs • 10 मिनट</p>
        </button>
      </div>

      {/* Set Selector Bar */}
      {activeTab !== "notes" && totalSets > 1 && !quizStarted && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span className="flex items-center gap-1 text-[11px]">
              <Layers className="w-3 h-3 text-indigo-400" /> सेट चुनें:
            </span>
            <span className="text-[10px] text-indigo-400">Set {selectedSet} of {totalSets}</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {Array.from({ length: totalSets }, (_, i) => i + 1).map((sNum) => (
              <button
                key={sNum}
                onClick={() => setSelectedSet(sNum)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  selectedSet === sNum
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-900 text-slate-400 border border-slate-800"
                }`}
              >
                Set {sNum} (Q.{ (sNum - 1) * 20 + 1 } - { Math.min(sNum * 20, currentTabList.length) })
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: Auto-Adaptive PDF Notes Sheet */}
      {activeTab === "notes" && (
        <div>
          {notes.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
              इस अध्याय में नोट्स जल्द जोड़े जा रहे हैं।
            </div>
          ) : (
            <PDFNotesSheet notes={notes} chapterName={chapter.name} />
          )}
        </div>
      )}

      {/* TAB 2 & 3: MCQs / PYQs */}
      {(activeTab === "mcqs" || activeTab === "pyqs") && (
        <div className="space-y-2">
          {currentSetQuestions.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
              प्रश्न जोड़े जा रहे हैं।
            </div>
          ) : (
            currentSetQuestions.map((q, idx) => {
              const globalIndex = startIndex + idx;
              const userAnswer = selectedAnswers[q.id];
              const isAttempted = Boolean(userAnswer);

              return (
                <div key={q.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                      {q.is_pyq ? `PYQ: ${q.source || "Exam"} ${q.year ? `(${q.year})` : ""}` : "अभ्यास प्रश्न (MCQ)"}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-500 uppercase">{q.difficulty || "Medium"}</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-indigo-400 font-black text-xs block">Q{globalIndex + 1}.</span>
                    <FormattedQuestionText text={q.question} />
                  </div>

                  <div className="grid grid-cols-1 gap-1 pt-0.5">
                    {[
                      { key: "A", text: q.option_a },
                      { key: "B", text: q.option_b },
                      { key: "C", text: q.option_c },
                      { key: "D", text: q.option_d }
                    ].map((opt) => {
                      let style = "bg-slate-950 border-slate-800 text-slate-300";
                      if (isAttempted) {
                        if (opt.key === q.answer) style = "bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold";
                        else if (opt.key === userAnswer) style = "bg-rose-500/20 border-rose-500 text-rose-200 font-bold";
                        else style = "bg-slate-950 text-slate-600 opacity-40";
                      }

                      return (
                        <button
                          key={opt.key}
                          disabled={isAttempted}
                          onClick={() => handleSelectOption(q.id, opt.key)}
                          className={`py-1.5 px-2 rounded-lg border text-left text-xs flex items-center justify-between transition ${style}`}
                        >
                          <span><strong>{opt.key}.</strong> {opt.text}</span>
                          {isAttempted && opt.key === q.answer && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                          {isAttempted && opt.key === userAnswer && opt.key !== q.answer && <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {isAttempted && q.explanation && (
                    <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200 space-y-0.5">
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
        <div className="space-y-2.5">
          {speedTestQuestions.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
              प्रश्न जोड़े जा रहे हैं।
            </div>
          ) : !quizStarted ? (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">{chapter.name} - Set {selectedSet}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">कुल प्रश्न: {speedTestQuestions.length} • समय सीमा: 10 मिनट</p>
              </div>
              <button
                onClick={() => setQuizStarted(true)}
                className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow active:scale-95 transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 inline-block mr-1" /> Set {selectedSet} टेस्ट शुरू करें
              </button>
            </div>
          ) : quizSubmitted ? (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2.5">
              <Trophy className="w-6 h-6 text-amber-400 mx-auto" />
              <div>
                <h3 className="text-[11px] font-bold text-slate-400">Set {selectedSet} स्कोरकार्ड</h3>
                <div className="text-2xl font-black text-emerald-400">{accuracyPercent}%</div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-xs font-black text-emerald-400">{correctCount}</div>
                  <div className="text-[9px] text-slate-400">सही</div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-xs font-black text-rose-400">{wrongCount}</div>
                  <div className="text-[9px] text-slate-400">गलत</div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-xs font-black text-slate-400">{unattemptedCount}</div>
                  <div className="text-[9px] text-slate-400">छोड़े गए</div>
                </div>
              </div>
              <button
                onClick={shareScoreOnWhatsApp}
                className="w-full py-2 rounded-lg bg-[#25D366] text-slate-950 font-bold text-xs shadow flex items-center justify-center gap-1 active:scale-95 transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> WhatsApp पर शेयर करें
              </button>
              <button
                onClick={resetQuiz}
                className="w-full py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> पुनः टेस्ट दें
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Set {selectedSet}: प्रश्न {currentQIndex + 1} / {speedTestQuestions.length}</span>
                <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                  <Timer className="w-3.5 h-3.5" /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>

              <div className="space-y-0.5">
                <FormattedQuestionText text={speedTestQuestions[currentQIndex].question} />
              </div>

              <div className="grid grid-cols-1 gap-1 pt-0.5">
                {[
                  { key: "A", text: speedTestQuestions[currentQIndex].option_a },
                  { key: "B", text: speedTestQuestions[currentQIndex].option_b },
                  { key: "C", text: speedTestQuestions[currentQIndex].option_c },
                  { key: "D", text: speedTestQuestions[currentQIndex].option_d }
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleQuizAnswer(speedTestQuestions[currentQIndex].id, opt.key)}
                    className={`py-1.5 px-2 rounded-lg border text-left text-xs transition ${
                      quizAnswers[speedTestQuestions[currentQIndex].id] === opt.key 
                        ? "bg-indigo-600/30 border-indigo-500 text-white font-bold" 
                        : "bg-slate-950 border-slate-800 text-slate-300"
                    }`}
                  >
                    <strong>{opt.key}.</strong> {opt.text}
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center pt-1">
                <button
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((prev) => prev - 1)}
                  className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold text-slate-300 disabled:opacity-30 cursor-pointer"
                >
                  ← पिछला
                </button>
                {currentQIndex === speedTestQuestions.length - 1 ? (
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    className="px-3.5 py-1 bg-emerald-600 rounded-lg text-xs font-bold text-white active:scale-95 transition cursor-pointer"
                  >
                    सबमिट करें ✓
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQIndex((prev) => prev + 1)}
                    className="px-3.5 py-1 bg-indigo-600 rounded-lg text-xs font-bold text-white active:scale-95 transition cursor-pointer"
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