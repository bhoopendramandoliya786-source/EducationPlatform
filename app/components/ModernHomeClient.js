"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Sparkles, 
  PlayCircle, 
  FolderTree, 
  ChevronRight, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Flame,
  BookOpen,
  Award
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
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#6366f1", "#a855f7", "#ec4899", "#10b981"]
      });
    }
  };

  return (
    <div className="relative min-h-screen text-slate-100 overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, 40, 0] 
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, -40, 0] 
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 -right-24 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      </div>

      <main className="max-w-md mx-auto px-4 space-y-5 pb-32 pt-2 select-none">
        
        {/* 1. Hero Card */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative p-5 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden group"
        >
          <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 rounded-3xl opacity-50 blur-sm pointer-events-none" />

          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 tracking-wider uppercase flex items-center gap-1.5 shadow-inner">
                <Sparkles className="w-3 h-3 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} /> 
                Rajasthan Exam Prep 2026
              </span>
              
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {counts.subjects} विषय लाइव
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
                राजस्थान GK <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">महा-अभ्यास</span> 🎯
              </h1>
              <p className="text-xs text-slate-300/90 leading-relaxed mt-1.5 font-normal">
                CET, REET, पटवार व पुलिस परीक्षा के लिए <strong className="text-indigo-300 font-semibold">{counts.tests}+</strong> PYQ और टू-द-पॉइंट स्मार्ट नोट्स।
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="p-2 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                <div className="text-xs font-bold text-white flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400" /> 100
                </div>
                <div className="text-[9px] text-slate-400 font-medium">PYQ/Topic</div>
              </div>
              <div className="p-2 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                <div className="text-xs font-bold text-white flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> 50
                </div>
                <div className="text-[9px] text-slate-400 font-medium">MCQ Sets</div>
              </div>
              <div className="p-2 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                <div className="text-xs font-bold text-white flex items-center justify-center gap-1">
                  <Award className="w-3 h-3 text-indigo-400" /> Daily
                </div>
                <div className="text-[9px] text-slate-400 font-medium">Rankings</div>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/quiz"
                prefetch={true}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition duration-300"
              >
                <PlayCircle className="w-4 h-4 animate-pulse" />
                <span>आज का डेली टेस्ट शुरू करें (10 PYQ)</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* 2. Interactive Instant Quiz Widget */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-4 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-white/5 space-y-3 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> क्विक टेस्ट चेक
            </span>
            <span className="text-[9px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
              Instant Check
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-200">
            Q. {SAMPLE_QUESTION.question}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {SAMPLE_QUESTION.options.map((opt, idx) => {
              const isCorrect = idx === SAMPLE_QUESTION.correct;
              const isSelected = selectedOpt === idx;
              
              let btnStyle = "bg-slate-950/70 border-white/10 text-slate-300 hover:border-indigo-500/40";
              if (answered) {
                if (isCorrect) btnStyle = "bg-emerald-500/20 border-emerald-500/60 text-emerald-200";
                else if (isSelected) btnStyle = "bg-rose-500/20 border-rose-500/60 text-rose-200";
              }

              return (
                <motion.button
                  key={idx}
                  whileTap={!answered ? { scale: 0.95 } : {}}
                  onClick={() => handleOptionClick(idx)}
                  className={`p-2.5 text-left rounded-xl border text-xs font-medium transition flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {answered && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {answered && isSelected && !isCorrect && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {answered && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-[10px] text-slate-400 bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20 flex items-start gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>{SAMPLE_QUESTION.fact}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* 3. Student Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <StudentStreakCard totalTests={counts.tests} />
        </motion.div>

        {/* 4. Syllabus Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          aria-label="Syllabus Subjects" 
          className="rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl"
        >
          <div className="p-4 flex items-center justify-between border-b border-white/5 bg-slate-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <FolderTree className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">पाठ्यक्रम विषय (Syllabus)</h2>
                <p className="text-[10px] text-slate-400">{subjects.length} विषय • अध्यायवार PYQ अभ्यास</p>
              </div>
            </div>
          </div>

          <div className="p-3 grid gap-2.5">
            {subjects.map((sub, index) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 * index }}
                whileHover={{ scale: 1.015, x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={`/subject/${sub.id}`}
                  prefetch={true}
                  aria-label={`${sub.name} विषय खोलें`}
                  className="p-3 rounded-2xl bg-slate-950/60 hover:bg-indigo-950/30 border border-white/5 hover:border-indigo-500/40 flex items-center justify-between group transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-300 font-black text-sm group-hover:scale-110 transition-transform">
                      {sub.icon || sub.name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition leading-snug">
                        {sub.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">अध्याय ➔ 50 MCQ ➔ 100 PYQ</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition">
                      अभ्यास
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-transform" />
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
