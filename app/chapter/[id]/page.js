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

// Formatter component for Statement, Matching, and Code questions
function FormattedQuestionText({ text }) {
  if (!text) return null;

  // 1. Matching Questions (सूची-I / सूची-II)
  if (text.includes("सूची-I") || text.includes("सूची-1") || text.includes("सूची - I")) {
    const segments = text.split(/(?=सूची-I|सूची-II|सूची-1|सूची-2|सूची - I|सूची - II|कूट:)/gi);
    return (
      <div className="space-y-2">
        {segments.map((seg, idx) => {
          const trimmed = seg.trim();
          if (/^(सूची-I|सूची-1|सूची - I)/i.test(trimmed) || /^(सूची-II|सूची-2|सूची - II)/i.test(trimmed)) {
            return (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 text-indigo-200 text-xs font-medium leading-relaxed">
                {trimmed}
              </div>
            );
          }
          if (/^कूट:/i.test(trimmed)) {
            return (
              <div key={idx} className="text-amber-400 font-bold pt-1 text-xs">
                {trimmed}
              </div>
            );
          }
          return <div key={idx} className="text-white leading-relaxed">{trimmed}</div>;
        })}
      </div>
    );
  }

  // 2. Multi-Statement Questions (1. कथन... 2. कथन...)
  if (/(1\.\s+|कथन\s*1)/i.test(text) && /(2\.\s+|कथन\s*2)/i.test(text)) {
    const formatted = text
      .replace(/(\b\d+\.\s+)/g, "\n$1")
      .replace(/(उपर्युक्त|उपरोक्त|इनमें से)/g, "\n\n$1");
    return (
      <div className="text-white leading-relaxed whitespace-pre-line">
        {formatted.trim()}
      </div>
    );
  }

  // 3. Regular Questions
  return <div className="text-white leading-relaxed">{text}</div>;
}

export default function ChapterSingleViewPage() {
  const { id } = useParams();
  const [chapter, setChapter] = useState(null);
  const [activeTab, setActiveTab] = useState("mcqs"); // notes | mcqs | pyqs | quiz
  const [notes, setNotes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  // Set-wise Selection (20 Questions Per Set)
  const [selectedSet, setSelectedSet] = useState(1);

  // Speed Test States
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [showFullReview, setShowFullReview] = useState(false);

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
    setShowFullReview(false);
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

                  <div className="text-xs sm:text-sm font-bold leading-relaxed">
                    <span className="text-indigo-400 mr-1.5 font-black">Q{globalIndex + 1}.</span>
                    <FormattedQuestionText text={q.question} />
                  </div>

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
                          {isAttempted && opt.key === q.answer && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                          {isAttempted && opt.key === userAnswer && opt.key !== q.answer && <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
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
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-lg active:scale-95 transition"
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
                className="w-full py-3 rounded-xl bg-[#25D366] text-slate-950 font-black text-xs shadow flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <Share2 className="w-4 h-4" /> WhatsApp पर शेयर करें
              </button>
              <button
                onClick={resetQuiz}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition"
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

              <div className="text-xs sm:text-sm font-bold leading-relaxed">
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
                    className={`p-3 rounded-xl border text-left text-xs transition ${
                      quizAnswers[speedTestQuestions[currentQIndex].id] === opt.key 
                        ? "bg-indigo-600/30 border-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20" 
                        : "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700"
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
                    className="px-5 py-2 bg-emerald-600 rounded-xl text-xs font-bold text-white active:scale-95 transition shadow-md"
                  >
                    सबमिट करें ✓
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQIndex((prev) => prev + 1)}
                    className="px-5 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white active:scale-95 transition shadow-md"
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