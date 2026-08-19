'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import Navbar from '../../components/Navbar';
import { 
  Timer, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Trophy, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export default function QuizEnginePage({ params }) {
  const resolvedParams = use(params);
  const quizOrTopicId = resolvedParams?.id;
  const router = useRouter();
  const supabase = createClient();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadQuiz() {
      setLoading(true);
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        // 1. Check if ID is for a specific Topic or Quiz
        let { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('topic_id', quizOrTopicId)
          .eq('is_active', true)
          .limit(20);

        // 2. If no questions found by topic_id, fetch via quiz_questions table
        if (!data || data.length === 0) {
          const { data: quizQues } = await supabase
            .from('quiz_questions')
            .select('questions(*)')
            .eq('quiz_id', quizOrTopicId);

          if (quizQues && quizQues.length > 0) {
            data = quizQues.map(item => item.questions).filter(Boolean);
          }
        }

        // 3. Fallback: General active questions
        if (!data || data.length === 0) {
          const { data: generalQ } = await supabase
            .from('questions')
            .select('*')
            .eq('is_active', true)
            .limit(10);
          data = generalQ || [];
        }

        setQuestions(data || []);
        if (data && data.length > 0) {
          setTimeLeft(data.length * 60);
        }
      } catch (err) {
        console.error('Error loading quiz questions:', err);
      } finally {
        setLoading(false);
      }
    }

    if (quizOrTopicId) {
      loadQuiz();
    }
  }, [quizOrTopicId]);

  // Timer Effect
  useEffect(() => {
    if (loading || isSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, isSubmitted, timeLeft]);

  const handleSelectOption = (optionKey) => {
    if (isSubmitted || questions.length === 0) return;
    const currentQ = questions[currentIndex];
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionKey
    }));
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitted(true);

    if (user && questions.length > 0) {
      let correct = 0;
      let wrong = 0;

      questions.forEach(q => {
        if (selectedAnswers[q.id] === q.answer) correct++;
        else if (selectedAnswers[q.id]) wrong++;
      });

      const score = correct * 2;

      try {
        const { data: attempt } = await supabase.from('attempts').insert({
          user_id: user.id,
          total_questions: questions.length,
          correct_answers: correct,
          wrong_answers: wrong,
          score: score,
          completed_at: new Date().toISOString()
        }).select().single();

        if (attempt) {
          const answersToInsert = questions.map(q => ({
            attempt_id: attempt.id,
            question_id: q.id,
            selected_answer: selectedAnswers[q.id] || null,
            correct_answer: q.answer,
            is_correct: selectedAnswers[q.id] === q.answer
          }));

          await supabase.from('attempt_answers').insert(answersToInsert);
        }
      } catch (e) {
        console.error('Error saving attempt:', e);
      }
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-amber-500"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col items-center justify-center p-4 space-y-4 font-sans">
        <AlertCircle className="w-12 h-12 text-slate-500" />
        <h2 className="text-lg font-bold">इस टॉपिक/क्विज़ के लिए प्रश्न उपलब्ध नहीं हैं</h2>
        <button 
          onClick={() => router.back()} 
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-white"
        >
          वापस जाएँ
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  let correctCount = 0;
  let wrongCount = 0;
  if (isSubmitted) {
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.answer) correctCount++;
      else if (selectedAnswers[q.id]) wrongCount++;
    });
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans pb-24 selection:bg-blue-500/30">

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#090D16]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quit</span>
          </button>

          {!isSubmitted && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              timeLeft < 60 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse' 
                : 'bg-slate-900 text-amber-400 border-slate-800'
            }`}>
              <Timer className="w-3.5 h-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}

          <div className="text-xs text-slate-400 font-medium">
            उत्तर दिए: <span className="text-emerald-400 font-bold">{answeredCount}</span>/{questions.length}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-4">

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-amber-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Palette */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {questions.map((q, idx) => {
            const isAnswered = !!selectedAnswers[q.id];
            const isCurrent = idx === currentIndex;

            let badgeStyle = "bg-slate-900 border-slate-800 text-slate-400";
            if (isCurrent) badgeStyle = "bg-amber-500 border-amber-400 text-slate-950 font-bold scale-105 shadow-md shadow-amber-500/20";
            else if (isAnswered) badgeStyle = "bg-blue-600/20 border-blue-500/40 text-blue-400 font-semibold";

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-xl shrink-0 text-xs border flex items-center justify-center transition-all ${badgeStyle}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* RESULT SCORECARD */}
        {isSubmitted ? (
          <div className="bg-gradient-to-br from-slate-900 via-[#111726] to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">क्विज़ परिणाम</h2>
              <p className="text-xs text-slate-400">आपने टेस्ट सफलतापूर्वक पूरा कर लिया है!</p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 max-w-sm mx-auto">
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                <div className="text-xl font-bold text-emerald-400">{correctCount}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">सही उत्तर</div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                <div className="text-xl font-bold text-rose-400">{wrongCount}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">गलत उत्तर</div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                <div className="text-xl font-bold text-amber-400">{questions.length - (correctCount + wrongCount)}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">छोड़े गए</div>
              </div>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  setIsSubmitted(false);
                  setCurrentIndex(0);
                  setTimeLeft(questions.length * 60);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>पुनः प्रयास करें</span>
              </button>
              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all"
              >
                होम पर जाएँ
              </Link>
            </div>
          </div>
        ) : (
          /* ACTIVE QUESTION CARD */
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-start justify-between gap-3">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-mono font-bold">
                प्रश्न {currentIndex + 1} of {questions.length}
              </span>
              {currentQ?.is_pyq && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                  {currentQ.source || 'PYQ'}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQ?.question}
            </h3>

            {/* Options */}
            <div className="grid grid-cols-1 gap-2.5">
              {['A', 'B', 'C', 'D'].map(optKey => {
                const optText = currentQ?.[`option_${optKey.toLowerCase()}`];
                if (!optText) return null;

                const isSelected = selectedAnswers[currentQ.id] === optKey;

                return (
                  <button
                    key={optKey}
                    onClick={() => handleSelectOption(optKey)}
                    className={`flex items-center justify-between p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all text-left ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold border ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-500' 
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {optKey}
                      </span>
                      <span>{optText}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-30 hover:bg-slate-700 transition-all flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>पिछला</span>
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition-all"
                >
                  सबमिट करें
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center gap-1"
                >
                  <span>अगला</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}