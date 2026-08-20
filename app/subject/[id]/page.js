import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import Navbar from '../../components/Navbar';
import { 
  ArrowLeft, 
  BookOpen, 
  Layers, 
  ChevronRight, 
  CheckCircle2, 
  GraduationCap,
  Sparkles
} from 'lucide-react';

export const revalidate = 60;

export default async function SubjectDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Subject Info
  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', id)
    .single();

  if (!subject) {
    notFound();
  }

  // 2. Fetch Chapters with Topics count
  const { data: chapters } = await supabase
    .from('chapters')
    .select('*, topics(count)')
    .eq('subject_id', id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const totalChapters = chapters ? chapters.length : 0;

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

        {/* 2026 VIP Subject Header Banner */}
        <section className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/60 border border-indigo-500/30 space-y-3 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
              <GraduationCap className="w-3 h-3 text-indigo-400" />
              विषय (Subject Core)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              {totalChapters} Chapters
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-black text-white tracking-tight">
              {subject.name}
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              {subject.description || 'इस विषय के सभी महत्वपूर्ण चैप्टर्स, थ्योरी नोट्स, और विगत वर्षों के प्रश्नों का संपूर्ण संकलन।'}
            </p>
          </div>

          <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              स्मार्ट नोट्स + MCQs
            </span>
            <Link
              href="/ai-tutor"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white text-[11px] font-bold shadow-md shadow-indigo-600/20"
            >
              <Sparkles className="w-3 h-3" />
              AI ट्यूटर
            </Link>
          </div>
        </section>

        {/* Chapters List */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>अध्याय सूची (Chapters)</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Total {totalChapters}
            </span>
          </div>

          <div className="space-y-2.5">
            {chapters && chapters.length > 0 ? (
              chapters.map((chapter, index) => {
                const topicCount = chapter.topics?.[0]?.count || 0;
                return (
                  <Link
                    key={chapter.id}
                    href={`/chapter/${chapter.id}`}
                    className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800/90 hover:border-indigo-500/50 rounded-2xl p-4 transition-all duration-200 flex items-center justify-between gap-3 shadow-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-800/90 border border-slate-700/80 text-indigo-300 font-black text-xs flex items-center justify-center shrink-0 group-hover:border-indigo-500/50 group-hover:bg-indigo-600/20 transition-all">
                        {index + 1}
                      </div>
                      <div className="space-y-0.5 truncate">
                        <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                          {chapter.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {chapter.description || `${topicCount} टॉपिक उपलब्ध हैं • हाई यील्ड`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-[10px] font-bold text-indigo-300 border border-indigo-500/20">
                        {topicCount} Topics
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-slate-800/60 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-indigo-600 transition-all">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500">
                इस विषय में अभी कोई चैप्टर उपलब्ध नहीं है।
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Universal Fixed Bottom App Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#050711]/95 backdrop-blur-2xl border-t border-slate-800/80 px-4 py-2">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200"
          >
            <span className="text-base">🏠</span>
            <span>होम</span>
          </Link>

          <Link
            href="/subject"
            className="flex flex-col items-center gap-1 text-[11px] font-semibold text-indigo-400"
          >
            <span className="text-base">📚</span>
            <span>नोट्स</span>
          </Link>

          {/* Floating AI Super Button */}
          <Link
            href="/ai-tutor"
            className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200"
          >
            <div className="w-10 h-10 -mt-5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 text-lg border-2 border-[#050711] animate-pulse">
              ✨
            </div>
            <span className="text-indigo-300 font-bold text-[10px]">AI सुपर</span>
          </Link>

          <Link
            href="/quiz"
            className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200"
          >
            <span className="text-base">🎯</span>
            <span>क्विज़</span>
          </Link>

          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200"
          >
            <span className="text-base">👤</span>
            <span>प्रोफ़ाइल</span>
          </Link>
        </div>
      </nav>

    </div>
  );
}