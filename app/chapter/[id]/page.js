"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { 
  ArrowLeft, BookOpen, CheckCircle2, XCircle, 
  Sparkles, HelpCircle, Trophy, Play, RotateCcw, Timer,
  Share2, Layers, BookmarkCheck, ChevronRight, ChevronLeft, Clock
} from "lucide-react";

// 🌟 1. SMART RESPONSIVE BOOKLET RENDERER (TABLES & BULLETS)
function PDFNotesSheet({ notes, chapterName }) {
  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden font-sans text-slate-200">

      {/* Modern Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-purple-950/40 px-4 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> EduAI Pro • परीक्षा स्पेशल
          </span>
          <h2 className="text-xs sm:text-sm font-black text-white mt-0.5">{chapterName}</h2>
        </div>
        <span className="text-[10px] font-extrabold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg shadow-sm shrink-0">
          SMART BOOKLET
        </span>
      </div>

      {/* Styled Booklet Body */}
      <div className="p-3.5 sm:p-5 space-y-4">
        {notes.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            इस अध्याय के स्मार्ट नोट्स जल्द जोड़े जा रहे हैं।
          </div>
        ) : (
          notes.map((note) => {
            const rawLines = (note.content || "").split("\n").map((l) => l.trim()).filter(Boolean);
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
                {note.title && (
                  <div className="text-xs font-black text-amber-400 uppercase tracking-wide border-b border-slate-800 pb-2 flex items-center gap-1.5">
                    <BookmarkCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{note.title}</span>
                  </div>
                )}

                <div className="space-y-2">
                  {blocks.map((b, idx) => {
                    // 1. Table Parser
                    if (b.type === "table") {
                      return (
                        <div key={idx} className="overflow-x-auto my-3 rounded-2xl border border-slate-800 bg-slate-950/80 shadow-lg">
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

                    // 2. Headings
                    if (/^(📌|\#\#|भाग|सारणी|Chapter|Section|विशेष|महत्वपूर्ण)/i.test(line)) {
                      return (
                        <div
                          key={idx}
                          className="mt-3 mb-1.5 p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-transparent border border-indigo-500/30 text-indigo-200 text-xs font-black flex items-center gap-1.5 shadow-sm"
                        >
                          <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full inline-block shrink-0" />
                          <span className="break-words">{line.replace(/^(\#\#\s*|📌\s*)/, "")}</span>
                        </div>
                      );
                    }

                    // 3. High-Contrast One-Liner
                    if (line.includes(" — ") || line.includes(" - ") || line.includes("?")) {
                      const parts = line.split(/\s*—\s*|\s*-\s*/);
                      const qText = parts[0];
                      const aText = parts.slice(1).join(" — ");

                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col gap-2 hover:border-slate-700 transition w-full"
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

                    // 4. Bullet Points
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
          })
        )}
      </div>

      <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 text-center text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-1">
        <Sparkles className="w-3 h-3 text-indigo-400" /> सम्पूर्ण अध्ययन सामग्री • EduAI Pro
      </div>
    </div>
  );
}

// 🎯 2. QUESTION FORMATTER (MATCHING & STATEMENTS)
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

  return <p className="text-white text-xs sm:text-sm font-bold leading-relaxed">{text}</p>;
}

// 🚀 3. MAIN PAGE COMPONENT
export default function ChapterSingleViewPage() {
  const { id } = useParams();
  const [chapter, setChapter] = useState(null);
  const [activeTab, setActiveTab] = useState("notes"); // notes, mcqs, pyqs, quiz
  const [notes, setNotes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  // Set & Speed Test States
  const [selectedSet, setSelectedSet] = useState(1);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    async function loadChapterData() {
      if (!id) return;
      setLoading(true);
      try {
        const { data: chapData, error: chapErr } = await supabase
          .from("chapters")
          .select("*, subjects(id, name)")
          .eq("id", id)
          .single();

        if (isMounted && !chapErr && chapData) setChapter(chapData);

        const { data: nData, error: nErr } = await supabase
          .from("notes")
          .select("*")
          .eq("chapter_id", id)
          .eq("is_published", true)
          .order("sort_order", { ascending: true });

        if (isMounted && !nErr && nData) setNotes(nData);

        const { data: qData, error: qErr } = await supabase
          .from("questions")
          .select("*")
          .eq("chapter_id", id)
          .eq("is_active", true)
          .order("id", { ascending: true });

        if (isMounted && !qErr && qData) setQuestions(qData);
      } catch (err) {
        console.error("Chapter load error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadChapterData();

    return () => { isMounted = false; };
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
      <main className="max-w-md mx-auto px-4 pt-6 space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-900 rounded-lg" />
        <div className="h-28 bg-slate-900 rounded-3xl border border-slate-800" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-slate-900 rounded-2xl" />)}
        </div>
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

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <main className="max-w-md mx-auto px-3 space-y-3.5 pb-28 pt-2 font-sans select-none">

      {/* Back Link */}
      <Link 
        href={chapter.subjects ? `/subject/${chapter.subjects.id}` : "/"} 
        aria-label="वापस विषय सूची पर जाएँ"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> वापस विषय ({chapter.subjects?.name || "विषय"})
      </Link>

      {/* Hero Card */}
      <section aria-label="अध्याय विवरण" className="p-4 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/60 border border-indigo-500/20 shadow-xl space-y-1 relative overflow-hidden">
        <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
          {chapter.subjects?.name} • सम्पूर्ण मास्टरक्लास
        </div>
        <h1 className="text-sm sm:text-base font-black text-white leading-snug">{chapter.name}</h1>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          {chapter.description || "थ्योरी नोट्स, अभ्यास MCQs एवं विगत वर्ष PYQs"}
        </p>
      </section>

      {/* 4 Main Tabs (Visily Themed) */}
      <section aria-label="मुख्य सेशन्स" className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => { setActiveTab("notes"); setSelectedSet(1); }}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            activeTab === "notes" ? "bg-indigo-600/20 border-indigo-500" : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
          }`}
        >
          <BookOpen className={`w-4 h-4 mb-1 ${activeTab === "notes" ? "text-indigo-400" : "text-slate-400"}`} />
          <h2 className="text-xs font-bold text-white leading-tight">1. स्मार्ट नोट्स</h2>
          <p className="text-[10px] text-slate-400">{notes.length} नोट्स शीट</p>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("mcqs"); setSelectedSet(1); }}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            activeTab === "mcqs" ? "bg-emerald-600/20 border-emerald-500" : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 mb-1 ${activeTab === "mcqs" ? "text-emerald-400" : "text-slate-400"}`} />
          <h2 className="text-xs font-bold text-white leading-tight">2. अभ्यास MCQs</h2>
          <p className="text-[10px] text-emerald-400 font-bold">{mcqsList.length} प्रश्न ({Math.ceil(mcqsList.length / 20)} Sets)</p>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("pyqs"); setSelectedSet(1); }}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            activeTab === "pyqs" ? "bg-amber-600/20 border-amber-500" : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
          }`}
        >
          <Sparkles className={`w-4 h-4 mb-1 ${activeTab === "pyqs" ? "text-amber-400" : "text-slate-400"}`} />
          <h2 className="text-xs font-bold text-white leading-tight">3. विगत वर्ष PYQs</h2>
          <p className="text-[10px] text-amber-400 font-bold">{pyqsList.length} प्रश्न ({Math.ceil(pyqsList.length / 20)} Sets)</p>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("quiz"); resetQuiz(); }}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            activeTab === "quiz" ? "bg-purple-600/20 border-purple-500" : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
          }`}
        >
          <Trophy className={`w-4 h-4 mb-1 ${activeTab === "quiz" ? "text-purple-400" : "text-slate-400"}`} />
          <h2 className="text-xs font-bold text-white leading-tight">4. स्पीड टेस्ट</h2>
          <p className="text-[10px] text-purple-300 font-bold">20 Qs • 10 मिनट</p>
        </button>
      </section>

      {/* Set Selector Bar for MCQs, PYQs & Quiz */}
      {activeTab !== "notes" && totalSets > 1 && !quizStarted && (
        <section aria-label="सेट चयन" className="space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span className="flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> सेट चुनें:
            </span>
            <span className="text-[10px] text-indigo-400 font-semibold">Set {selectedSet} of {totalSets}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {Array.from({ length: totalSets }, (_, i) => i + 1).map((sNum) => (
              <button
                key={sNum}
                type="button"
                onClick={() => setSelectedSet(sNum)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedSet === sNum
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105"
                    : "bg-slate-900 text-slate-400 border border-slate-800"
                }`}
              >
                Set {sNum} (Q.{(sNum - 1) * 20 + 1}-{Math.min(sNum * 20, currentTabList.length)})
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 📖 TAB 1: SMART NOTES */}
      {activeTab === "notes" && (
        <section aria-label="स्मार्ट नोट्स बुकलेट">
          <PDFNotesSheet notes={notes} chapterName={chapter.name} />
        </section>
      )}

      {/* 🎯 TAB 2 & 3: MCQs & PYQs (Instant Solution Mode) */}
      {(activeTab === "mcqs" || activeTab === "pyqs") && (
        <section aria-label="अभ्यास प्रश्न सूची" className="space-y-3">
          {currentSetQuestions.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
              इस सेक्शन में प्रश्न जल्द जोड़े जा रहे हैं।
            </div>
          ) : (
            currentSetQuestions.map((q, idx) => {
              const userAns = selectedAnswers[q.id];
              const isAnswered = !!userAns;
              const isCorrect = userAns === q.answer;

              return (
                <article
                  key={q.id}
                  className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      प्रश्न #{startIndex + idx + 1}
                    </span>
                    {q.is_pyq && (
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {q.exam_tag || "RPSC PYQ"}
                      </span>
                    )}
                  </div>

                  <FormattedQuestionText text={q.question} />

                  {/* Options */}
                  <div className="space-y-2 pt-1">
                    {[
                      { key: "A", text: q.option_a },
                      { key: "B", text: q.option_b },
                      { key: "C", text: q.option_c },
                      { key: "D", text: q.option_d }
                    ].map((opt) => {
                      let btnStyle = "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700";

                      if (isAnswered) {
                        if (opt.key === q.answer) {
                          btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                        } else if (userAns === opt.key) {
                          btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300 line-through";
                        } else {
                          btnStyle = "bg-slate-950/30 border-slate-900 text-slate-500 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={opt.key}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(q.id, opt.key)}
                          className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${btnStyle}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                              {opt.key}
                            </span>
                            <span className="text-xs">{opt.text}</span>
                          </div>
                          {isAnswered && opt.key === q.answer && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          )}
                          {isAnswered && userAns === opt.key && opt.key !== q.answer && (
                            <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  {isAnswered && q.explanation && (
                    <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 space-y-1 animate-fadeIn">
                      <div className="font-bold flex items-center gap-1 text-indigo-300">
                        <HelpCircle className="w-3.5 h-3.5" /> विस्तृत व्याख्या:
                      </div>
                      <p className="text-[11px] leading-relaxed whitespace-pre-line text-slate-200">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>
      )}

      {/* 🏆 TAB 4: SPEED TEST MODE */}
      {activeTab === "quiz" && (
        <section aria-label="स्पीड टेस्ट एरेना">
          {!quizStarted ? (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">20-20 स्पीड टेस्ट (Set {selectedSet})</h3>
                <p className="text-xs text-slate-400 mt-1">20 प्रश्न • 10 मिनट समय • वास्तविक परीक्षा माहौल</p>
              </div>
              <button
                type="button"
                onClick={() => setQuizStarted(true)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> टेस्ट शुरू करें
              </button>
            </div>
          ) : !quizSubmitted ? (
            <div className="p-5 rounded-3xl bg-slate-900/95 border border-slate-800 space-y-4 shadow-2xl">
              {/* Timer Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-purple-400">
                  प्रश्न {currentQIndex + 1} / {speedTestQuestions.length}
                </span>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                  <Clock className="w-3.5 h-3.5" /> {formatTime(timeLeft)}
                </div>
              </div>

              {speedTestQuestions[currentQIndex] && (
                <>
                  <FormattedQuestionText text={speedTestQuestions[currentQIndex].question} />

                  <div className="space-y-2 pt-2">
                    {[
                      { key: "A", text: speedTestQuestions[currentQIndex].option_a },
                      { key: "B", text: speedTestQuestions[currentQIndex].option_b },
                      { key: "C", text: speedTestQuestions[currentQIndex].option_c },
                      { key: "D", text: speedTestQuestions[currentQIndex].option_d }
                    ].map((opt) => {
                      const isSelected = quizAnswers[speedTestQuestions[currentQIndex].id] === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => handleQuizAnswer(speedTestQuestions[currentQIndex].id, opt.key)}
                          className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                            isSelected
                              ? "bg-purple-600/20 border-purple-500 text-white font-bold"
                              : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isSelected ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400"
                          }`}>
                            {opt.key}
                          </span>
                          <span className="text-xs">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-3 gap-3">
                    <button
                      type="button"
                      disabled={currentQIndex === 0}
                      onClick={() => setCurrentQIndex((prev) => prev - 1)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs disabled:opacity-40 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> पिछला
                    </button>
                    {currentQIndex === speedTestQuestions.length - 1 ? (
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
                        onClick={() => setCurrentQIndex((prev) => prev + 1)}
                        className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1 cursor-pointer"
                      >
                        अगला <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Results Screen */
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl animate-fadeIn">
              <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">टेस्ट परिणाम</h3>
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

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetQuiz}
                  className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> री-टेस्ट
                </button>
                <button
                  type="button"
                  onClick={shareScoreOnWhatsApp}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" /> WhatsApp शेयर
                </button>
              </div>
            </div>
          )}
        </section>
      )}

    </main>
  );
}