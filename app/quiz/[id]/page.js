'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { 
  ArrowLeft, 
  Clock, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Sparkles,
  ChevronRight,
  Flame
} from 'lucide-react';

export default function QuizEnginePage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.id;
  const supabase = createClient();

  const [questions, setQuestions] = useState([]);
  const [topic, setTopic] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        // Fetch Topic Details
        const { data: tData } = await supabase
          .from('topics')
          .select('*, chapters(name, subjects(name))')
          .eq('id', topicId)
          .single();
        setTopic(tData);

        // Fetch Questions for this Topic
        const { data: qData } = await supabase
          .from('questions')
          .select('*')
          .eq('topic_id', topicId)
          .eq('is_active', true)
          .limit(20);

        setQuestions(qData || []);
      } catch (err) {
        console.error('Quiz load error:', err);
      } finally {
        setLoading(false);
      }
    }
    if (topicId) init();
  }, [topicId]);

  // Timer Countdown
  useEffect(() => {
    if (isSubmitted || loading || questions.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, loading, questions]);

  const handleSelectOption = (optKey) => {
    if (isSubmitted) return;
    const qId = questions[currentIndex].id;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optKey }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.answer) correct++;
    });
    return {
      correct,
      wrong: Object.keys(selectedAnswers).length - correct,
      total: questions.length,
      score: correct * 10
    };
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    const { correct, wrong, total, score } = calculateScore();

    if (user) {
      try {
        // Record Attempt in Supabase
        await supabase.from('attempts').insert({
          user_id: user.id,
          total_questions: total,
          correct_answers: correct,
          wrong_answers: wrong,
          score: score,
          completed_at: new Date().toISOString()
        });

        // Update Topic Progress
        await supabase.from('progress').upsert({
          user_id: user.id,
          topic_id: topicId,
          completed: correct >= Math.floor(total * 0.6),
          questions_attempted: total,
          questions_correct: correct,
          score: score,
          last_studied_at: new Date().toISOString()
        }, { onConflict: 'user_id,topic_id' });
      } catch (err) {
        console.error('Progress sync error:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050711] text-white flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400">क्विज़ तैयार हो रही है...</span>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#050711] text-white p-6 flex flex-col items-center justify-center text-center space-y-4">
        <p className="text-sm text-slate-400">इस टॉपिक के लिए अभी कोई प्रश्न उपलब्ध नहीं हैं।</p>
        <Link href={`/topic/${topicId}`} className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold">
          वापस टॉपिक पर जाएँ
        </Link>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentSelected = selectedAnswers[currentQ?.id];
  const { correct, wrong, total, score } = calculateScore();

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#050711] text-slate-100 font-sans pb-28">

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#050711]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link 
            href={`/topic/${topicId}`}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold">Exit</span>
          </Link>

          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 text-xs font-mono font-bold text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <span className="text-xs font-bold text-indigo-400">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">

        {/* RESULT VIEW */}
        {isSubmitted ? (
          <section className="p-6 rounded-3xl bg-gradient-to-b from-indigo-950/70 to-slate-900 border border-indigo-500/30 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto text-3xl shadow-xl shadow-indigo-600/40">
              🏆
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-white">क्विज़ परिणाम</h2>
              <p className="text-xs text-slate-400">{topic?.name}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold">स्कोर</span>
                <p className="text-lg font-black text-indigo-400">+{score} XP</p>
              </div>
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl">
                <span className="text-[10px] text-emerald-400 uppercase font-bold">सही</span>
                <p className="text-lg font-black text-emerald-400">{correct}</p>
              </div>
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-2xl">
                <span className="text-[10px] text-rose-400 uppercase font-bold">गलत</span>
                <p className="text-lg font-black text-rose-400">{wrong}</p>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setSelectedAnswers({});
                  setCurrentIndex(0);
                  setTimeLeft(600);
                }}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>पुनः प्रयास करें (Retake)</span>
              </button>

              <Link
                href={`/topic/${topicId}`}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold transition text-center"
              >
                नोट्स व व्याख्या देखें
              </Link>
            </div>
          </section>
        ) : (
          /* ACTIVE QUESTION VIEW */
          <div className="space-y-4">

            {/* Question Card */}
            <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/90 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Question {currentIndex + 1}
                </span>
                {currentQ.is_pyq && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    PYQ
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white leading-relaxed">
                {currentQ.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {['A', 'B', 'C', 'D'].map(optKey => {
                const optText = currentQ[`option_${optKey.toLowerCase()}`];
                if (!optText) return null;
                const isSelected = currentSelected === optKey;

                return (
                  <button
                    key={optKey}
                    onClick={() => handleSelectOption(optKey)}
                    className={`w-full p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all text-left flex items-center gap-3 ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/10'
                        : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {optKey}
                    </span>
                    <span>{optText}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Controls */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 disabled:opacity-30"
              >
                पिछला
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5"
                >
                  <span>अगला प्रश्न</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition"
                >
                  क्विज़ सबमिट करें ✓
                </button>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}