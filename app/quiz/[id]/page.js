"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { 
  ArrowLeft, Clock, CheckCircle2, XCircle, Trophy, 
  RotateCcw, Sparkles, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Check, X, Maximize2 
} from "lucide-react";

export default function QuizRunnerPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [currentFcIndex, setCurrentFcIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadQuizData() {
      setLoading(true);
      try {
        const { data: qz } = await supabase.from("quizzes").select("*").eq("id", id).single();
        setQuiz(qz);
        if (qz?.duration_minutes) setTimeLeft(qz.duration_minutes * 60);

        const { data: qMaps } = await supabase
          .from("quiz_questions")
          .select("question_order, questions(*)")
          .eq("quiz_id", id)
          .order("question_order", { ascending: true });

        let loadedQs = [];
        if (qMaps && qMaps.length > 0) {
          loadedQs = qMaps.map((m) => m.questions).filter(Boolean);
        } else if (qz?.topic_id) {
          const { data: topicQs } = await supabase.from("questions").select("*").eq("topic_id", qz.topic_id);
          if (topicQs) loadedQs = topicQs;
        }
        setQuestions(loadedQs);

        if (qz?.topic_id) {
          const { data: fcData } = await supabase
            .from("flashcards")
            .select("*")
            .eq("topic_id", qz.topic_id)
            .eq("is_active", true);
          if (fcData && fcData.length > 0) {
            setFlashcards(fcData);
          }
        }
      } catch (err) {
        console.error("Quiz Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuizData();
  }, [id]);

  useEffect(() => {
    if (isSubmitted || timeLeft <= 0 || loading) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, loading]);

  const handleSelectOption = (optKey) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optKey }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) correct++;
    });
    return {
      correct,
      wrong: Object.keys(selectedAnswers).length - correct,
      unattempted: questions.length - Object.keys(selectedAnswers).length,
      total: questions.length,
      percentage: questions.length ? Math.round((correct / questions.length) * 100) : 0
    };
  };

  const getOptionText = (q, key) => {
    if (!q) return "";
    if (key === "A") return q.option_a;
    if (key === "B") return q.option_b;
    if (key === "C") return q.option_c;
    if (key === "D") return q.option_d;
    return "";
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 space-y-4 animate-pulse">
        <div className="h-10 bg-slate-900 rounded-2xl border border-slate-800" />
        <div className="h-64 bg-slate-900 rounded-3xl border border-slate-800" />
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 pt-8 text-center space-y-3">
        <p className="text-xs text-rose-400">इस टेस्ट में अभी प्रश्न उपलब्ध नहीं हैं।</p>
        <Link href="/quiz" className="inline-block text-xs font-bold px-4 py-2 rounded-xl bg-slate-900 text-white border border-slate-800">
          क्विज़ हब पर वापस जाएँ
        </Link>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const scoreResult = isSubmitted ? calculateScore() : null;

  const activeFlashcards = flashcards.length > 0 
    ? flashcards.map(f => ({
        id: f.id,
        front: f.front,
        answerText: f.back?.split("\n")[0] || f.back,
        explanation: f.back?.includes("\n") ? f.back.split("\n").slice(1).join(" ") : ""
      }))
    : questions.map((q) => ({
        id: q.id,
        front: q.question,
        answerText: getOptionText(q, q.answer),
        explanation: q.explanation || ""
      }));

  const currentCard = activeFlashcards[currentFcIndex] || {};
  const progressPercent = Math.round(((currentFcIndex + 1) / activeFlashcards.length) * 100);

  return (
    <div className="max-w-md mx-auto px-4 space-y-5 pb-28 pt-1 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link href="/quiz" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="w-4 h-4" /> टेस्ट छोड़ें
        </Link>
        {!isSubmitted && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</span>
          </div>
        )}
      </div>

      {!isSubmitted ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>प्रश्न {currentIndex + 1} / {questions.length}</span>
            <span>हल किए: {Object.keys(selectedAnswers).length}</span>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
              {currentIndex + 1}. {currentQ.question}
            </h3>

            <div className="grid gap-2.5">
              {[
                { key: "A", text: currentQ.option_a },
                { key: "B", text: currentQ.option_b },
                { key: "C", text: currentQ.option_c },
                { key: "D", text: currentQ.option_d }
              ].map((opt) => {
                const isSelected = selectedAnswers[currentIndex] === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleSelectOption(opt.key)}
                    className={`p-4 rounded-2xl border text-left text-xs sm:text-sm flex items-center justify-between transition active:scale-[0.99] ${
                      isSelected
                        ? "bg-indigo-600/20 border-indigo-500 text-white font-bold"
                        : "bg-slate-950/80 border-slate-800/80 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <span><strong>{opt.key}.</strong> {opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 disabled:opacity-40"
            >
              ← पिछला
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={() => {
                  setIsSubmitted(true);
                  setIsFlipped(false);
                  setCurrentFcIndex(0);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                टेस्ट सबमिट करें ✓
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-md active:scale-95"
              >
                अगला →
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results + Exact Clean Gemini/Quizlet Flashcard UI */
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/60 border border-indigo-500/20 text-center space-y-2.5 shadow-xl">
            <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
            <h2 className="text-base font-black text-white">टेस्ट परिणाम (Scorecard)</h2>
            <div className="text-2xl font-black text-emerald-400">{scoreResult.percentage}%</div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                <div className="text-xs font-bold text-emerald-400">{scoreResult.correct}</div>
                <div className="text-[10px] text-slate-400">सही उत्तर</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                <div className="text-xs font-bold text-rose-400">{scoreResult.wrong}</div>
                <div className="text-[10px] text-slate-400">गलत उत्तर</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                <div className="text-xs font-bold text-amber-400">{scoreResult.unattempted}</div>
                <div className="text-[10px] text-slate-400">छोड़े गए</div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  setIsSubmitted(false);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setCurrentFcIndex(0);
                  if (quiz?.duration_minutes) setTimeLeft(quiz.duration_minutes * 60);
                }}
                className="flex-1 py-2.5 rounded-2xl bg-indigo-600 text-xs font-bold text-white shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> पुनः टेस्ट दें
              </button>
              <button
                onClick={() => setShowReview(!showReview)}
                className="px-3 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1"
              >
                {showReview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                उत्तर देखें
              </button>
            </div>
          </div>

          {/* Flashcard Header */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px]">
                  ✕ {unknownCount}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
                  ✓ {knownCount}
                </span>
              </div>
              <span>{currentFcIndex + 1} / {activeFlashcards.length}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Card Component */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`w-full min-h-[380px] rounded-3xl p-7 cursor-pointer flex flex-col justify-between transition-all duration-300 shadow-2xl relative border active:scale-[0.99] ${
              isFlipped
                ? "bg-[#0b4d75] border-cyan-400/40 text-white"
                : "bg-[#181a20] border-slate-800 text-slate-100 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-end">
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                isFlipped ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
              }`}>
                {isFlipped ? "Answer" : "Question"}
              </span>
            </div>

            <div className="my-auto text-center space-y-3 px-2">
              {!isFlipped ? (
                <h2 className="text-base sm:text-lg font-bold leading-relaxed tracking-wide">
                  {currentCard.front}
                </h2>
              ) : (
                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  <h2 className="text-lg sm:text-xl font-black leading-snug tracking-wide text-white">
                    {currentCard.answerText}
                  </h2>
                  {currentCard.explanation && (
                    <div className="pt-3 border-t border-white/20 text-xs text-cyan-100 leading-relaxed font-medium">
                      {currentCard.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] opacity-60">
              <span>टैप करके पलटें ↺</span>
              <Maximize2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex items-center justify-center gap-6 pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setUnknownCount(prev => prev + 1);
                setIsFlipped(false);
                if (currentFcIndex < activeFlashcards.length - 1) setCurrentFcIndex(p => p + 1);
              }}
              className="w-11 h-11 rounded-full bg-slate-900 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 flex items-center justify-center shadow-lg active:scale-90 transition"
              title="याद नहीं रहा"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              disabled={currentFcIndex === 0}
              onClick={() => {
                setIsFlipped(false);
                setCurrentFcIndex(p => p - 1);
              }}
              className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center disabled:opacity-30 active:scale-90 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              disabled={currentFcIndex === activeFlashcards.length - 1}
              onClick={() => {
                setIsFlipped(false);
                setCurrentFcIndex(p => p + 1);
              }}
              className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center disabled:opacity-30 active:scale-90 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setKnownCount(prev => prev + 1);
                setIsFlipped(false);
                if (currentFcIndex < activeFlashcards.length - 1) setCurrentFcIndex(p => p + 1);
              }}
              className="w-11 h-11 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-center shadow-lg active:scale-90 transition"
              title="याद हो गया"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>

          {/* Solution Review Dropdown */}
          {showReview && (
            <div className="space-y-3 pt-3">
              <h3 className="text-xs font-bold text-slate-300">विस्तृत उत्तर समीक्षा ({questions.length} प्रश्न)</h3>
              {questions.map((q, idx) => {
                const userAnswer = selectedAnswers[idx];
                const isCorrect = userAnswer === q.answer;
                return (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-white leading-snug">Q{idx + 1}. {q.question}</span>
                      {isCorrect ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold text-[10px]"><CheckCircle2 className="w-3.5 h-3.5" /> सही</span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1 font-bold text-[10px]"><XCircle className="w-3.5 h-3.5" /> गलत</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <div>आपका उत्तर: <strong className={isCorrect ? "text-emerald-400" : "text-rose-400"}>{userAnswer || "छोड़ा गया"}</strong></div>
                      <div>सही उत्तर: <strong className="text-emerald-400">{q.answer}</strong> ({getOptionText(q, q.answer)})</div>
                    </div>
                    {q.explanation && (
                      <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-200">
                        <strong>व्याख्या:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
