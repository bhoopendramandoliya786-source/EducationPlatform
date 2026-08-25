"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { 
  ArrowLeft, Clock, CheckCircle2, XCircle, Trophy, 
  RotateCcw, ChevronLeft, ChevronRight, Share2, Sparkles, BookOpen, Layers
} from "lucide-react";

export default function QuizRunnerPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [viewMode, setViewMode] = useState("score"); // 'score', 'solutions', 'flashcards'
  
  // Flashcard State
  const [currentFcIndex, setCurrentFcIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(600);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadQuizData() {
      setLoading(true);
      try {
        const { data: qz } = await supabase.from("quizzes").select("*, chapters(name)").eq("id", id).single();
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
          const { data: topicQs } = await supabase
            .from("questions")
            .select("*")
            .eq("topic_id", qz.topic_id)
            .limit(20);
          if (topicQs) loadedQs = topicQs;
        }

        // Limit to 20-25 questions per quiz session for optimal focus
        if (loadedQs.length > 25) {
          loadedQs = loadedQs.slice(0, 20);
        }

        setQuestions(loadedQs);
      } catch (err) {
        console.error("Quiz Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuizData();
  }, [id]);

  // Timer Countdown
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

  const shareScoreOnWhatsApp = (score) => {
    const quizTitle = quiz?.title || "राजस्थान GK मॉक टेस्ट";
    const text = `🔥 मैंने *EduAI Pro* पर "${quizTitle}" टेस्ट में *${score.total} में से ${score.correct} अंक (${score.percentage}%)* प्राप्त किए! 🎯\n\nक्या आप मुझे हरा सकते हैं? अभी फ्री टेस्ट दें:\n👉 https://education-platform-fawn-six.vercel.app/quiz`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
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
      <div className="max-w-md mx-auto px-4 pt-12 space-y-4 animate-pulse">
        <div className="h-10 bg-slate-900 rounded-2xl border border-slate-800" />
        <div className="h-80 bg-slate-900 rounded-3xl border border-slate-800" />
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 pt-12 text-center space-y-4">
        <p className="text-sm text-rose-400 font-semibold">इस टेस्ट में अभी प्रश्न उपलब्ध नहीं हैं।</p>
        <Link href="/quiz" className="inline-block text-xs font-bold px-5 py-2.5 rounded-xl bg-indigo-600 text-white shadow-lg">
          ← क्विज़ हब पर वापस जाएँ
        </Link>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const scoreResult = isSubmitted ? calculateScore() : null;
  const progressWidth = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-md mx-auto px-4 space-y-4 pb-28 pt-2 font-sans select-none">
      
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/quiz" className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> छोड़ें
        </Link>
        
        <div className="text-center">
          <span className="text-[11px] font-bold text-slate-300">
            {quiz?.chapters?.name || quiz.title}
          </span>
        </div>

        {!isSubmitted ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</span>
          </div>
        ) : (
          <span className="text-xs font-bold text-emerald-400">पूर्ण ✓</span>
        )}
      </div>

      {/* Progress Bar (During Test) */}
      {!isSubmitted && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-bold text-slate-400">
            <span>प्रश्न {currentIndex + 1} / {questions.length}</span>
            <span>उत्तर दिए: {Object.keys(selectedAnswers).length}</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>
      )}

      {/* ================= TEST RUNNER ACTIVE ================= */}
      {!isSubmitted ? (
        <div className="space-y-4">
          
          {/* Question Card */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Q.{currentIndex + 1}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">1 अंक</span>
            </div>

            <h3 className="text-base font-bold text-white leading-relaxed">
              {currentQ.question}
            </h3>

            {/* Options List */}
            <div className="space-y-2.5 pt-2">
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
                    className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm flex items-center justify-between transition-all active:scale-[0.99] ${
                      isSelected
                        ? "bg-indigo-600/25 border-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20"
                        : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isSelected ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}>
                        {opt.key}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-sm" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between pt-1">
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
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 active:scale-95"
              >
                सबमिट करें ✓
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 active:scale-95"
              >
                अगला →
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ================= SCORECARD & RESULT ARENA ================= */
        <div className="space-y-4">
          
          {/* Result Tabs */}
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setViewMode("score")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                viewMode === "score" ? "bg-indigo-600 text-white shadow" : "text-slate-400"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" /> स्कोरकार्ड
            </button>
            <button
              onClick={() => setViewMode("solutions")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                viewMode === "solutions" ? "bg-indigo-600 text-white shadow" : "text-slate-400"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> उत्तर व्याख्या
            </button>
          </div>

          {/* VIEW 1: SCORECARD */}
          {viewMode === "score" && (
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
                <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-amber-400" />
                </div>
                
                <div>
                  <h2 className="text-base font-bold text-white">शानदार प्रयास!</h2>
                  <div className="text-4xl font-black text-emerald-400 mt-1">
                    {scoreResult.percentage}%
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">कुल प्राप्तांक: {scoreResult.correct} / {scoreResult.total}</p>
                </div>

                {/* Score Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="text-base font-black text-emerald-400">{scoreResult.correct}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5">सही</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="text-base font-black text-rose-400">{scoreResult.wrong}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5">गलत</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="text-base font-black text-amber-400">{scoreResult.unattempted}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5">छोड़े गए</div>
                  </div>
                </div>

                {/* WhatsApp Challenge Button */}
                <button
                  onClick={() => shareScoreOnWhatsApp(scoreResult)}
                  className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs shadow-lg shadow-emerald-600/25 active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4 text-slate-950" />
                  <span>WhatsApp पर दोस्तों को चैलेंज करें</span>
                </button>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setSelectedAnswers({});
                      setIsSubmitted(false);
                      setCurrentIndex(0);
                      if (quiz?.duration_minutes) setTimeLeft(quiz.duration_minutes * 60);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> पुनः टेस्ट दें
                  </button>
                  <button
                    onClick={() => setViewMode("solutions")}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> व्याख्या देखें →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: DETAILED SOLUTIONS */}
          {viewMode === "solutions" && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300">प्रश्नवार उत्तर और व्याख्या ({questions.length})</h3>
              {questions.map((q, idx) => {
                const userAnswer = selectedAnswers[idx];
                const isCorrect = userAnswer === q.answer;
                return (
                  <div key={q.id || idx} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-white leading-relaxed">
                        {idx + 1}. {q.question}
                      </span>
                      {isCorrect ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold text-[10px] whitespace-nowrap bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> सही
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1 font-bold text-[10px] whitespace-nowrap bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          <XCircle className="w-3.5 h-3.5" /> गलत
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-300 space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <div>आपका उत्तर: <strong className={isCorrect ? "text-emerald-400" : "text-rose-400"}>{userAnswer ? `${userAnswer}. ${getOptionText(q, userAnswer)}` : "छोड़ा गया"}</strong></div>
                      <div>सही उत्तर: <strong className="text-emerald-400">{q.answer}. {getOptionText(q, q.answer)}</strong></div>
                    </div>

                    {q.explanation && (
                      <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-200 leading-relaxed">
                        <strong className="text-indigo-400">💡 व्याख्या:</strong> {q.explanation}
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
