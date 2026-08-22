'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '../lib/supabase/client';
import { BookOpen, Sparkles, Trophy, HelpCircle, Download, ArrowRight, Layers, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data: examsData } = await supabase.from('exams').select('*').order('id', { ascending: true });
        if (examsData && examsData.length > 0) {
          setExams(examsData);
          setSelectedExam(examsData[0]);
          await loadSubjectsForExam(examsData[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const loadSubjectsForExam = async (examId) => {
    try {
      const { data: mappings } = await supabase.from('exam_subjects').select('subject_id, subjects(*)').eq('exam_id', examId);
      if (mappings) {
        setSubjects(mappings.map((m) => m.subjects).filter(Boolean));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectExam = (exam) => {
    setSelectedExam(exam);
    loadSubjectsForExam(exam.id);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 space-y-5">
      {/* 1. Exam Switcher */}
      <section className="space-y-2">
        <span className="text-xs font-bold text-slate-400">लक्ष्य परीक्षा चुनें (Select Exam)</span>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {exams.map((exam) => {
            const isSelected = selectedExam?.id === exam.id;
            return (
              <button
                key={exam.id}
                onClick={() => handleSelectExam(exam)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md shadow-indigo-500/20'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {exam.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Selected Exam Focus Card */}
      {selectedExam && (
        <section className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {selectedExam.board || 'Official Board'}
            </span>
            {selectedExam.syllabus_pdf_url && (
              <a
                href={selectedExam.syllabus_pdf_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:underline"
              >
                <Download className="w-3.5 h-3.5" /> PDF Syllabus
              </a>
            )}
          </div>

          <div>
            <h2 className="text-lg font-black text-white">{selectedExam.name}</h2>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{selectedExam.description}</p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
            <span className="text-xs text-slate-400">
              शामिल विषय: <strong className="text-white">{subjects.length}</strong>
            </span>
            <Link
              href={`/exam/${selectedExam.slug}`}
              className="inline-flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-white text-slate-950 hover:bg-slate-200 transition active:scale-95"
            >
              विस्तृत सिलेबस <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* 3. Action Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/notes" className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition">
          <BookOpen className="w-5 h-5 text-indigo-400 mb-2" />
          <h3 className="text-xs font-bold text-white">स्मार्ट नोट्स</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">थ्योरी एवं बुलेट पॉइंट्स</p>
        </Link>
        <Link href="/quiz" className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition">
          <Trophy className="w-5 h-5 text-emerald-400 mb-2" />
          <h3 className="text-xs font-bold text-white">50 MCQs</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">टॉपिकवाइज़ टेस्ट</p>
        </Link>
        <Link href="/pyq" className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition">
          <Layers className="w-5 h-5 text-amber-400 mb-2" />
          <h3 className="text-xs font-bold text-white">100 PYQs</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">विगत वर्षों के प्रश्न</p>
        </Link>
        <Link href="/ai-tutor" className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition">
          <Sparkles className="w-5 h-5 text-purple-400 mb-2" />
          <h3 className="text-xs font-bold text-white">AI Tutor</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">24/7 लाइव डाउट सॉल्व</p>
        </Link>
      </section>

      {/* 4. Included Subjects List */}
      <section className="space-y-3 pt-1">
        <h3 className="text-xs font-bold text-slate-300">पाठ्यक्रम विषय (Subjects)</h3>
        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 bg-slate-900 rounded-xl border border-slate-800" />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
            विषय लोड हो रहे हैं...
          </div>
        ) : (
          <div className="grid gap-2">
            {subjects.map((sub) => (
              <Link
                key={sub.id}
                href={`/subjects/${sub.slug || sub.id}`}
                className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                    {sub.name.substring(0, 1)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition">{sub.name}</h4>
                    <p className="text-[10px] text-slate-400">चैप्टर एवं टेस्ट उपलब्ध</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
