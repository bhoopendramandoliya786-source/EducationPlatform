"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { ArrowLeft, Sparkles, RotateCw, ChevronLeft, ChevronRight, Layers, HelpCircle, BookOpen } from "lucide-react";

export default function FlashcardsHubPage() {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadAllFlashcards() {
      setLoading(true);
      try {
        // Fetch explicit flashcards first
        let { data: fcData } = await supabase
          .from("flashcards")
          .select("*, topics(name, chapters(name, subjects(name)))")
          .eq("is_active", true);

        // If not enough explicit flashcards, fallback to generating from questions
        if (!fcData || fcData.length < 5) {
          const { data: qData } = await supabase
            .from("questions")
            .select("id, question, option_a, option_b, option_c, option_d, answer, explanation, topics(name)")
            .eq("is_active", true)
            .limit(50);

          if (qData) {
            const generated = qData.map((q) => {
              const ansText = q.answer === "A" ? q.option_a : q.answer === "B" ? q.option_b : q.answer === "C" ? q.option_c : q.option_d;
              return {
                id: q.id,
                front: q.question,
                back: `सही उत्तर: ${ansText}\n\n${q.explanation ? "व्याख्या: " + q.explanation : ""}`,
                topics: q.topics
              };
            });
            fcData = fcData ? [...fcData, ...generated] : generated;
          }
        }

        // Shuffle / Randomize for unlimited endless feel
        if (fcData) {
          setFlashcards(fcData.sort(() => Math.random() - 0.5));
        }
      } catch (err) {
        console.error("Flashcard Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAllFlashcards();
  }, []);

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Endless loop: shuffle again or loop back
      setFlashcards((prev) => [...prev].sort(() => Math.random() - 0.5));
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-12 space-y-6 animate-pulse text-center">
        <div className="h-8 w-48 bg-slate-900 rounded-xl mx-auto" />
        <div className="h-80 bg-slate-900 rounded-3xl border border-slate-800" />
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 pt-16 text-center space-y-4">
        <Layers className="w-12 h-12 text-amber-400 mx-auto opacity-80" />
        <h2 className="text-base font-bold text-white">अभी कोई फ्लैशकार्ड उपलब्ध नहीं हैं</h2>
        <p className="text-xs text-slate-400">कृपया कुछ प्रश्न या नोट्स जोड़ें ताकि फ्लैशकार्ड स्वतः बन सकें।</p>
        <Link href="/" className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-xs font-bold text-white">
          होम पर वापस जाएँ
        </Link>
      </div>
    );
  }

  const card = flashcards[currentIndex];

  return (
    <div className="max-w-xl mx-auto px-4 space-y-6 pb-24 pt-2">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="w-4 h-4" /> होम
        </Link>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>अनलिमिटेड रिवीजन मोड ({currentIndex + 1} / {flashcards.length})</span>
        </div>
      </div>

      {/* Main Big Interactive Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border-2 border-amber-500/40 hover:border-amber-500/80 cursor-pointer min-h-[340px] sm:min-h-[380px] flex flex-col justify-between transition-all duration-300 shadow-2xl active:scale-[0.99] select-none relative overflow-hidden"
      >
        {/* Background Glow */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black px-3.5 py-1 rounded-full border shadow-sm ${
              isFlipped 
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-amber-500/20 text-amber-300 border-amber-500/40"
            }`}>
              {isFlipped ? "💡 सही उत्तर एवं विस्तृत व्याख्या" : "❓ मुख्य प्रश्न (Tap to Flip)"}
            </span>

            {card.topics?.name && (
              <span className="text-[11px] font-bold text-slate-400 px-2.5 py-1 rounded-lg bg-slate-800/80">
                {card.topics.name}
              </span>
            )}
          </div>

          {/* Card Content (Big & Readable) */}
          <div className="pt-4 pb-2">
            <p className="text-base sm:text-lg text-white font-bold leading-relaxed sm:leading-loose whitespace-pre-line">
              {isFlipped ? card.back : card.front}
            </p>
          </div>
        </div>

        {/* Footer Hint inside Card */}
        <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-400">
          <span>{isFlipped ? "प्रश्न देखने के लिए पुनः टैप करें ↺" : "उत्तर देखने के लिए कार्ड पर टैप करें ➔"}</span>
          <RotateCw className="w-4 h-4 opacity-70" />
        </div>
      </div>

      {/* Navigation Buttons for Endless Deck */}
      <div className="flex items-center gap-3 pt-2">
        <button
          disabled={currentIndex === 0}
          onClick={handlePrev}
          className="flex-1 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 disabled:opacity-30 flex items-center justify-center gap-2 active:scale-95 shadow-md"
        >
          <ChevronLeft className="w-4 h-4" /> पिछला कार्ड
        </button>

        <button
          onClick={handleNext}
          className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-xs font-black text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition"
        >
          अगला कार्ड <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
