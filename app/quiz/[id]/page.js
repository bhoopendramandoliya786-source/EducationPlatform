'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { 
  ChevronLeft, 
  Share2, 
  Bookmark, 
  Check, 
  X, 
  Sparkles, 
  RotateCcw, 
  Award,
  ArrowRight
} from 'lucide-react';

export default function QuizPlayPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.id;
  const supabase = createClient();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [bookmarks, setBookmarks] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    async function loadQuizData() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('topic_id', topicId)
          .eq('is_active', true)
          .order('id', { ascending: true });

        if (error) throw error;
        setQuestions(data || []);
      } catch (err) {
        console.error('Quiz load error:', err);
      } finally {
        setLoading(false);
      }
    }

    if (topicId) loadQuizData();
  }, [topicId]);

  let correctCount = 0;
  let wrongCount = 0;

  questions.forEach(q => {
    const userChoice = selectedAnswers[q.id];
    if (userChoice) {
      if (userChoice === q.answer) correctCount++;
      else wrongCount++;
    }
  });

  const currentQ = questions[currentIndex];
  const currentAnswer = currentQ ? selectedAnswers[currentQ.id] : null;

  const handleSelectOption = (optKey) => {
    if (currentAnswer) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: optKey
    }));
  };

  const toggleBookmark = (qId) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#0f1015', minHeight: '100dvh' }} className="text-white flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <span className="text-xs text-zinc-400">प्रैक्टिस टेस्ट लोड हो रहा है...</span>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div style={{ backgroundColor: '#0f1015', minHeight: '100dvh' }} className="text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <p className="text-zinc-400 text-sm">इस टॉपिक के लिए अभी कोई प्रश्न उपलब्ध नहीं हैं।</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-blue-600 rounded-xl text-xs font-bold text-white"
        >
          वापस जाएँ
        </button>
      </div>
    );
  }

  if (quizFinished) {
    const accuracy = Math.round((correctCount / questions.length) * 100) || 0;
    return (
      <div style={{ backgroundColor: '#0f1015', minHeight: '100dvh' }} className="text-zinc-100 flex flex-col items-center justify-center p-5 font-sans">
        <div style={{ backgroundColor: '#181a22', borderColor: '#2b2f3d' }} className="w-full max-w-md border rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto text-3xl">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">अभ्यास पूर्ण हुआ!</h2>
            <p className="text-xs text-zinc-400">आपकी सटीकता और स्कोर रिपोर्ट नीचे है</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div style={{ backgroundColor: 'rgba(6, 78, 59, 0.4)', borderColor: 'rgba(16, 185, 129, 0.3)' }} className="p-3 border rounded-2xl">
              <span className="text-[10px] text-zinc-400 font-semibold block">सही</span>
              <span className="text-xl font-black text-emerald-400">{correctCount}</span>
            </div>
            <div style={{ backgroundColor: 'rgba(136, 19, 55, 0.4)', borderColor: 'rgba(244, 63, 94, 0.3)' }} className="p-3 border rounded-2xl">
              <span className="text-[10px] text-zinc-400 font-semibold block">गलत</span>
              <span className="text-xl font-black text-rose-400">{wrongCount}</span>
            </div>
            <div style={{ backgroundColor: 'rgba(49, 46, 129, 0.4)', borderColor: 'rgba(99, 102, 241, 0.3)' }} className="p-3 border rounded-2xl">
              <span className="text-[10px] text-zinc-400 font-semibold block">सटीकता</span>
              <span className="text-xl font-black text-indigo-400">{accuracy}%</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setSelectedAnswers({});
                setCurrentIndex(0);
                setQuizFinished(false);
              }}
              style={{ backgroundColor: '#262936' }}
              className="flex-1 py-3.5 rounded-xl text-xs font-bold text-zinc-200 transition flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>पुनः प्रयास करें</span>
            </button>
            <button
              onClick={() => router.push(`/topic/${topicId}`)}
              className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <span>टॉपिक पर लौटें</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0f1015', minHeight: '100dvh' }} className="text-zinc-100 font-sans flex flex-col justify-start selection:bg-blue-500/30">

      {/* 1. TOP HEADER & PROGRESS */}
      <header className="w-full max-w-xl mx-auto px-4 pt-3 pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => toggleBookmark(currentQ.id)}
              className={`p-2 rounded-xl transition cursor-pointer ${
                bookmarks.has(currentQ.id) ? 'text-amber-400' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: currentQ.question, url: window.location.href });
                }
              }}
              className="p-2 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Dashes & Score Badges */}
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <div className="flex-1 flex gap-1.5 overflow-hidden py-1">
            {questions.map((q, idx) => {
              const answered = selectedAnswers[q.id];
              let dashBg = '#222530';
              if (idx === currentIndex) dashBg = '#9ca3af';
              if (answered) {
                dashBg = answered === q.answer ? '#10b981' : '#f43f5e';
              }
              return (
                <div
                  key={q.id}
                  style={{ backgroundColor: dashBg }}
                  className="h-1.5 flex-1 rounded-full transition-all duration-300"
                />
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0 text-xs font-bold">
            <span className="text-zinc-400 mr-1 text-[11px]">
              {currentIndex + 1}/{questions.length}
            </span>
            <span style={{ backgroundColor: 'rgba(244, 63, 94, 0.15)', borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fda4af' }} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px]">
              <X className="w-3 h-3" /> {wrongCount}
            </span>
            <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#6ee7b7' }} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px]">
              <Check className="w-3 h-3" /> {correctCount}
            </span>
          </div>
        </div>
      </header>

      {/* 2. QUESTION & LARGE OPTIONS CONTAINER */}
      <main className="w-full max-w-xl mx-auto px-4 pt-3 pb-4 space-y-4">

        {/* Question Header & Title */}
        <div className="space-y-1.5">
          <span className="text-xs text-zinc-400 font-semibold block">
            Question {currentIndex + 1}
          </span>

          {(currentQ.source || currentQ.year) && (
            <div className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <span>📌</span>
              <span>[परीक्षा: {currentQ.source} {currentQ.year || ''}]</span>
            </div>
          )}

          <h1 className="text-base sm:text-lg font-bold text-white leading-relaxed pt-1">
            {currentQ.question}
          </h1>
        </div>

        {/* 4 Large Touch Option Cards */}
        <div className="space-y-3.5 pt-1">
          {['A', 'B', 'C', 'D'].map((optKey) => {
            const optText = currentQ[`option_${optKey.toLowerCase()}`];
            if (!optText) return null;

            const isCorrect = currentQ.answer === optKey;
            const isChosen = currentAnswer === optKey;
            const isAnswered = !!currentAnswer;

            // Solid distinct styling for visible cards
            let cardBg = '#181a22';
            let cardBorder = '#2a2e3d';
            let textColor = '#f1f5f9';

            if (isAnswered) {
              if (isCorrect) {
                cardBg = '#0b261b';
                cardBorder = '#059669';
                textColor = '#6ee7b7';
              } else if (isChosen) {
                cardBg = '#2c1218';
                cardBorder = '#e11d48';
                textColor = '#fda4af';
              } else {
                cardBg = '#13141a';
                cardBorder = '#1f222b';
                textColor = '#64748b';
              }
            }

            return (
              <div
                key={optKey}
                onClick={() => handleSelectOption(optKey)}
                style={{
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                }}
                className="rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer space-y-2.5 shadow-md min-h-[58px]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-sm sm:text-base font-medium leading-normal">
                    <span style={{ color: isAnswered && (isCorrect || isChosen) ? textColor : '#94a3b8' }} className="text-sm font-bold shrink-0">
                      {optKey}.
                    </span>
                    <span style={{ color: textColor }}>{optText}</span>
                    {isAnswered && isChosen && (
                      <span className="text-xs text-zinc-400 font-normal shrink-0">
                        (Your answer)
                      </span>
                    )}
                  </div>

                  {isAnswered && (
                    <div className="shrink-0">
                      {isCorrect && (
                        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }} className="w-6 h-6 rounded-full flex items-center justify-center font-bold">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                      {isChosen && !isCorrect && (
                        <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.2)', color: '#fb7185' }} className="w-6 h-6 rounded-full flex items-center justify-center font-bold">
                          <X className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Option Explanation Reveal */}
                {isAnswered && (isCorrect || isChosen) && (
                  <div style={{ borderTopColor: 'rgba(255, 255, 255, 0.08)' }} className="pt-2.5 border-t text-xs leading-relaxed">
                    <p style={{ color: isCorrect ? '#a7f3d0' : '#fecdd3' }}>
                      {isCorrect 
                        ? (currentQ.explanation || 'यह सही उत्तर है।') 
                        : 'यह विकल्प सही नहीं है।'
                      }
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* AI Tutor Link */}
        {currentAnswer && (
          <div className="pt-1 flex justify-end">
            <Link
              href={`/ai-tutor?q=${encodeURIComponent(currentQ.question)}`}
              style={{ backgroundColor: 'rgba(79, 70, 229, 0.15)', borderColor: 'rgba(99, 102, 241, 0.3)' }}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-indigo-200 font-semibold px-3.5 py-2 rounded-xl border transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI ट्यूटर से विस्तार में समझें</span>
            </Link>
          </div>
        )}

        {/* 3. CENTERED BUTTONS (Right below questions) */}
        <div className="pt-6 pb-12 flex items-center justify-center gap-4">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            style={{ backgroundColor: '#181a22', borderColor: '#2a2e3d' }}
            className="px-8 py-3.5 rounded-full border disabled:opacity-30 disabled:pointer-events-none text-zinc-300 text-xs font-bold transition cursor-pointer hover:bg-zinc-800"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-9 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>{currentIndex === questions.length - 1 ? 'Finish' : 'Next'}</span>
          </button>
        </div>

      </main>

    </div>
  );
}