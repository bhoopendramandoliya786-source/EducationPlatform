import React from 'react';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/server';
import Navbar from '../components/Navbar';
import { 
  BookOpen, 
  ArrowLeft, 
  ChevronRight, 
  CheckCircle2, 
  GraduationCap
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SubjectsDirectoryPage() {
  const supabase = await createClient();

  const { data: subjects } = await supabase
    .from('subjects')
    .select('*, chapters(id, name, topics(count))')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return (
    <div className="min-h-screen bg-[#050711] text-slate-100 font-sans pb-28">
      <Navbar />

      <main className="max-w-md mx-auto px-4 pt-3 space-y-4">

        {/* Back Link */}
        <Link 
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
          <span>होम पर वापस जाएँ</span>
        </Link>

        {/* Header Banner */}
        <section className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/60 border border-indigo-500/30 space-y-2 shadow-xl">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase">
            Study Modules
          </span>
          <h1 className="text-xl font-black text-white">
            सभी अध्ययन विषय (Subjects)
          </h1>
          <p className="text-xs text-slate-300">
            चैप्टर-वार स्मार्ट नोट्स, MCQs और पिछले वर्षों के महत्वपूर्ण प्रश्न।
          </p>
        </section>

        {/* Subjects List */}
        <section className="space-y-3">
          {subjects && subjects.length > 0 ? (
            subjects.map((sub) => {
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
                      <h2 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {sub.name}
                      </h2>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {sub.description || 'सभी महत्वपूर्ण चैप्टर्स और विगत वर्षों के प्रश्न।'}
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-indigo-600 transition-all shrink-0 mt-1">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      स्मार्ट नोट्स + MCQs
                    </span>
                    <span className="text-indigo-400 font-bold group-hover:underline">
                      पढ़ना शुरू करें →
                    </span>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-500">
              कोई विषय उपलब्ध नहीं है।
            </div>
          )}
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