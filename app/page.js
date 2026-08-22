"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import { 
  BookOpen, Trophy, Sparkles, HelpCircle, Download, 
  ChevronRight, ArrowRight, Layers, Flame, BookCheck,
  TrendingUp, Award, Zap, BrainCircuit
} from "lucide-react";

export default function HomePage() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState({ notes: 0, questions: 0, quizzes: 0 });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data: examsData } = await supabase
          .from("exams")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (examsData && examsData.length > 0) {
          setExams(examsData);
          setSelectedExam(examsData[0]);
          await fetchExamSubjects(examsData[0].id);
        }

        const [{ count: nCt }, { count: qCt }, { count: qzCt }] = await Promise.all([
          supabase.from("notes").select("*", { count: "exact", head: true }),
          supabase.from("questions").select("*", { count: "exact", head: true }),
          supabase.from("quizzes").select("*", { count: "exact", head: true })
        ]);
        setStats({ notes: nCt || 0, questions: qCt || 0, quizzes: qzCt || 0 });
      } catch (err) {
        console.error("Home Data Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const fetchExamSubjects = async (examId) => {
    try {
      const { data: mappings } = await supabase
        .from("exam_subjects")
        .select("subject_id, sort_order, subjects(*)")
        .eq("exam_id", examId)
        .order("sort_order", { ascending: true });

      if (mappings) {
        setSubjects(mappings.map((m) => m.subjects).filter(Boolean));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectExam = (exam) => {
    setSelectedExam(exam);
    fetchExamSubjects(exam.id);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-5">
      
      {/* 1. Exam Switcher Scrollable Pills */}
      <section className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
          <span>लक्ष्य परीक्षा चुनें (Select Exam)</span>
          <span className="text-indigo-400 font-semibold">{selectedExam?.category || "Rajasthan State"}</span>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 w-28 bg-slate-900 rounded-xl animate-pulse border border-slate-800" />
            ))
          ) : (
            exams.map((exam) => {
              const isSelected = selectedExam?.id === exam.id;
              return (
                <button
                  key={exam.id}
                  onClick={() => handleSelectExam(exam)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 border active:scale-95 ${
                    isSelected
                      ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-transparent shadow-lg shadow-indigo-500/25"
                      : "bg-slate-900/90 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  {exam.name}
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* 2. Target Exam Hero Card */}
      {selectedExam && (
        <section className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-950 border border-indigo-500/20 space-y-3 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {selectedExam.category || "Official Board"}
            </span>
            {selectedExam.syllabus_pdf_url && (
              <a
                href={selectedExam.syllabus_pdf_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:underline"
              >
                <Download className="w-3.5 h-3.5" /> PDF सिलेबस
              </a>
            )}
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{selectedExam.name}</h2>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2">
              {selectedExam.description || "सम्पूर्ण पाठ्यक्रम, स्मार्ट थ्योरी नोट्स, टॉपिकवाइज़ टेस्ट एवं विगत वर्षों के हल प्रश्न पत्र।"}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
            <span className="text-xs text-slate-400">
              उपलब्ध विषय: <strong className="text-white">{subjects.length}</strong>
            </span>
            <Link
              href={`/exam/${selectedExam.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-white text-slate-950 hover:bg-slate-200 active:scale-95 transition shadow-sm"
            >
              विस्तृत सिलेबस <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* 3. Core Feature Touch Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/notes"
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 active:scale-95 transition group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition mb-2">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-white">स्मार्ट नोट्स</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">{stats.notes}+ टू-द-पॉइंट नोट्स</p>
        </Link>

        <Link
          href="/quiz"
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 active:scale-95 transition group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition mb-2">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-white">स्पीड टेस्ट</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">{stats.quizzes}+ लाइव मॉक टेस्ट</p>
        </Link>

        <Link
          href="/pyq"
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 active:scale-95 transition group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition mb-2">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-white">PYQs प्रश्न</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">{stats.questions}+ विगत वर्षों के प्रश्न</p>
        </Link>

        <Link
          href="/ai-tutor"
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 active:scale-95 transition group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-white">AI ट्यूटर</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">24/7 लाइव डाउट सॉल्व</p>
        </Link>
      </section>

      {/* 4. Subject Hierarchy (Syllabus Structure) */}
      <section className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300">पाठ्यक्रम विषय (Syllabus Subjects)</h3>
          <span className="text-[11px] text-slate-500">{subjects.length} विषय उपलब्ध</span>
        </div>

        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
            विषय लोड हो रहे हैं...
          </div>
        ) : (
          <div className="grid gap-2.5">
            {subjects.map((sub) => (
              <Link
                key={sub.id}
                href={`/subject/${sub.id}`}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 flex items-center justify-between transition active:scale-[0.99] group shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm group-hover:scale-105 transition">
                    {sub.name.substring(0, 1)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition">{sub.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">अध्याय, टॉपिक, स्मार्ट नोट्स व MCQs देखें</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 5. Clean Non-Intrusive Sponsored / Ad Banner Slot (Future Monetization) */}
      <section className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 text-center space-y-1.5">
        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase tracking-wider">
          Sponsored / अपडेट्स
        </span>
        <p className="text-xs font-semibold text-slate-200">
          🎯 REET Mains & RAS 2026 संपूर्ण मॉक टेस्ट सीरीज निशुल्क उपलब्ध है!
        </p>
      </section>
    </div>
  );
}
