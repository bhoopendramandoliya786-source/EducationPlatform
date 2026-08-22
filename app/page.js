'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '../lib/supabase/client';
import { BookOpen, Sparkles, Trophy, HelpCircle, Download, ArrowRight, Layers, GraduationCap, ChevronRight } from 'lucide-react';

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
        const { data: examsData } = await supabase
          .from('exams')
          .select('*')
          .order('id', { ascending: true });

        if (examsData && examsData.length > 0) {
          setExams(examsData);
          setSelectedExam(examsData[0]);
          await loadSubjectsForExam(examsData[0].id);
        }
      } catch (err) {
        console.error('Data Load Error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const loadSubjectsForExam = async (examId) => {
    try {
      const { data: mappings } = await supabase
        .from('exam_subjects')
        .select('subject_id, subjects(*)')
        .eq('exam_id', examId);

      if (mappings) {
        const subs = mappings.map((m) => m.subjects).filter(Boolean);
        setSubjects(subs);
      }
    } catch (err) {
      console.error('Subjects Error:', err);
    }
  };

  const handleSelectExam = (exam) => {
    setSelectedExam(exam);
    loadSubjectsForExam(exam.id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Rajasthan Exam Prep</h1>
              <p className="text-xs text-slate-400">100% Free Syllabus & Test Platform</p>
            </div>
          </div>
          <Link
            href="/admin"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            Admin Panel
          </Link>
        </header>

        {/* Exam Switcher */}
        <section className="space-y-2">
          <span className="text-xs font-bold text-slate-400">लक्ष्य परीक्षा चुनें (Select Exam)</span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {exams.map((exam) => {
              const isSelected = selectedExam?.id === exam.id;
              return (
                <button
                  key={exam.id}
                  onClick={() => handleSelectExam(exam)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {exam.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* Selected Exam Card */}
        {selectedExam && (
          <section className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {selectedExam.board || 'Official Board'}
              </span>
              {selectedExam.syllabus_pdf_url && (
                <a
                  href={selectedExam.syllabus_pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline"
                >
                  <Download className="w-3.5 h-3.5" /> PDF Syllabus
                </a>
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">{selectedExam.name}</h2>
              <p className="text-xs text-slate-400 mt-1">{selectedExam.description}</p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-xs text-slate-400">
                शामिल विषय: <strong className="text-white">{subjects.length}</strong>
              </span>
              <Link
                href={`/exam/${selectedExam.slug}`}
                className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
              >
                विस्तृत सिलेबस <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        )}

        {/* Quick Action Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/notes" className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700">
            <BookOpen className="w-5 h-5 text-indigo-400 mb-2" />
            <h3 className="text-xs font-bold text-white">स्मार्ट नोट्स</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">थ्योरी एवं बुलेट पॉइंट्स</p>
          </Link>

          <Link href="/quiz" className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700">
            <Trophy className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="text-xs font-bold text-white">50 MCQs</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">टॉपिकवाइज़ मॉक टेस्ट</p>
          </Link>

          <Link href="/pyq" className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700">
            <Layers className="w-5 h-5 text-amber-400 mb-2" />
            <h3 className="text-xs font-bold text-white">100 PYQs</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">विगत वर्षों के प्रश्न</p>
          </Link>

          <Link href="/ai-tutor" className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700">
            <Sparkles className="w-5 h-5 text-purple-400 mb-2" />
            <h3 className="text-xs font-bold text-white">AI Tutor</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">24/7 लाइव डाउट सॉल्व</p>
          </Link>
        </section>

        {/* Subjects List */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300">पाठ्यक्रम विषय (Subjects)</h3>
          {subjects.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
              विषय लोड हो रहे हैं...
            </div>
          ) : (
            <div className="grid gap-2">
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs">
                      {sub.name.substring(0, 1)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{sub.name}</h4>
                      <p className="text-[10px] text-slate-400">चैप्टर एवं प्रैक्टिस टेस्ट उपलब्ध</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
