'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { ArrowLeft, ChevronRight, BookOpen, Trophy } from 'lucide-react';

export default function ExamDetailPage() {
  const { slug } = useParams();
  const [exam, setExam] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadExam() {
      const { data } = await supabase.from('exams').select('*').eq('slug', slug).single();
      if (data) {
        setExam(data);
        const { data: mappings } = await supabase.from('exam_subjects').select('subjects(*)').eq('exam_id', data.id);
        if (mappings) setSubjects(mappings.map((m) => m.subjects).filter(Boolean));
      }
      setLoading(false);
    }
    loadExam();
  }, [slug]);

  if (loading) return <div className="p-6 text-xs text-slate-400">लोड हो रहा है...</div>;
  if (!exam) return <div className="p-6 text-xs text-rose-400">परीक्षा नहीं मिली।</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-3 space-y-4">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
        <ArrowLeft className="w-3.5 h-3.5" /> होम पर वापस जाएँ
      </Link>

      <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/20 space-y-2 shadow-xl">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {exam.board || 'Official Exam'}
        </span>
        <h1 className="text-xl font-black text-white">{exam.name}</h1>
        <p className="text-xs text-slate-300">{exam.description}</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300">पाठ्यक्रम विषय (Syllabus Subjects)</h3>
        <div className="grid gap-2.5">
          {subjects.map((sub) => (
            <div key={sub.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">{sub.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">स्मार्ट नोट्स + 50 MCQs</p>
              </div>
              <Link href="/quiz" className="px-3 py-1.5 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-500 active:scale-95 transition">
                अध्ययन शुरू करें →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
