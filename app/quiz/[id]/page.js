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
      <div className="min-h-screen bg-[#111216] text-white flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <span className="text-xs text-zinc-400">प्रैक्टिस टेस्ट लोड हो रहा है...</span>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-[#111216] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <p className="text-zinc-400 text-sm">इस टॉपिक के लिए अभी कोई प्रश्न उपलब्ध नहीं हैं।</p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 bg-blue-600 rounded-xl text-xs font-bold"
        >
          वापस जाएँ
        </button>
      </div>
    );
  }

  if (quizFinished) {
    const accuracy = Math.round((correctCount / questions.length) * 100) || 0;
    return (
      <div className="min-h-screen bg-[#111216] text-zinc-100 flex flex-col items-center justify-center p-5 font-sans">
        <div className="w-full max-w-md bg-[#1a1c22] border border-zinc-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto text-3xl">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">अभ्यास पूर्ण हुआ!</h2>
            <p className="text-xs text-zinc-400">आपकी सटीकता और स्कोर रिपोर्ट नीचे है</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-2xl">
              <span className="text-[10px] text-zinc-400 font-semibold block">सही</span>
              <span className="text-xl font-black text-emerald-400">{correctCount}</span>
            </div>
            <div className="p-3 bg-rose-950/40 border border-rose-500/20 rounded-2xl">
              <span className="text-[10px] text-zinc-400 font-semibold block">गलत</span>
              <span className="text-xl font-black text-rose-400">{wrongCount}</span>
            </div>
            <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-2xl">
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
              className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold text-zinc-200 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>पुनः प्रयास करें</span>
            </button>
            <button
              onClick={() => router.push(`/topic/${topicId}`)}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
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
    <div className="min-h-screen bg-[#111216] text-zinc-100 font-sans flex flex-col justify-between pb-24 selection:bg-indigo-500/30">
      
      {/* Top Header Bar */}
      <header className="w-full max-w-xl mx-auto px-4 pt-4 pb-2 sticky top-0 bg-[#111216]/95 backdrop-blur-md z-20">
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

        {/* Progress Dashes & Scores */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex-1 flex gap-1.5 overflow-hidden py-1">
            {questions.map((q, idx) => {
              const answered = selectedAnswers[q.id];
              let dashColor = 'bg-zinc-800';
              if (idx === currentIndex) dashColor = 'bg-zinc-400';
              if (answered) {
                dashColor = answered === q.answer ? 'bg-emerald-500' : 'bg-rose-500';
              }
              return (
                <div
                  key={q.id}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${dashColor}`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0 text-xs font-bold">
            <span className="text-zinc-400 mr-1">
              {currentIndex + 1}/{questions.length}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <X className="w-3 h-3" /> {wrongCount}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Check className="w-3 h-3" /> {correctCount}
            </span>
          </div>
        </div>
      </header>

      {/* Main Question & Options Area */}
      <main className="w-full max-w-xl mx-auto px-4 py-3 flex-1 space-y-4">
        
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

        {/* Options List */}
        <div className="space-y-3 pt-1">
          {['A', 'B', 'C', 'D'].map((optKey) => {
            const optText = currentQ[`option_${optKey.toLowerCase()}`];
            if (!optText) return null;

            const isCorrect = currentQ.answer === optKey;
            const isChosen = currentAnswer === optKey;
            const isAnswered = !!currentAnswer;

            let cardStyle = "bg-[#1c1e24] border-zinc-800 text-zinc-200 hover:bg-[#23262e] hover:border-zinc-700";
            
            if (isAnswered) {
              if (isCorrect) {
                cardStyle = "bg-[#11271c] border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/40";
              } else if (isChosen) {
                cardStyle = "bg-[#2d151c] border-rose-500 text-rose-200 shadow-md shadow-rose-950/40";
              } else {
                cardStyle = "bg-[#16171c] border-zinc-800/40 text-zinc-500 opacity-60";
              }
            }

            return (
              <div
                key={optKey}
                onClick={() => handleSelectOption(optKey)}
                className={`rounded-2xl border p-4 transition-all cursor-pointer space-y-2.5 ${cardStyle}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-sm font-medium">
                    <span className="text-xs font-bold text-zinc-400">
                      {optKey}.
                    </span>
                    <span>{optText}</span>
                    {isAnswered && isChosen && (
                      <span className="text-xs text-zinc-400 font-normal">
                        (Your answer)
                      </span>
                    )}
                  </div>

                  {isAnswered && (
                    <div className="shrink-0">
                      {isCorrect && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {isChosen && !isCorrect && (
                        <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                          <X className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isAnswered && (isCorrect || isChosen) && (
                  <div className="pt-2 border-t border-white/10 text-xs leading-relaxed">
                    <p className={isCorrect ? "text-emerald-300" : "text-rose-300"}>
                      {isCorrect 
                        ? (currentQ.explanation || '1857 की क्रांति को भारत का प्रथम स्वतंत्रता संग्राम कहा जाता है।') 
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
          <div className="pt-2 flex justify-end">
            <Link
              href={`/ai-tutor?q=${encodeURIComponent(currentQ.question)}`}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold bg-indigo-950/40 px-3.5 py-2 rounded-xl border border-indigo-500/20 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI ट्यूटर से विस्तार में समझें</span>
            </Link>
          </div>
        )}

      </main>

      {/* Bottom Fixed Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#111216]/95 border-t border-zinc-800/90 py-3.5 px-4 backdrop-blur-xl z-30">
        <div className="max-w-xl mx-auto flex items-center justify-center gap-3">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="px-8 py-3 rounded-full bg-[#1c1e24] hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 text-xs font-bold transition cursor-pointer border border-zinc-800"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-9 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>{currentIndex === questions.length - 1 ? 'Finish' : 'Next'}</span>
          </button>
        </div>
      </footer>

    </div>
  );
}