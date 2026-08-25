"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { 
  ArrowLeft, BookOpen, CheckCircle2, XCircle, 
  Sparkles, HelpCircle, Trophy, Play, RotateCcw, Timer,
  Share2, Layers
} from "lucide-react";

// Pro Exam Question Formatter (Matching Table, Assertion/Reason, Statements)
function FormattedQuestionText({ text }) {
  if (!text) return null;

  // 1. सुमेलित प्रश्न (सूची-I और सूची-II)
  if (text.includes("सूची-I") || text.includes("सूची - I") || text.includes("सूची-1")) {
    // Regex parsing for List I & List II pairs
    const matchA = text.match(/\(A\)\s*([^()]+)\s*\(i\)\s*([^()]+)/i);
    const matchB = text.match(/\(B\)\s*([^()]+)\s*\(ii\)\s*([^()]+)/i);
    const matchC = text.match(/\(C\)\s*([^()]+)\s*\(iii\)\s*([^()]+)/i);
    const matchD = text.match(/\(D\)\s*([^()]+)\s*\(iv\)\s*([^()]+)/i);

    const titlePart = text.split(/सूची-I|सूची - I|सूची-1/i)[0] || "निम्नलिखित का सही सुमेलन कीजिए:";

    if (matchA && matchB) {
      const rows = [
        { label1: "(A) " + matchA[1].trim(), label2: "(i) " + matchA[2].trim() },
        { label1: "(B) " + matchB[1].trim(), label2: "(ii) " + matchB[2].trim() },
        matchC ? { label1: "(C) " + matchC[1].trim(), label2: "(iii) " + matchC[2].trim() } : null,
        matchD ? { label1: "(D) " + matchD[1].trim(), label2: "(iv) " + matchD[2].trim() } : null,
      ].filter(Boolean);

      return (
        <div className="space-y-3">
          <p className="text-white text-xs sm:text-sm font-bold leading-relaxed">{titlePart.trim()}</p>

          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/90 shadow-md">
            <div className="grid grid-cols-2 bg-indigo-950/50 border-b border-slate-800 px-3 py-2 text-[11px] font-black text-indigo-300">
              <span>सूची - I</span>
              <span>सूची - II</span>
            </div>
            <div className="divide-y divide-slate-800/60">
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-2 px-3 py-2 text-xs text-slate-200">
                  <span className="font-medium pr-2 text-slate-300">{r.label1}</span>
                  <span className="font-semibold text-indigo-300 border-l border-slate-800/80 pl-3">{r.label2}</span>
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
  if (text.includes("कथन (A)") || text.includes("कथन(A)")) {
    const parts = text.split(/(?=कारण\s*\(R\)|सही\s*विकल्प|उपर्युक्त)/gi);
    return (
      <div className="space-y-2 text-xs sm:text-sm">
        {parts.map((p, idx) => {
          const str = p.trim();
          if (str.startsWith("कथन")) {
            return (
              <div key={idx} className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 font-medium">
                <strong className="text-indigo-400 block mb-0.5 font-bold">📌 {str.slice(0, 9)}</strong>
                {str.replace(/^कथन\s*\([A-Z]\):?\s*/i, "")}
              </div>
            );
          }
          if (str.startsWith("कारण")) {
            return (
              <div key={idx} className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-200 font-medium">
                <strong className="text-purple-400 block mb-0.5 font-bold">💡 {str.slice(0, 9)}</strong>
                {str.replace(/^कारण\s*\([A-Z]\):?\s*/i, "")}
              </div>
            );
          }
          return <p key={idx} className="text-slate-300 font-bold pt-1">{str}</p>;
        })}
      </div>
    );
  }

  // 3. बहु-कथन प्रश्न (1. कथन... 2. कथन...)
  if (text.includes("1.") && text.includes("2.")) {
    const intro = text.split(/1\./)[0];
    const rest = text.substring(intro.length);
    const statements = rest.split(/(?=\d+\.)/g);
    const lastPart = statements[statements.length - 1];
    let conclusion = "";

    if (lastPart && (lastPart.includes("उपर्युक्त") || lastPart.includes("उपरोक्त") || lastPart.includes("इनमें से"))) {
      const splitConc = lastPart.split(/(?=उपर्युक्त|उपरोक्त|इनमें से)/);
      statements[statements.length - 1] = splitConc[0];
      conclusion = splitConc[1];
    }

    return (
      <div className="space-y-2.5">
        {intro.trim() && <p className="text-white text-xs sm:text-sm font-bold">{intro.trim()}</p>}
        <div className="space-y-1.5">
          {statements.map((s, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 flex gap-2">
              <span className="text-indigo-400 font-bold">{s.trim().substring(0, 2)}</span>
              <span className="leading-relaxed">{s.trim().substring(2)}</span>
            </div>
          ))}
        </div>
        {conclusion && <p className="text-amber-400 text-xs font-bold pt-1">{conclusion.trim()}</p>}
      </div>
    );
  }

  // साधारण प्रश्न
  return <p className="text-white text-xs sm:text-sm font-bold leading-relaxed">{text}</p>;
}

export default function ChapterSingleViewPage() {
  const { id } = useParams();
  const [chapter, setChapter] = useState(null);
  const [activeTab, setActiveTab] = useState("mcqs");
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
        const { data: chapData } = await supabase
          .from("chapters")
          .select("*, subjects(id, name)")
          .eq("id", id)
          .single();
        setChapter(chapData);

        const { data: topList } = await supabase
          .from("topics")
          .select("id")
          .eq("chapter_id", id);

        const topicIds = (topList || []).map((t) => t.id);

        if (topicIds.length > 0) {
          const { data: nData } = await supabase
            .from("notes")
            .select("*")
            .in("topic_id", topicIds)
            .eq("is_published", true)
            .order("id", { ascending: true });
          if (nData) setNotes(nData || []);

          const { data: qData } = await supabase
            .from("questions")
            .select("*")
            .in("topic_id", topicIds)
            .eq("is_active", true)
            .order("id", { ascending: true });
          if (qData) setQuestions(qData || []);
        } else {
          const { data: nData } = await supabase
            .from("notes")
            .select("*")
            .eq("chapter_id", id)
            .eq("is_published", true);
          if (nData) setNotes(nData || []);

          const { data: qData } = await supabase
            .from("questions")
            .select("*")
            .eq("chapter_id", id)
            .eq("is_active", true);
          if (qData) setQuestions(qData || []);
        }
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
        <div className="h-28 bg-slate-900 rounded-3xl border border-slate-800" />
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
    <div className="max-w-md mx-auto px-4 space-y-4 pb-28 pt-2 font-sans select-none">

      {/* Back Link */}
      <Link 
        href={chapter.subjects ? `/subject/${chapter.subjects.id}` : "/"} 
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> वापस विषय ({chapter.subjects?.name || "विषय"})
      </Link>

      {/* Hero Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/50 border border-slate-800 shadow-xl space-y-1.5 relative overflow-hidden">
        <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
          {chapter.subjects?.name} • सम्पूर्ण अध्याय
        </div>
        <h1 className="text-lg font-black text-white leading-snug">{chapter.name}</h1>
        <p className="text-xs text-slate-300 leading-relaxed">
          {chapter.description || "थ्योरी नोट्स, अभ्यास MCQs एवं विगत वर्ष PYQs"}
        </p>
      </div>

      {/* 4 Main Tabs */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => { setActiveTab("notes"); setSelectedSet(1); }}
          className={`p-3.5 rounded-2xl border text-left space-y-1 transition active:scale-[0.98] ${
            activeTab === "notes" ? "bg-indigo-600/20 border-indigo-500 shadow-md" : "bg-slate-900/80 border-slate-800"
          }`}
        >
          <BookOpen className={`w-4 h-4 ${activeTab === "notes" ? "text-indigo-400" : "text-slate-400"}`} />
          <h3 className="text-xs font-bold text-white">1. स्मार्ट नोट्स</h3>
          <p className="text-[10px] text-slate-400">{notes.length} नोट्स</p>
        </button>

        <button
          onClick={() => { setActiveTab("mcqs"); setSelectedSet(1); }}
          className={`p-3.5 rounded-2xl border text-left space-y-1 transition active:scale-[0.98] ${
            activeTab === "mcqs" ? "bg-emerald-600/20 border-emerald-500 shadow-md" : "bg-slate-900/80 border-slate-800"
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${activeTab === "mcqs" ? "text-emerald-400" : "text-slate-400"}`} />
          <h3 className="text-xs font-bold text-white">2. अभ्यास MCQs</h3>
          <p className="text-[10px] text-emerald-400 font-bold">{mcqsList.length} प्रश्न ({Math.ceil(mcqsList.length / 20)} Sets)</p>
        </button>

        <button
          onClick={() => { setActiveTab("pyqs"); setSelectedSet(1); }}
          className={`p-3.5 rounded-2xl border text-left space-y-1 transition active:scale-[0.98] ${
            activeTab === "pyqs" ? "bg-amber-600/20 border-amber-500 shadow-md" : "bg-slate-900/80 border-slate-800"
          }`}
        >
          <Sparkles className={`w-4 h-4 ${activeTab === "pyqs" ? "text-amber-400" : "text-slate-400"}`} />
          <h3 className="text-xs font-bold text-white">3. विगत वर्ष PYQs</h3>
          <p className="text-[10px] text-amber-400 font-bold">{pyqsList.length} प्रश्न ({Math.ceil(pyqsList.length / 20)} Sets)</p>
        </button>

        <button
          onClick={() => { setActiveTab("quiz"); resetQuiz(); }}
          className={`p-3.5 rounded-2xl border text-left space-y-1 transition active:scale-[0.98] ${
            activeTab === "quiz" ? "bg-purple-600/20 border-purple-500 shadow-md" : "bg-slate-900/80 border-slate-800"
          }`}
        >
          <Trophy className={`w-4 h-4 ${activeTab === "quiz" ? "text-purple-400" : "text-slate-400"}`} />
          <h3 className="text-xs font-bold text-white">4. स्पीड टेस्ट</h3>
          <p className="text-[10px] text-purple-300 font-bold">20 Qs • 10 मिनट</p>
        </button>
      </div>

      {/* Set Selector Bar */}
      {activeTab !== "notes" && totalSets > 1 && !quizStarted && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> प्रश्न सेट चुनें (20 Qs / Set):
            </span>
            <span className="text-[10px] text-indigo-400">Set {selectedSet} of {totalSets}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {Array.from({ length: totalSets }, (_, i) => i + 1).map((sNum) => (
              <button
                key={sNum}
                onClick={() => setSelectedSet(sNum)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedSet === sNum
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700"
                }`}
              >
                Set {sNum} (Q.{ (sNum - 1) * 20 + 1 } - { Math.min(sNum * 20, currentTabList.length) })
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: Smart Notes */}
      {activeTab === "notes" && (
        <div className="space-y-3 pt-1">
          {notes.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
              इस अध्याय में नोट्स जल्द जोड़े जा रहे हैं।
            </div>
          ) : (
            notes.map((n) => (
              <div key={n.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-md">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  📖 थ्योरी कैप्सूल
                </span>
                <h3 className="text-sm font-bold text-white leading-snug">{n.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{n.content}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2 & 3: MCQs / PYQs Set View */}
      {(activeTab === "mcqs" || activeTab === "pyqs") && (
        <div className="space-y-3 pt-1">
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
                <div key={q.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                      {q.is_pyq ? `PYQ: ${q.source || "Exam"} ${q.year ? `(${q.year})` : ""}` : "अभ्यास प्रश्न (MCQ)"}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">{q.difficulty || "Medium"}</span>
                  </div>

                  {/* Formatted Question Output */}
                  <div className="space-y-1">
                    <span className="text-indigo-400 font-black text-xs block mb-1">Q{globalIndex + 1}.</span>
                    <FormattedQuestionText text={q.question} />
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 gap-2 pt-1">
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
                          className={`p-3 rounded-xl border text-left text-xs flex items-center justify-between transition ${style}`}
                        >
                          <span><strong>{opt.key}.</strong> {opt.text}</span>
                          {isAttempted && opt.key === q.answer && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {isAttempted && opt.key === userAnswer && opt.key !== q.answer && <XCircle className="w-4 h-4 text-rose-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {isAttempted && q.explanation && (
                    <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200 space-y-1">
                      <div className="font-bold text-indigo-300 flex items-center gap-1 text-[11px]">
                        <HelpCircle className="w-3.5 h-3.5" /> विस्तृत व्याख्या:
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
        <div className="space-y-4 pt-1">
          {speedTestQuestions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
              प्रश्न जोड़े जा रहे हैं।
            </div>
          ) : !quizStarted ? (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{chapter.name} - Set {selectedSet}</h3>
                <p className="text-xs text-slate-400 mt-1">कुल प्रश्न: {speedTestQuestions.length} • समय सीमा: 10 मिनट</p>
              </div>
              <button
                onClick={() => setQuizStarted(true)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-lg"
              >
                <Play className="w-4 h-4 inline-block mr-1" /> Set {selectedSet} टेस्ट शुरू करें
              </button>
            </div>
          ) : quizSubmitted ? (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-4 shadow-xl">
              <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
              <div>
                <h3 className="text-xs font-bold text-slate-400">Set {selectedSet} स्कोरकार्ड</h3>
                <div className="text-4xl font-black text-emerald-400 pt-1">{accuracyPercent}%</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="text-base font-black text-emerald-400">{correctCount}</div>
                  <div className="text-[10px] text-slate-400">सही</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="text-base font-black text-rose-400">{wrongCount}</div>
                  <div className="text-[10px] text-slate-400">गलत</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="text-base font-black text-slate-400">{unattemptedCount}</div>
                  <div className="text-[10px] text-slate-400">छोड़े गए</div>
                </div>
              </div>
              <button
                onClick={shareScoreOnWhatsApp}
                className="w-full py-3 rounded-xl bg-[#25D366] text-slate-950 font-black text-xs shadow flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-4 h-4" /> WhatsApp पर शेयर करें
              </button>
              <button
                onClick={resetQuiz}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> पुनः टेस्ट दें
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Set {selectedSet}: प्रश्न {currentQIndex + 1} / {speedTestQuestions.length}</span>
                <span className="text-amber-400 flex items-center gap-1">
                  <Timer className="w-4 h-4" /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>

              <div className="space-y-1">
                <FormattedQuestionText text={speedTestQuestions[currentQIndex].question} />
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {[
                  { key: "A", text: speedTestQuestions[currentQIndex].option_a },
                  { key: "B", text: speedTestQuestions[currentQIndex].option_b },
                  { key: "C", text: speedTestQuestions[currentQIndex].option_c },
                  { key: "D", text: speedTestQuestions[currentQIndex].option_d }
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleQuizAnswer(speedTestQuestions[currentQIndex].id, opt.key)}
                    className={`p-3 rounded-xl border text-left text-xs ${
                      quizAnswers[speedTestQuestions[currentQIndex].id] === opt.key 
                        ? "bg-indigo-600/30 border-indigo-500 text-white font-bold" 
                        : "bg-slate-950/80 border-slate-800 text-slate-300"
                    }`}
                  >
                    <strong>{opt.key}.</strong> {opt.text}
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2">
                <button
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((prev) => prev - 1)}
                  className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold text-slate-300 disabled:opacity-30"
                >
                  ← पिछला
                </button>
                {currentQIndex === speedTestQuestions.length - 1 ? (
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    className="px-5 py-2 bg-emerald-600 rounded-xl text-xs font-bold text-white"
                  >
                    सबमिट करें ✓
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQIndex((prev) => prev + 1)}
                    className="px-5 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white"
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