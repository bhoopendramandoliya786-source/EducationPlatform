"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { 
  ArrowLeft, BookOpen, CheckCircle2, XCircle, 
  Sparkles, HelpCircle, Trophy, Play, RotateCcw, Timer
} from "lucide-react";

export default function ChapterSingleViewPage() {
  const { id } = useParams();
  const [chapter, setChapter] = useState(null);
  const [activeTab, setActiveTab] = useState("notes");
  const [notes, setNotes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  // In-Chapter Speed Test State
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  const supabase = createClient();

  useEffect(() => {
    async function loadChapterData() {
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
            .order("sort_order", { ascending: true })
            .order("id", { ascending: true });
          if (nData) setNotes(nData);

          const { data: qData } = await supabase
            .from("questions")
            .select("*")
            .in("topic_id", topicIds)
            .eq("is_active", true)
            .order("id", { ascending: true });
          if (qData) setQuestions(qData);
        }
      } catch (err) {
        console.error("Chapter direct load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadChapterData();
  }, [id]);

  // Speed test timer
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

  // Speed test score calculations
  const totalScore = questions.reduce((acc, q) => {
    return quizAnswers[q.id] === q.answer ? acc + 1 : acc;
  }, 0);

  return (
    <div className="max-w-md mx-auto px-4 space-y-5 pb-24 pt-2">
      <Link 
        href={chapter.subjects ? ("/subject/" + chapter.subjects.id) : "/"} 
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
      >
        <ArrowLeft className="w-4 h-4" /> वापस विषय ({chapter.subjects?.name || "विषय"})
      </Link>

      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/60 border border-indigo-500/20 space-y-1.5 shadow-xl">
        <div className="text-[10px] font-bold text-indigo-400">
          {chapter.subjects?.name} • संपूर्ण अध्याय
        </div>
        <h1 className="text-lg font-black text-white">{chapter.name}</h1>
        <p className="text-xs text-slate-300 leading-relaxed">
          {chapter.description || "डॉ. वासुदेव नंदन प्रसाद व मानक पुस्तकों पर आधारित संपूर्ण प्रामाणिक थ्योरी नोट्स, अभ्यास MCQs एवं विगत वर्ष PYQs"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setActiveTab("notes")}
          className={"p-4 rounded-2xl border text-left space-y-1 transition active:scale-[0.98] " + (activeTab === "notes" ? "bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/10" : "bg-slate-900/80 border-slate-800 hover:border-slate-700")}
        >
          <BookOpen className={"w-5 h-5 " + (activeTab === "notes" ? "text-indigo-400" : "text-slate-400")} />
          <h3 className="text-xs font-bold text-white">1. स्मार्ट नोट्स</h3>
          <p className="text-[10px] text-slate-400">{notes.length} नोट्स उपलब्ध</p>
        </button>

        <button
          onClick={() => setActiveTab("mcqs")}
          className={"p-4 rounded-2xl border text-left space-y-1 transition active:scale-[0.98] " + (activeTab === "mcqs" ? "bg-emerald-600/20 border-emerald-500 shadow-md shadow-emerald-500/10" : "bg-slate-900/80 border-slate-800 hover:border-slate-700")}
        >
          <CheckCircle2 className={"w-5 h-5 " + (activeTab === "mcqs" ? "text-emerald-400" : "text-slate-400")} />
          <h3 className="text-xs font-bold text-white">2. अभ्यास MCQs</h3>
          <p className="text-[10px] text-emerald-400 font-bold">{mcqsList.length} प्रश्न उपलब्ध</p>
        </button>

        <button
          onClick={() => setActiveTab("pyqs")}
          className={"p-4 rounded-2xl border text-left space-y-1 transition active:scale-[0.98] " + (activeTab === "pyqs" ? "bg-amber-600/20 border-amber-500 shadow-md shadow-amber-500/10" : "bg-slate-900/80 border-slate-800 hover:border-slate-700")}
        >
          <Sparkles className={"w-5 h-5 " + (activeTab === "pyqs" ? "text-amber-400" : "text-slate-400")} />
          <h3 className="text-xs font-bold text-white">3. विगत वर्ष PYQs</h3>
          <p className="text-[10px] text-amber-400 font-bold">{pyqsList.length} प्रश्न उपलब्ध</p>
        </button>

        <button
          onClick={() => setActiveTab("quiz")}
          className={"p-4 rounded-2xl border text-left space-y-1 transition active:scale-[0.98] " + (activeTab === "quiz" ? "bg-purple-600/20 border-purple-500 shadow-md shadow-purple-500/10" : "bg-slate-900/80 border-slate-800 hover:border-slate-700")}
        >
          <Trophy className={"w-5 h-5 " + (activeTab === "quiz" ? "text-purple-400" : "text-slate-400")} />
          <h3 className="text-xs font-bold text-white">4. स्पीड टेस्ट</h3>
          <p className="text-[10px] text-purple-300 font-bold">{questions.length} प्रश्नों का लाइव टेस्ट</p>
        </button>
      </div>

      {activeTab === "notes" && (
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span>अध्याय संपूर्ण थ्योरी एवं नियम ({notes.length})</span>
          </div>

          {notes.map((n) => (
            <div key={n.id} className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                📖 विस्तृत थ्योरी
              </span>
              <h3 className="text-sm font-bold text-white leading-snug">{n.title}</h3>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                {n.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {(activeTab === "mcqs" || activeTab === "pyqs") && (
        <div className="space-y-4 pt-1">
          {(() => {
            const currentList = activeTab === "mcqs" ? mcqsList : pyqsList;
            if (currentList.length === 0) {
              return (
                <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
                  {activeTab === "mcqs" ? "अभ्यास MCQs जोड़े जा रहे हैं।" : "विगत वर्षों के प्रश्न जोड़े जा रहे हैं।"}
                </div>
              );
            }

            return currentList.map((q, idx) => {
              const userAnswer = selectedAnswers[q.id];
              const isAttempted = Boolean(userAnswer);

              return (
                <div key={q.id} className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className={"text-[9px] font-bold px-2.5 py-0.5 rounded-full border " + (q.is_pyq ? "bg-amber-500/10 text-amber-300 border-amber-500/30" : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30")}>
                      {q.is_pyq ? ("PYQ: " + (q.source || "Official Exam") + (q.year ? " (" + q.year + ")" : "")) : "अभ्यास प्रश्न (MCQ)"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{q.difficulty || "Medium"}</span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-white leading-relaxed whitespace-pre-line">
                    <span className="text-indigo-400 mr-1 font-black">Q{idx + 1}.</span>
                    {q.question}
                  </h3>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {[
                      { key: "A", text: q.option_a },
                      { key: "B", text: q.option_b },
                      { key: "C", text: q.option_c },
                      { key: "D", text: q.option_d }
                    ].map((opt) => {
                      let style = "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700";
                      if (isAttempted) {
                        if (opt.key === q.answer) {
                          style = "bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold";
                        } else if (opt.key === userAnswer) {
                          style = "bg-rose-500/20 border-rose-500 text-rose-200 font-bold";
                        } else {
                          style = "bg-slate-950/40 border-slate-900 text-slate-600 opacity-50";
                        }
                      }

                      return (
                        <button
                          key={opt.key}
                          disabled={isAttempted}
                          onClick={() => handleSelectOption(q.id, opt.key)}
                          className={"p-3.5 rounded-2xl border text-left text-xs flex items-center justify-between transition active:scale-[0.99] " + style}
                        >
                          <span className="leading-snug"><strong>{opt.key}.</strong> {opt.text}</span>
                          {isAttempted && opt.key === q.answer && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-2" />
                          )}
                          {isAttempted && opt.key === userAnswer && opt.key !== q.answer && (
                            <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isAttempted && q.explanation && (
                    <div className="p-4 rounded-2xl bg-[#082f49]/60 border border-sky-500/30 text-xs text-sky-100 space-y-1 animate-in fade-in duration-200">
                      <div className="font-bold text-cyan-300 flex items-center gap-1.5 text-[11px]">
                        <HelpCircle className="w-3.5 h-3.5" /> विस्तृत व्याख्या:
                      </div>
                      <p className="leading-relaxed whitespace-pre-line text-slate-100">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* TAB 4: In-Chapter Dedicated Speed Test */}
      {activeTab === "quiz" && (
        <div className="space-y-4 pt-1">
          {questions.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
              इस अध्याय में अभी प्रश्न जोड़े जा रहे हैं।
            </div>
          ) : !quizStarted ? (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">{chapter.name} - लाइव टेस्ट</h3>
                <p className="text-xs text-slate-400">कुल प्रश्न: {questions.length} • समय सीमा: 10 मिनट</p>
              </div>
              <button
                onClick={() => setQuizStarted(true)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold shadow-lg transition flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-current" /> अभी टेस्ट शुरू करें
              </button>
            </div>
          ) : quizSubmitted ? (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-4 shadow-xl">
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                परिणाम (Test Result)
              </span>
              <div className="text-3xl font-black text-white">
                {totalScore} / {questions.length}
              </div>
              <p className="text-xs text-slate-300">
                सटीकता: {Math.round((totalScore / questions.length) * 100)}%
              </p>
              <button
                onClick={resetQuiz}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> पुनः टेस्ट दें
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>प्रश्न {currentQIndex + 1} / {questions.length}</span>
                <span className="text-amber-400 flex items-center gap-1">
                  <Timer className="w-4 h-4" /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>

              <h3 className="text-xs sm:text-sm font-bold text-white leading-relaxed whitespace-pre-line">
                {questions[currentQIndex].question}
              </h3>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {[
                  { key: "A", text: questions[currentQIndex].option_a },
                  { key: "B", text: questions[currentQIndex].option_b },
                  { key: "C", text: questions[currentQIndex].option_c },
                  { key: "D", text: questions[currentQIndex].option_d }
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleQuizAnswer(questions[currentQIndex].id, opt.key)}
                    className={"p-3.5 rounded-2xl border text-left text-xs transition " + (quizAnswers[questions[currentQIndex].id] === opt.key ? "bg-indigo-600/30 border-indigo-500 text-white font-bold" : "bg-slate-950/80 border-slate-800 text-slate-300")}
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
                  पिछला
                </button>
                {currentQIndex === questions.length - 1 ? (
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white shadow-md"
                  >
                    सबमिट करें
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQIndex((prev) => prev + 1)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white shadow-md"
                  >
                    अगला
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
