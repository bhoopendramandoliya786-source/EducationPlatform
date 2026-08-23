"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { 
  ArrowLeft, BookOpen, CheckCircle2, XCircle, 
  Sparkles, HelpCircle, Trophy, Play, RotateCcw, Timer, Layers,
  ChevronLeft, ChevronRight
} from "lucide-react";

export default function ChapterSingleViewPage() {
  const { id } = useParams();
  const [chapter, setChapter] = useState(null);
  const [activeTab, setActiveTab] = useState("notes");
  const [notes, setNotes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  // Single Slide Flashcard State
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Speed Test State
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [showReview, setShowReview] = useState(false);

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
    setShowReview(false);
  };

  const nextFlashcard = () => {
    if (flashcardIndex < questions.length - 1) {
      setIsFlipped(false);
      setFlashcardIndex((prev) => prev + 1);
    }
  };

  const prevFlashcard = () => {
    if (flashcardIndex > 0) {
      setIsFlipped(false);
      setFlashcardIndex((prev) => prev - 1);
    }
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

  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;

  questions.forEach((q) => {
    const ans = quizAnswers[q.id];
    if (!ans) unattemptedCount++;
    else if (ans === q.answer) correctCount++;
    else wrongCount++;
  });

  const accuracyPercent = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const currentCard = questions[flashcardIndex];

  return (
    <div className="max-w-md mx-auto px-4 space-y-5 pb-24 pt-2">
      <Link 
        href={chapter.subjects ? `/subject/${chapter.subjects.id}` : "/"} 
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
          {chapter.description || "मानक पुस्तकों पर आधारित संपूर्ण प्रामाणिक थ्योरी नोट्स, अभ्यास MCQs एवं विगत वर्ष PYQs"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setActiveTab("notes")}
          className={`p-3.5 rounded-2xl border text-left space-y-1 transition active:scale-[0.98] ${activeTab === "notes" ? "bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/10" : "bg-slate-900/80 border-slate-800 hover:border-slate-700"}`}
        >
          <BookOpen className={`w-4 h-4 ${activeTab === "notes" ? "text-indigo-400" : "text-slate-400"}`} />
          <h3 className="text-xs font-bold text-white">1. स्मार्ट नोट्स</h3>
          <p className="text-[10px] text-slate-400">{notes.length} नोट्स उपलब्ध</p>
        </button>

        <button
          onClick={() => setActiveTab("mcqs")}
          className={`p-3.5 rounded-2xl border text-left space-y-1 transition active:scale-[0.98] ${activeTab === "mcqs" ? "bg-emerald-600/20 border-emerald-500 shadow-md shadow-emerald-500/10" : "bg-slate-900/80 border-slate-800 hover:border-slate-700"}`}
        >
          <CheckCircle2 className={`w-4 h-4 ${activeTab === "mcqs" ? "text-emerald-400" : "text-slate-400"}`} />
          <h3 className="text-xs font-bold text-white">2. अभ्यास MCQs</h3>
          <p className="text-[10px] text-emerald-400 font-bold">{mcqsList.length} प्रश्न उपलब्ध</p>
        </button>

        <button
          onClick={() => setActiveTab("pyqs")}
          className={`p-3.5 rounded-2xl border text-left space-y-1 transition active:scale-[0.98] ${activeTab === "pyqs" ? "bg-amber-600/20 border-amber-500 shadow-md shadow-amber-500/10" : "bg-slate-900/80 border-slate-800 hover:border-slate-700"}`}
        >
          <Sparkles className={`w-4 h-4 ${activeTab === "pyqs" ? "text-amber-400" : "text-slate-400"}`} />
          <h3 className="text-xs font-bold text-white">3. विगत वर्ष PYQs</h3>
          <p className="text-[10px] text-amber-400 font-bold">{pyqsList.length} प्रश्न उपलब्ध</p>
        </button>

        <button
          onClick={() => setActiveTab("flashcards")}
          className={`p-3.5 rounded-2xl border text-left space-y-1 transition active:scale-[0.98] ${activeTab === "flashcards" ? "bg-amber-500/20 border-amber-400 shadow-md shadow-amber-400/10" : "bg-slate-900/80 border-slate-800 hover:border-slate-700"}`}
        >
          <Layers className={`w-4 h-4 ${activeTab === "flashcards" ? "text-amber-400" : "text-slate-400"}`} />
          <h3 className="text-xs font-bold text-white">4. फ्लैशकार्ड्स</h3>
          <p className="text-[10px] text-amber-300 font-bold">{questions.length} कार्ड्स (Slide)</p>
        </button>

        <button
          onClick={() => setActiveTab("quiz")}
          className={`col-span-2 p-3.5 rounded-2xl border text-left flex items-center justify-between transition active:scale-[0.98] ${activeTab === "quiz" ? "bg-purple-600/20 border-purple-500 shadow-md shadow-purple-500/10" : "bg-slate-900/80 border-slate-800 hover:border-slate-700"}`}
        >
          <div className="flex items-center gap-2.5">
            <Trophy className={`w-5 h-5 ${activeTab === "quiz" ? "text-purple-400" : "text-slate-400"}`} />
            <div>
              <h3 className="text-xs font-bold text-white">5. स्पीड टेस्ट (Live Mock Test)</h3>
              <p className="text-[10px] text-purple-300 font-bold">10 मिनट • {questions.length} प्रश्न</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30 text-[10px] font-bold">शुरू करें</span>
        </button>
      </div>

      {/* TAB 1: Smart Notes */}
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

      {/* TAB 2 & 3: MCQs / PYQs List */}
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
                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${q.is_pyq ? "bg-amber-500/10 text-amber-300 border-amber-500/30" : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"}`}>
                      {q.is_pyq ? (`PYQ: ${q.source || "Official Exam"}${q.year ? ` (${q.year})` : ""}`) : "अभ्यास प्रश्न (MCQ)"}
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
                          className={`p-3.5 rounded-2xl border text-left text-xs flex items-center justify-between transition active:scale-[0.99] ${style}`}
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
                    <div className="p-4 rounded-2xl bg-[#082f49]/60 border border-sky-500/30 text-xs text-sky-100 space-y-1">
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

      {/* TAB 4: True Slide-by-Slide Flip Flashcards */}
      {activeTab === "flashcards" && (
        <div className="space-y-4 pt-1">
          {questions.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
              फ्लैशकार्ड्स उपलब्ध नहीं हैं।
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress Slider */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                <span>⚡ त्वरित रिवीजन फ्लैशकार्ड (Slide Mode)</span>
                <span className="text-indigo-400">{flashcardIndex + 1} / {questions.length}</span>
              </div>

              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${((flashcardIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`min-h-[280px] p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-2xl relative select-none ${
                  isFlipped 
                    ? "bg-gradient-to-br from-[#0c4a6e] to-[#082f49] border-sky-400/60 text-white" 
                    : "bg-slate-900/95 border-slate-800 text-slate-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${isFlipped ? "bg-sky-400/20 text-sky-200 border-sky-400/30" : "bg-amber-500/10 text-amber-300 border-amber-500/30"}`}>
                    {isFlipped ? "उत्तर (Back Side)" : "❓ प्रश्न (Front Side)"}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {isFlipped ? "टच करके प्रश्न देखें" : "उत्तर देखने के लिए टच करें ➔"}
                  </span>
                </div>

                <div className="py-4 my-auto">
                  {!isFlipped ? (
                    <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed whitespace-pre-line text-center">
                      {currentCard?.question}
                    </h3>
                  ) : (
                    <div className="space-y-3 text-center">
                      <div className="text-sm sm:text-base font-black text-emerald-300">
                        उत्तर: विकल्प ({currentCard?.answer}) - {currentCard?.[`option_${currentCard?.answer?.toLowerCase()}`]}
                      </div>
                      {currentCard?.explanation && (
                        <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line border-t border-sky-400/20 pt-2 text-left">
                          <strong>व्याख्या:</strong> {currentCard?.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-center text-slate-400 font-semibold">
                  {isFlipped ? "कार्ड पलट गया है" : "टैप करने पर उत्तर खुलेगा"}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  disabled={flashcardIndex === 0}
                  onClick={prevFlashcard}
                  className="flex-1 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold text-slate-300 disabled:opacity-30 flex items-center justify-center gap-1 hover:bg-slate-800 transition"
                >
                  <ChevronLeft className="w-4 h-4" /> पिछला कार्ड
                </button>

                <button
                  disabled={flashcardIndex === questions.length - 1}
                  onClick={nextFlashcard}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl text-xs font-bold text-white shadow-lg disabled:opacity-30 flex items-center justify-center gap-1 hover:opacity-95 transition"
                >
                  अगला कार्ड <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Speed Test Mode */}
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
                <h3 className="text-sm font-bold text-white">{chapter.name} - स्पीड टेस्ट</h3>
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
            <div className="space-y-4">
              {/* 4 Box Scorecard Hero */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-indigo-950/90 via-slate-900 to-purple-950/80 border border-indigo-500/30 text-center space-y-4 shadow-xl">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-300">टेस्ट परिणाम (Scorecard)</span>
                  <div className="text-4xl font-black text-emerald-400">{accuracyPercent}%</div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-base font-black text-emerald-400">{correctCount}</div>
                    <div className="text-[10px] text-slate-400">सही उत्तर</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-base font-black text-rose-400">{wrongCount}</div>
                    <div className="text-[10px] text-slate-400">गलत उत्तर</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-base font-black text-slate-400">{unattemptedCount}</div>
                    <div className="text-[10px] text-slate-400">छोड़े गए</div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={resetQuiz}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <RotateCcw className="w-4 h-4" /> पुन: टेस्ट दें
                  </button>
                  <button
                    onClick={() => setShowReview(!showReview)}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    {showReview ? "समीक्षा छुपाएं" : "उत्तर देखें ➔"}
                  </button>
                </div>
              </div>

              {/* Review Section */}
              {showReview && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="text-xs font-bold text-slate-400 px-1">
                    📋 प्रश्नों की संपूर्ण समीक्षा एवं व्याख्या:
                  </div>

                  {questions.map((q, idx) => {
                    const userAns = quizAnswers[q.id];
                    const isCorrect = userAns === q.answer;

                    return (
                      <div key={q.id} className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300">प्रश्न {idx + 1}</span>
                          {isCorrect ? (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> सही
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> गलत (आपका: {userAns || "नहीं दिया"})
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-white leading-relaxed whitespace-pre-line">
                          {q.question}
                        </h4>

                        <div className="p-3.5 rounded-2xl bg-[#082f49]/60 border border-sky-500/30 text-xs text-sky-100 space-y-1">
                          <div className="font-extrabold text-cyan-300 flex items-center gap-1 text-[11px]">
                            <HelpCircle className="w-3.5 h-3.5" /> सही उत्तर: विकल्प ({q.answer}) - {q[`option_${q.answer?.toLowerCase()}`]}
                          </div>
                          {q.explanation && (
                            <p className="leading-relaxed whitespace-pre-line text-slate-200 pt-1 text-xs">
                              {q.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                    className={`p-3.5 rounded-2xl border text-left text-xs transition ${quizAnswers[questions[currentQIndex].id] === opt.key ? "bg-indigo-600/30 border-indigo-500 text-white font-bold" : "bg-slate-950/80 border-slate-800 text-slate-300"}`}
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