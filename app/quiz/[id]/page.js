"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { 
  ArrowLeft, Clock, CheckCircle2, XCircle, Trophy, 
  RotateCcw, Award, Layers, Sparkles, HelpCircle, ChevronDown, ChevronUp 
} from "lucide-react";

export default function QuizRunnerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});
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

        // Fetch Questions mapped to this quiz
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

        // Fetch Flashcards for this topic/chapter
        if (qz?.topic_id) {
          const { data: fcData } = await supabase
            .from("flashcards")
            .select("*")
            .eq("topic_id", qz.topic_id)
            .eq("is_active", true);
          if (fcData) setFlashcards(fcData);
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

  const toggleFlip = (fcId) => {
    setFlippedCards((prev) => ({ ...prev, [fcId]: !prev[fcId] }));
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

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-4 pb-12">
      {/* Top Header & Timer */}
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
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>प्रश्न {currentIndex + 1} / {questions.length}</span>
            <span>हल किए: {Object.keys(selectedAnswers).length}</span>
          </div>

          {/* Question Card */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white leading-snug">
              {currentIndex + 1}. {currentQ.question}
            </h3>

            {/* Options */}
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
                    className={`p-3.5 rounded-2xl border text-left text-xs flex items-center justify-between transition active:scale-[0.99] ${
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

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 disabled:opacity-40"
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
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-md active:scale-95"
              >
                अगला →
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Result Screen + Dynamic Flashcards + Solution Review */
        <div className="space-y-5">
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

          {/* 3D Quick Revision Flashcards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>त्वरित रिवीजन फ्लैशकार्ड्स (Quick Revision)</span>
              </div>
              <span className="text-[10px] text-slate-500">टच करके उत्तर देखें</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(flashcards.length > 0
                ? flashcards
                : questions.slice(0, 4).map((q) => ({
                    id: q.id,
                    front: q.question,
                    back: `सही उत्तर: ${q.answer === "A" ? q.option_a : q.answer === "B" ? q.option_b : q.answer === "C" ? q.option_c : q.option_d}${q.explanation ? `\n\nव्याख्या: ${q.explanation}` : ""}`
                  }))
              ).map((fc) => {
                const isFlipped = Boolean(flippedCards[fc.id]);
                return (
                  <div
                    key={fc.id}
                    onClick={() => toggleFlip(fc.id)}
                    className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 cursor-pointer min-h-[120px] flex flex-col justify-between transition-all duration-300 shadow-md active:scale-[0.98]"
                  >
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {isFlipped ? "💡 उत्तर व व्याख्या" : "❓ प्रश्न"}
                      </span>
                      <p className="text-xs text-slate-200 font-semibold mt-2 leading-relaxed whitespace-pre-line">
                        {isFlipped ? fc.back : fc.front}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-500 text-right mt-2">
                      {isFlipped ? "प्रश्न देखने के लिए पुनः टैप करें ↺" : "उत्तर देखने के लिए टैप करें ➔"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Question Review (If toggled) */}
          {showReview && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-300">विस्तृत प्रश्न समीक्षा ({questions.length} प्रश्न)</h3>
              {questions.map((q, idx) => {
                const userAnswer = selectedAnswers[idx];
                const isCorrect = userAnswer === q.answer;
                return (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-white">Q{idx + 1}. {q.question}</span>
                      {isCorrect ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold text-[10px]"><CheckCircle2 className="w-3.5 h-3.5" /> सही</span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1 font-bold text-[10px]"><XCircle className="w-3.5 h-3.5" /> गलत</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <div>आपका उत्तर: <strong className={isCorrect ? "text-emerald-400" : "text-rose-400"}>{userAnswer || "छोड़ा गया"}</strong></div>
                      <div>सही उत्तर: <strong className="text-emerald-400">{q.answer}</strong> ({q.answer === "A" ? q.option_a : q.answer === "B" ? q.option_b : q.answer === "C" ? q.option_c : q.option_d})</div>
                    </div>
                    {q.explanation && (
                      <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-200">
                        {q.explanation}
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
