"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { 
  ArrowLeft, Clock, CheckCircle2, XCircle, Trophy, 
  RotateCcw, Share2, BookOpen, HelpCircle, Loader2
} from "lucide-react";

export default function QuizRunnerPage() {
  const { id } = useParams();
  const [quizTitle, setQuizTitle] = useState("मॉक टेस्ट");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState("score"); // 'score' | 'solutions'

  const [timeLeft, setTimeLeft] = useState(600); // 10 Minutes for 20 Questions
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadQuizData() {
      if (!id) return;
      setLoading(true);
      try {
        // 1. Try checking if ID is a chapter
        const { data: chapData } = await supabase
          .from("chapters")
          .select("*, subjects(name)")
          .eq("id", id)
          .single();

        let loadedQs = [];

        if (chapData) {
          setQuizTitle(`${chapData.name} (${chapData.subjects?.name || "GK"})`);

          // Get topics
          const { data: topList } = await supabase
            .from("topics")
            .select("id")
            .eq("chapter_id", id);
          const topicIds = (topList || []).map((t) => t.id);

          if (topicIds.length > 0) {
            const { data: qData } = await supabase
              .from("questions")
              .select("*")
              .in("topic_id", topicIds)
              .eq("is_active", true)
              .limit(20);
            if (qData) loadedQs = qData;
          } else {
            const { data: qData } = await supabase
              .from("questions")
              .select("*")
              .eq("chapter_id", id)
              .eq("is_active", true)
              .limit(20);
            if (qData) loadedQs = qData;
          }
        } else {
          // Fallback: Check in quizzes table
          const { data: qz } = await supabase
            .from("quizzes")
            .select("*, chapters(name, subjects(name))")
            .eq("id", id)
            .single();

          if (qz) {
            setQuizTitle(qz.title || qz.chapters?.name || "मॉक टेस्ट");
            const { data: qMaps } = await supabase
              .from("quiz_questions")
              .select("question_order, questions(*)")
              .eq("quiz_id", id)
              .order("question_order", { ascending: true });

            if (qMaps && qMaps.length > 0) {
              loadedQs = qMaps.map((m) => m.questions).filter(Boolean);
            } else if (qz.chapter_id) {
              const { data: qData } = await supabase
                .from("questions")
                .select("*")
                .eq("chapter_id", qz.chapter_id)
                .limit(20);
              if (qData) loadedQs = qData;
            }
          }
        }

        if (loadedQs.length > 20) {
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
  }, [id, supabase]);

  // 10-Minute Countdown Timer
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

  // 🌟 QUIZ SUBMISSION WITH SUPABASE + STREAK + GA4
  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsSubmitted(true);

    try {
      const score = calculateScore();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const today = new Date().toISOString().split("T")[0];

        // 1. Insert Record into progress Table
        await supabase.from("progress").insert({
          user_id: user.id,
          topic_id: id,
          score: score.correct,
          questions_attempted: Object.keys(selectedAnswers).length,
          questions_correct: score.correct,
          completed: true,
          last_studied_at: new Date().toISOString()
        });

        // 2. Update Daily Streak in profiles Table
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("streak_count, last_active_date")
          .eq("id", user.id)
          .single();

        if (userProfile) {
          const lastDate = userProfile.last_active_date;
          let newStreak = userProfile.streak_count || 0;

          if (lastDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0];

            if (lastDate === yesterdayStr) {
              newStreak += 1;
            } else {
              newStreak = 1;
            }

            await supabase
              .from("profiles")
              .update({
                streak_count: newStreak,
                last_active_date: today,
                updated_at: new Date().toISOString()
              })
              .eq("id", user.id);
          }
        }
      }

      // 3. Google Analytics Event
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "quiz_complete", {
          quiz_title: quizTitle,
          score: score.correct,
          total: score.total,
          percentage: score.percentage
        });
      }
    } catch (err) {
      console.error("Quiz DB Save Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareScoreOnWhatsApp = (score) => {
    const text = `🔥 मैंने EduAI Pro पर "${quizTitle}" टेस्ट में ${score.total} में से ${score.correct} अंक (${score.percentage}%) प्राप्त किए! 🎯\n\nअभी टेस्ट दें:\n👉 https://education-platform-fawn-six.vercel.app/quiz`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 pt-8 space-y-4 animate-pulse">
        <div className="h-8 w-36 bg-slate-900 rounded-xl" />
        <div className="h-64 bg-slate-900 rounded-3xl border border-slate-800" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 pt-16 text-center space-y-4">
        <p className="text-sm text-amber-400 font-semibold">इस टेस्ट में अभी प्रश्न जोड़े जा रहे हैं।</p>
        <Link href="/quiz" className="inline-block text-xs font-bold px-5 py-2.5 rounded-xl bg-indigo-600 text-white shadow-lg">
          ← सभी टेस्ट देखें
        </Link>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const scoreResult = isSubmitted ? calculateScore() : null;
  const progressWidth = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-md mx-auto px-4 space-y-4 pb-28 pt-2 font-sans select-none">

      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link href="/quiz" className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> छोड़ें
        </Link>

        <div className="text-center max-w-[50%] truncate">
          <span className="text-xs font-bold text-white truncate block">
            {quizTitle}
          </span>
        </div>

        {!isSubmitted ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</span>
          </div>
        ) : (
          <span className="text-xs font-bold text-emerald-400">पूर्ण ✓</span>
        )}
      </div>

      {/* Progress Bar */}
      {!isSubmitted && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-slate-400">
            <span>प्रश्न {currentIndex + 1} / {questions.length}</span>
            <span>उत्तर दिए: {Object.keys(selectedAnswers).length}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>
      )}

      {/* ACTIVE TEST ENGINE */}
      {!isSubmitted ? (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Q.{currentIndex + 1}
              </span>
              <span className="text-[10px] text-slate-500 uppercase">{currentQ.difficulty || "1 अंक"}</span>
            </div>

            <h3 className="text-sm font-bold text-white leading-relaxed">
              {currentQ.question}
            </h3>

            {/* Options */}
            <div className="space-y-2 pt-1">
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
                    type="button"
                    onClick={() => handleSelectOption(opt.key)}
                    className={`w-full p-3.5 rounded-2xl border text-left text-xs flex items-center justify-between transition active:scale-[0.99] ${
                      isSelected
                        ? "bg-indigo-600/30 border-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20"
                        : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isSelected ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}>
                        {opt.key}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 disabled:opacity-30 cursor-pointer"
            >
              ← पिछला
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitQuiz}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold text-white shadow-lg active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>सबमिट हो रहा है...</span>
                  </>
                ) : (
                  <span>सबमिट करें ✓</span>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md active:scale-95 cursor-pointer"
              >
                अगला →
              </button>
            )}
          </div>
        </div>
      ) : (
        /* SCORECARD & RESULT */
        <div className="space-y-4">
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode("score")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                viewMode === "score" ? "bg-indigo-600 text-white shadow" : "text-slate-400"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" /> स्कोरकार्ड
            </button>
            <button
              type="button"
              onClick={() => setViewMode("solutions")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                viewMode === "solutions" ? "bg-indigo-600 text-white shadow" : "text-slate-400"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> उत्तर व्याख्या
            </button>
          </div>

          {viewMode === "score" && scoreResult && (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-white">टेस्ट स्कोरकार्ड</h2>
                <div className="text-4xl font-black text-emerald-400 mt-1">
                  {scoreResult.percentage}%
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">प्राप्तांक: {scoreResult.correct} / {scoreResult.total}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="text-base font-black text-emerald-400">{scoreResult.correct}</div>
                  <div className="text-[10px] text-slate-400">सही</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="text-base font-black text-rose-400">{scoreResult.wrong}</div>
                  <div className="text-[10px] text-slate-400">गलत</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="text-base font-black text-amber-400">{scoreResult.unattempted}</div>
                  <div className="text-[10px] text-slate-400">छोड़े गए</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => shareScoreOnWhatsApp(scoreResult)}
                className="w-full py-3 rounded-2xl bg-[#25D366] text-slate-950 font-black text-xs shadow flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Share2 className="w-4 h-4" /> WhatsApp पर शेयर करें
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAnswers({});
                    setIsSubmitted(false);
                    setCurrentIndex(0);
                    setTimeLeft(600);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-white border border-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> पुनः दें
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("solutions")}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow flex items-center justify-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" /> व्याख्या देखें →
                </button>
              </div>
            </div>
          )}

          {viewMode === "solutions" && (
            <div className="space-y-3">
              {questions.map((q, idx) => {
                const userAnswer = selectedAnswers[idx];
                const isCorrect = userAnswer === q.answer;
                return (
                  <div key={q.id || idx} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-white">
                        {idx + 1}. {q.question}
                      </span>
                      {isCorrect ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> सही
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1 font-bold text-[10px] bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          <XCircle className="w-3.5 h-3.5" /> गलत
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-300 space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <div>आपका उत्तर: <strong className={isCorrect ? "text-emerald-400" : "text-rose-400"}>{userAnswer || "छोड़ा गया"}</strong></div>
                      <div>सही उत्तर: <strong className="text-emerald-400">{q.answer}</strong></div>
                    </div>

                    {q.explanation && (
                      <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-200">
                        <strong className="text-indigo-300 flex items-center gap-1"><HelpCircle className="w-3 h-3" /> व्याख्या:</strong> {q.explanation}
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