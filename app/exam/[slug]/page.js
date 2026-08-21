import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import Navbar from '../../components/Navbar';
import { 
  ArrowLeft, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  Download, 
  FileText, 
  Zap 
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ExamSyllabusPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Fetch Exam Details
  const { data: exam } = await supabase
    .from('exams')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!exam) {
    notFound();
  }

  // 2. Fetch Subjects mapped to this Exam
  const { data: examSubjects } = await supabase
    .from('exam_subjects')
    .select(`
      sort_order,
      subjects (
        id,
        name,
        slug,
        description,
        chapters (
          id,
          name,
          topics (count)
        )
      )
    `)
    .eq('exam_id', exam.id)
    .order('sort_order', { ascending: true });

  const mappedSubjects = (examSubjects || [])
    .map(es => es.subjects)
    .filter(Boolean);

  const totalChapters = mappedSubjects.reduce(
    (acc, sub) => acc + (sub.chapters?.length || 0), 
    0
  );

  return (
    <div className="min-h-screen bg-[#050711] text-slate-100 font-sans pb-28">
      <Navbar />

      <main className="max-w-md mx-auto px-4 pt-3 space-y-4">
        
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
          <span>होम पर वापस जाएँ</span>
        </Link>

        {/* Exam Hero Banner */}
        <section className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/60 border border-indigo-500/30 space-y-3.5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
              <Award className="w-3 h-3 text-amber-400" />
              {exam.category || 'Target Exam'}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              {mappedSubjects.length} Subjects • {totalChapters} Chapters
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-black text-white tracking-tight">
              {exam.name}
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              {exam.description || 'इस परीक्षा का आधिकारिक पाठ्यक्रम, विषयवार स्मार्ट नोट्स और विगत वर्षों के प्रश्नों का संपूर्ण संकलन।'}
            </p>
          </div>

          {/* PDF Download Button (If Available) */}
          {exam.syllabus_pdf_url && (
            <a
              href={exam.syllabus_pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>डाउनलोड करें: आधिकारिक सिलेबस (Official PDF)</span>
            </a>
          )}

          <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% सिलेबस कवर्ड
            </span>
            <Link
              href={`/quiz?exam=${exam.slug}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-[11px] font-bold shadow-md shadow-amber-500/20 transition"
            >
              <Zap className="w-3 h-3" />
              PYQs & टेस्ट शुरू करें
            </Link>
          </div>
        </section>

        {/* Detailed Syllabus Text / Breakdown (If Available) */}
        {exam.syllabus_text && (
          <section className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>परीक्षा पैटर्न एवं महत्वपूर्ण निर्देश</span>
            </h2>
            <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 font-sans">
              {exam.syllabus_text}
            </div>
          </section>
        )}

        {/* Exam Syllabus (Subjects & Chapters) */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>पाठ्यक्रम विषय (Syllabus Subjects)</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Total {mappedSubjects.length}
            </span>
          </div>

          <div className="space-y-2.5">
            {mappedSubjects && mappedSubjects.length > 0 ? (
              mappedSubjects.map((sub) => {
                const chapters = sub.chapters || [];
                const totalTopics = chapters.reduce((acc, chap) => acc + (chap.topics?.[0]?.count || 0), 0);

                return (
                  <Link
                    key={sub.id}
                    href={`/subject/${sub.id}`}
                    className="group p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/90 hover:border-indigo-500/50 transition-all block space-y-3 shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {chapters.length} Chapters
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {totalTopics} Topics
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {sub.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {sub.description || 'विस्तृत नोट्स और अभ्यास प्रश्न।'}
                        </p>
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-indigo-600 transition-all shrink-0 mt-1">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        स्मार्ट नोट्स + 50 MCQs
                      </span>
                      <span className="text-indigo-400 font-bold group-hover:underline">
                        अध्ययन शुरू करें →
                      </span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-500">
                इस परीक्षा के लिए विषय जल्द जोड़े जा रहे हैं।
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Universal Fixed Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#050711]/95 backdrop-blur-2xl border-t border-slate-800/80 px-4 py-2">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <Link href="/" className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200">
            <span className="text-base">🏠</span>
            <span>होम</span>
          </Link>

          <Link href="/subject" className="flex flex-col items-center gap-1 text-[11px] font-semibold text-indigo-400">
            <span className="text-base">📚</span>
            <span>नोट्स</span>
          </Link>

          <Link href="/ai-tutor" className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200">
            <div className="w-10 h-10 -mt-5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 text-lg border-2 border-[#050711] animate-pulse">
              ✨
            </div>
            <span className="text-indigo-300 font-bold text-[10px]">AI सुपर</span>
          </Link>

          <Link href="/quiz" className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200">
            <span className="text-base">🎯</span>
            <span>क्विज़</span>
          </Link>

          <Link href="/student" className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200">
            <span className="text-base">👤</span>
            <span>प्रोफ़ाइल</span>
          </Link>
        </div>
      </nav>

    </div>
  );
}