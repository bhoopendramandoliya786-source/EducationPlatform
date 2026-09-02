"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Sparkles, 
  PlayCircle, 
  ChevronRight, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Flame,
  BookOpen,
  Award,
  Layers,
  Compass,
  ArrowUpRight
} from "lucide-react";
import StudentStreakCard from "./StudentStreakCard";

const SAMPLE_QUESTION = {
  question: "राजस्थान का राज्य पक्षी कौन सा है?",
  options: ["मोर", "गोडावण", "तोता", "कबूतर"],
  correct: 1,
  fact: "गोडावण (Great Indian Bustard) को 1981 में राज्य पक्षी घोषित किया गया था।"
};

export default function ModernHomeClient({ subjects = [], counts = { notes: 0, tests: 0, subjects: 0 } }) {
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handleOptionClick = (index) => {
    if (answered) return;
    setSelectedOpt(index);
    setAnswered(true);

    if (index === SAMPLE_QUESTION.correct) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.8 },
        colors: ["#10b981", "#059669", "#34d399", "#fbbf24"]
      });
    }
  };

  return (
    <div className="relative min-h-screen text-slate-100 bg-[#070d14] overflow-hidden selection:bg-emerald-500/30">

      {/* Background Ambient Glows (Emerald & Ocean Theme) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-teal-600/10 rounded-full blur-[110px]" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-600/5 rounded-full blur-[90px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <main className="max-w-lg mx-auto px-4 space-y-5 pb-32 pt-2">

        {/* 1. VIP Hero Card */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative p-5 rounded-[28px] bg-gradient-to-b from-slate-900/95 to-slate-950/90 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_12px_40px_-15px_rgba(16,185,129,0.15)] overflow-hidden"
        >
          {/* Subtle Top Border Glow */}
          <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 tracking-widest uppercase flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" /> 
                EXAM PREP 2026
              </span>

              <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                {counts.subjects} विषय लाइव
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-snug">
                राजस्थान GK <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">महा-अभ्यास</span> 🎯
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                CET, REET, पटवार व पुलिस परीक्षा के लिए <strong className="text-emerald-400 font-bold">{counts.tests}+</strong> PYQ और स्मार्ट नोट्स।
              </p>
            </div>

            {/* Micro Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5 py-1">
              <div className="p-2.5 rounded-2xl bg-slate-800/40 border border-slate-800/80 text-center">
                <div className="text-xs font-black text-slate-100 flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" /> 100
                </div>
                <div className="text-[9px] text-slate-400 font-medium mt-0.5">PYQ / Topic</div>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-800/40 border border-slate-800/80 text-center">
                <div className="text-xs font-black text-slate-100 flex items-center justify-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" /> 50
                </div>
                <div className="text-[9px] text-slate-400 font-medium mt-0.5">MCQ Sets</div>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-800/40 border border-slate-800/80 text-center">
                <div className="text-xs font-black text-slate-100 flex items-center justify-center gap-1">
                  <Award className="w-3.5 h-3.5 text-cyan-400" /> Daily
                </div>
                <div className="text-[9px] text-slate-400 font-medium mt-0.5">Rankings</div>
              </div>
            </div>

            {/* Action CTA Button */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/quiz"
                prefetch={true}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition duration-200"
              >
                <PlayCircle className="w-4 h-4" />
                <span>आज का डेली टेस्ट शुरू करें (10 PYQ)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* 2. Interactive Instant Check Widget */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="p-4 rounded-[24px] bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 space-y-3 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-emerald-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-emerald-400" /> क्विक टेस्ट चेक
            </span>
            <span className="text-[9px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60 font-medium">
              Daily Boost
            </span>
          </div>

          <p className="text-xs font-bold text-slate-200 leading-relaxed">
            Q. {SAMPLE_QUESTION.question}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {SAMPLE_QUESTION.options.map((opt, idx) => {
              const isCorrect = idx === SAMPLE_QUESTION.correct;
              const isSelected = selectedOpt === idx;

              let btnStyle = "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-emerald-500/40 hover:bg-slate-900";
              if (answered) {
                if (isCorrect) btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold";
                else if (isSelected) btnStyle = "bg-rose-500/20 border-rose-500 text-rose-200";
              }

              return (
                <button
                  key={idx}
                  disabled={answered}
                  onClick={() => handleOptionClick(idx)}
                  className={`p-3 text-left rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {answered && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  {answered && isSelected && !isCorrect && <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {answered && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-[11px] text-slate-300 bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30 flex items-start gap-2 leading-relaxed"
              >
                <BookOpen className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{SAMPLE_QUESTION.fact}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* 3. Student Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <StudentStreakCard totalTests={counts.tests} />
        </motion.div>

        {/* 4. Syllabus Section (2-Column VIP Card Grid) */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          aria-label="Syllabus Subjects" 
          className="space-y-3.5"
        >
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-black text-white tracking-wide">पाठ्यक्रम विषय</h2>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              {subjects.length} Subjects
            </span>
          </div>

          {/* 2-Column Responsive Card Grid */}
          <div className="grid grid-cols-2 gap-3">
            {subjects.map((sub, index) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.03 * index }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={`/subject/${sub.id}`}
                  prefetch={true}
                  className="h-full p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 hover:border-emerald-500/40 hover:shadow-[0_8px_25px_-10px_rgba(16,185,129,0.2)] flex flex-col justify-between group transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-sm group-hover:scale-110 transition-transform">
                        {sub.icon || sub.name?.charAt(0) || "S"}
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition line-clamp-2 leading-snug">
                        {sub.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">
                        50 MCQ • 100 PYQ
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-200">
                      प्रैक्टिस शुरू
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

      </main>
    </div>
  );
}