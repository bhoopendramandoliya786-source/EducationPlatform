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
  const topicId = params?.id;
  const supabase = createClient();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [bookmarks, setBookmarks] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    async function loadQuizData() {
      if (!topicId) return;
      setLoading(true);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');

        let query = supabase
          .from('questions')
          .select('*')
          .eq('topic_id', topicId)
          .eq('is_active', true);

        if (mode === 'mcq') {
          query = query.eq('is_pyq', false);
        } else if (mode === 'pyq') {
          query = query.eq('is_pyq', true);
        }

        const { data, error } = await query.order('id', { ascending: true });

        if (error) throw error;
        setQuestions(data || []);
      } catch (err) {
        console.error('Quiz load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadQuizData();
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

  // परीक्षा नाम को डबल होने से रोकने वाला फंक्शन
  const getExamLabel = () => {
    if (!currentQ?.source && !currentQ?.year) return null;
    const src = currentQ.source || '';
    const yr = currentQ.year ? String(currentQ.year) : '';
    if (src.includes(yr)) return src;
    return `${src} ${yr}`.trim();
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#131418', minHeight: '100dvh' }} className="text-white flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <span className="text-xs text-zinc-400">प्रश्नावली लोड हो रही है...</span>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div style={{ backgroundColor: '#131418', minHeight: '100dvh' }} className="text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <p className="text-zinc-400 text-sm">इस कैटेगरी में अभी कोई प्रश्न उपलब्ध नहीं हैं।</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-blue-600 rounded-full text-xs font-bold text-white cursor-pointer"
        >
          वापस जाएँ
        </button>
      </div>
    );
  }

  if (quizFinished) {
    const accuracy = Math.round((correctCount / questions.length) * 100) || 0;
    return (
      <div style={{ backgroundColor: '#131418', minHeight: '100dvh' }} className="text-zinc-100 flex flex-col items-center justify-center p-5 font-sans">
        <div style={{ backgroundColor: '#22242a', borderColor: '#323642' }} className="w-full max-w-md border rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto text-3xl">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">अभ्यास पूर्ण हुआ!</h2>
            <p className="text-xs text-zinc-400">आपकी सटीकता और स्कोर रिपोर्ट नीचे है</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div style={{ backgroundColor: '#1b3326', borderColor: '#235e40' }} className="p-3 border rounded-2xl">
              <span className="text-[10px] text-zinc-400 font-semibold block">सही</span>
              <span className="text-xl font-black text-emerald-400">{correctCount}</span>
            </div>
            <div style={{ backgroundColor: '#3b1d22', borderColor: '#6b2b35' }} className="p-3 border rounded-2xl">
              <span className="text-[10px] text-zinc-400 font-semibold block">गलत</span>
              <span className="text-xl font-black text-rose-400">{wrongCount}</span>
            </div>
            <div style={{ backgroundColor: '#222538', borderColor: '#3b436b' }} className="p-3 border rounded-2xl">
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
              style={{ backgroundColor: '#2e313b' }}
              className="flex-1 py-3.5 rounded-full text-xs font-bold text-zinc-200 transition flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>पुनः प्रयास करें</span>
            </button>
            <button
              onClick={() => router.push(`/topic/${topicId}`)}
              className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-full text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <span>टॉपिक पर लौटें</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const examTag = getExamLabel();

  return (
    <div style={{ backgroundColor: '#131418', minHeight: '100dvh' }} className="text-zinc-100 font-sans flex flex-col justify-start selection:bg-blue-500/30">

      {/* 1. TOP HEADER */}
      <header className="w-full max-w-lg mx-auto px-5 pt-4 pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="p-1 -ml-1 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => toggleBookmark(currentQ.id)}
              className={`p-1 transition cursor-pointer ${
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
              className="p-1 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dashes + Score Pills */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex-1 flex gap-1.5 overflow-hidden py-1">
            {questions.map((q, idx) => {
              const answered = selectedAnswers[q.id];
              let dashBg = '#2d3038';
              if (idx === currentIndex) dashBg = '#8b8e98';
              if (answered) {
                dashBg = answered === q.answer ? '#81c995' : '#f28b82';
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

          <div className="flex items-center gap-2 shrink-0 font-bold">
            <span className="text-zinc-300 mr-1 text-sm font-semibold">
              {currentIndex + 1}/{questions.length}
            </span>
            <span style={{ backgroundColor: '#f28b82', color: '#202124' }} className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black">
              ✕ {wrongCount}
            </span>
            <span style={{ backgroundColor: '#81c995', color: '#202124' }} className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black">
              ✓ {correctCount}
            </span>
          </div>
        </div>
      </header>

      {/* 2. QUESTION & OPTIONS CONTAINER */}
      <main className="w-full max-w-lg mx-auto px-5 pt-3 pb-6 flex-1 flex flex-col justify-start">

        <div className="space-y-1.5 mb-5">
          <span className="text-sm text-zinc-400 font-medium block">
            Question {currentIndex + 1}
          </span>

          {examTag && (
            <div className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
              <span>📌</span>
              <span>[परीक्षा: {examTag}]</span>
            </div>
          )}

          <h1 className="text-[17px] font-semibold text-white leading-snug pt-1">
            {currentQ.question}
          </h1>
        </div>

        {/* Option Cards */}
        <div className="flex flex-col gap-3.5 w-full">
          {['A', 'B', 'C', 'D'].map((optKey) => {
            const optText = currentQ[`option_${optKey.toLowerCase()}`];
            if (!optText) return null;

            const isCorrect = currentQ.answer === optKey;
            const isChosen = currentAnswer === optKey;
            const isAnswered = !!currentAnswer;

            let cardBg = '#28292d';
            let textColor = '#e3e3e3';

            if (isAnswered) {
              if (isCorrect) {
                cardBg = '#1c2e24';
              } else if (isChosen) {
                cardBg = '#361e22';
              } else {
                cardBg = '#202125';
                textColor = '#73757d';
              }
            }

            return (
              <div
                key={optKey}
                onClick={() => handleSelectOption(optKey)}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
                className="w-full transition-all cursor-pointer shadow-sm"
              >
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-3 text-[15px] font-medium leading-normal">
                    <span className="text-zinc-400 font-medium">
                      {optKey}.
                    </span>
                    <span style={{ color: textColor }}>{optText}</span>
                    {isAnswered && isChosen && (
                      <span className="text-xs text-zinc-400 font-normal">
                        (Your answer)
                      </span>
                    )}
                  </div>

                  {isAnswered && (
                    <div className="shrink-0">
                      {isCorrect && (
                        <div style={{ backgroundColor: 'rgba(52, 168, 83, 0.25)', color: '#81c995' }} className="w-6 h-6 rounded-full flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                      {isChosen && !isCorrect && (
                        <div style={{ backgroundColor: 'rgba(234, 67, 53, 0.25)', color: '#f28b82' }} className="w-6 h-6 rounded-full flex items-center justify-center">
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Inline Explanation */}
                {isAnswered && (isCorrect || isChosen) && (
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }} className="pt-2 text-xs sm:text-sm leading-relaxed">
                    <p className="text-zinc-300">
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
          <div className="pt-3 flex justify-end">
            <Link
              href={`/ai-tutor?q=${encodeURIComponent(currentQ.question)}`}
              style={{ backgroundColor: 'rgba(66, 133, 244, 0.15)', border: '1px solid rgba(66, 133, 244, 0.3)' }}
              className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-blue-200 font-medium px-4 py-2 rounded-full transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>AI ट्यूटर से विस्तार में समझें</span>
            </Link>
          </div>
        )}

        {/* 3. CENTERED BUTTONS */}
        <div className="pt-8 pb-10 flex items-center justify-center gap-4">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            style={{ backgroundColor: '#28292d' }}
            className="px-8 py-3 rounded-full disabled:opacity-30 disabled:pointer-events-none text-zinc-200 text-sm font-medium transition cursor-pointer hover:bg-zinc-700"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            style={{ backgroundColor: '#2c6bed' }}
            className="px-9 py-3 rounded-full hover:bg-blue-500 text-white text-sm font-medium shadow-md transition cursor-pointer"
          >
            <span>{currentIndex === questions.length - 1 ? 'Finish' : 'Next'}</span>
          </button>
        </div>

      </main>

    </div>
  );
}