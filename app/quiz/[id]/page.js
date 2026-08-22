"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { 
  ArrowLeft, Clock, CheckCircle2, XCircle, Trophy, 
  RotateCcw, Sparkles, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, HelpCircle 
} from "lucide-react";

export default function QuizRunnerPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Flashcard slider states
  const [currentFcIndex, setCurrentFcIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-4 animate-pulse">
        <div className="h-10 bg-slate-900 rounded-2xl border border-slate-800" />
        <div className="h-64 bg-slate-900 rounded-3xl border border-slate-800" />
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-8 text-center space-y-3">
        <p className="text-xs text-rose-400">इस टेस्ट में अभी प्रश्न उपलब्ध नहीं हैं।</p>
        <Link href="/quiz" className="inline-block text-xs font-bold px-4 py-2 rounded-xl bg-slate-900 text-white border border-slate-800">
          क्विज़ हब पर वापस जाएँ
        </Link>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const scoreResult = isSubmitted ? calculateScore() : null;

  // Active Flashcards Array
  const activeFlashcards = flashcards.length > 0 
    ? flashcards 
    : questions.map((q) => ({
        id: q.id,
        front: q.question,
        back: `सही उत्तर: ${q.answer === "A" ? q.option_a : q.answer === "B" ? q.option_b : q.answer === "C" ? q.option_d}\n\n${q.explanation ? `व्याख्या: ${q.explanation}` : ""}`
      }));

  const currentCard = activeFlashcards[currentFcIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-4 pb-16">
      {/* Header & Timer */}
      <div className="flex items-center justify-between pt-1">
        <Link href="/quiz" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="w-3.5 h-3.5" /> टेस्ट छोड़ें
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
                onClick={() => setIsSubmitted(true)}
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
        /* Results + 1-by-1 Slide Flashcard + Solution Review */
        <div className="space-y-6">
          {/* Scorecard Hero */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/60 border border-indigo-500/20 text-center space-y-3 shadow-xl">
            <Trophy className="w-10 h-10 text-amber-400 mx-auto" />
            <h2 className="text-lg font-black text-white">टेस्ट परिणाम (Scorecard)</h2>
            <div className="text-3xl font-black text-emerald-400">{scoreResult.percentage}%</div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                <div className="text-sm font-bold text-emerald-400">{scoreResult.correct}</div>
                <div className="text-[10px] text-slate-400">सही उत्तर</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                <div className="text-sm font-bold text-rose-400">{scoreResult.wrong}</div>
                <div className="text-[10px] text-slate-400">गलत उत्तर</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                <div className="text-sm font-bold text-amber-400">{scoreResult.unattempted}</div>
                <div className="text-[10px] text-slate-400">छोड़े गए</div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  setIsSubmitted(false);
                  setCurrentIndex(0);
                  if (quiz?.duration_minutes) setTimeLeft(quiz.duration_minutes * 60);
                }}
                className="flex-1 py-3 rounded-2xl bg-indigo-600 text-xs font-bold text-white shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> पुनः टेस्ट दें
              </button>
              <button
                onClick={() => setShowReview(!showReview)}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1"
              >
                {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                उत्तर देखें
              </button>
            </div>
          </div>

          {/* 1-by-1 Interactive Slide Flashcard */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-black text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>त्वरित रिवीजन फ्लैशकार्ड (Slide Mode)</span>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {currentFcIndex + 1} / {activeFlashcards.length}
              </span>
            </div>

            {/* Single Slide Flip Card */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-amber-500/30 hover:border-amber-500/60 cursor-pointer min-h-[180px] flex flex-col justify-between transition-all duration-300 shadow-2xl active:scale-[0.99] select-none"
            >
              <div>
                <span className={`text-[11px] font-black px-3 py-1 rounded-full border inline-block ${
                  isFlipped 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}>
                  {isFlipped ? "💡 सही उत्तर व व्याख्या (Back Side)" : "❓ प्रश्न (Front Side)"}
                </span>

                <p className="text-sm sm:text-base text-white font-bold mt-4 leading-relaxed whitespace-pre-line">
                  {isFlipped ? currentCard?.back : currentCard?.front}
                </p>
              </div>

              <div className="text-[11px] font-bold text-indigo-400 text-right mt-4 flex items-center justify-end gap-1">
                <span>{isFlipped ? "कार्ड पलटने के लिए टैप करें ↺" : "उत्तर देखने के लिए टच करें ➔"}</span>
              </div>
            </div>

            {/* Flashcard Slider Controls */}
            <div className="flex items-center justify-between pt-1">
              <button
                disabled={currentFcIndex === 0}
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentFcIndex((prev) => prev - 1);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 disabled:opacity-30 flex items-center gap-1 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" /> पिछला कार्ड
              </button>

              <button
                disabled={currentFcIndex === activeFlashcards.length - 1}
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentFcIndex((prev) => prev + 1);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-black text-slate-950 disabled:opacity-30 flex items-center gap-1 shadow-md shadow-amber-500/20 active:scale-95"
              >
                अगला कार्ड <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Full Solution Review */}
          {showReview && (
            <div className="space-y-4 pt-3">
              <h3 className="text-sm font-bold text-slate-300">विस्तृत उत्तर समीक्षा ({questions.length} प्रश्न)</h3>
              {questions.map((q, idx) => {
                const userAnswer = selectedAnswers[idx];
                const isCorrect = userAnswer === q.answer;
                return (
                  <div key={q.id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs sm:text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-white leading-snug">Q{idx + 1}. {q.question}</span>
                      {isCorrect ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold text-xs"><CheckCircle2 className="w-4 h-4" /> सही</span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1 font-bold text-xs"><XCircle className="w-4 h-4" /> गलत</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <div>आपका उत्तर: <strong className={isCorrect ? "text-emerald-400" : "text-rose-400"}>{userAnswer || "छोड़ा गया"}</strong></div>
                      <div>सही उत्तर: <strong className="text-emerald-400">{q.answer}</strong> ({q.answer === "A" ? q.option_a : q.answer === "B" ? q.option_b : q.answer === "C" ? q.option_c : q.option_d})</div>
                    </div>
                    {q.explanation && (
                      <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200">
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
