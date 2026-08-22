"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { ArrowLeft, ChevronLeft, ChevronRight, Check, X, RotateCw, Sparkles, Maximize2 } from "lucide-react";

export default function FlashcardsHubPage() {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadCards() {
      setLoading(true);
      try {
        let { data: fcData } = await supabase
          .from("flashcards")
          .select("*, topics(name)")
          .eq("is_active", true);

        if (!fcData || fcData.length < 5) {
          const { data: qData } = await supabase
            .from("questions")
            .select("id, question, option_a, option_b, option_c, option_d, answer, explanation, topics(name)")
            .eq("is_active", true)
            .limit(100);

          if (qData) {
            const generated = qData.map((q) => {
              const ansText = q.answer === "A" ? q.option_a : q.answer === "B" ? q.option_b : q.answer === "C" ? q.option_c : q.option_d;
              return {
                id: q.id,
                front: q.question,
                answerText: ansText,
                explanation: q.explanation || "",
                topics: q.topics
              };
            });
            fcData = fcData ? [...fcData, ...generated] : generated;
          }
        }

        if (fcData) {
          setFlashcards(fcData.sort(() => Math.random() - 0.5));
        }
      } catch (err) {
        console.error("Flashcards load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCards();
  }, []);

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Loop endlessly with fresh shuffle
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

  const markKnown = (e) => {
    e.stopPropagation();
    setKnownCount((prev) => prev + 1);
    handleNext();
  };

  const markUnknown = (e) => {
    e.stopPropagation();
    setUnknownCount((prev) => prev + 1);
    handleNext();
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 pt-16 space-y-6 animate-pulse text-center">
        <div className="h-6 w-32 bg-slate-900 rounded-lg mx-auto" />
        <div className="h-[420px] bg-slate-900 rounded-3xl border border-slate-800" />
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 pt-20 text-center space-y-4">
        <p className="text-sm text-slate-400">कोई फ्लैशकार्ड उपलब्ध नहीं है।</p>
        <Link href="/" className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-xs font-bold text-white">
          होम पर वापस जाएँ
        </Link>
      </div>
    );
  }

  const card = flashcards[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / flashcards.length) * 100);

  return (
    <div className="max-w-md mx-auto px-4 space-y-5 pb-24 pt-2 select-none">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <Link href="/" className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-xs font-bold text-slate-300">
          {card.topics?.name || "फ्लैशकार्ड रिवीजन"}
        </span>
        <button
          onClick={() => {
            setFlashcards((prev) => [...prev].sort(() => Math.random() - 0.5));
            setCurrentIndex(0);
            setIsFlipped(false);
          }}
          className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white"
          title="पुनः रीशफल करें"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar & Scores */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px]">
              ✕ {unknownCount}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
              ✓ {knownCount}
            </span>
          </div>
          <span>{currentIndex + 1} / {flashcards.length}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Flashcard (Minimalist Big Flip UI) */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className={`w-full min-h-[420px] rounded-3xl p-8 cursor-pointer flex flex-col justify-between transition-all duration-300 shadow-2xl relative border active:scale-[0.99] ${
          isFlipped
            ? "bg-[#0b4d75] border-cyan-400/40 text-white"
            : "bg-[#181a20] border-slate-800 text-slate-100 hover:border-slate-700"
        }`}
      >
        {/* Top Tag Badge */}
        <div className="flex items-center justify-end">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            isFlipped ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
          }`}>
            {isFlipped ? "Answer" : "Question"}
          </span>
        </div>

        {/* Center Content: Question / Answer */}
        <div className="my-auto text-center space-y-4 px-2">
          {!isFlipped ? (
            <h2 className="text-lg sm:text-xl font-bold leading-relaxed tracking-wide">
              {card.front}
            </h2>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <h2 className="text-xl sm:text-2xl font-black leading-snug tracking-wide text-white">
                {card.answerText || card.back?.split("\n")[0]?.replace("सही उत्तर: ", "")}
              </h2>
              {card.explanation && (
                <div className="pt-3 border-t border-white/20 text-xs sm:text-sm text-cyan-100 leading-relaxed font-medium">
                  {card.explanation}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Expand / Flip Hint */}
        <div className="flex items-center justify-between text-[11px] opacity-60">
          <span>टैप करके पलटें ↺</span>
          <Maximize2 className="w-4 h-4" />
        </div>
      </div>

      {/* Bottom Circle Action Controls */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <button
          onClick={markUnknown}
          className="w-12 h-12 rounded-full bg-slate-900 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 flex items-center justify-center shadow-lg active:scale-90 transition"
          title="दोबारा याद करना है"
        >
          <X className="w-5 h-5" />
        </button>

        <button
          disabled={currentIndex === 0}
          onClick={handlePrev}
          className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center disabled:opacity-30 active:scale-90 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center active:scale-90 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={markKnown}
          className="w-12 h-12 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-center shadow-lg active:scale-90 transition"
          title="याद हो गया"
        >
          <Check className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
