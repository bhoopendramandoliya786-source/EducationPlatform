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
  Sparkles,
  Zap,
  Award,
  TrendingUp
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
    <div className="min-h-screen bg-[#050711] text-slate-100 font-sans pb-28 selection:bg-indigo-500/30">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-6">
        
        {/* Back Link */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors bg-slate-900/80 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-800 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-400" />
          <span>मुख्य पृष्ठ (Home)</span>
        </Link>

        {/* 2026 VIP Subject Header Banner */}
        <section className="relative overflow-hidden bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/60 border border-indigo-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                विषय मॉड्यूल (Subject Core)
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                80% Syllabus Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {subject.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {subject.description || 'इस विषय के सभी महत्वपूर्ण चैप्टर्स, थ्योरी नोट्स, 4K डायग्राम्स और विगत वर्षों के प्रश्नों का संपूर्ण संकलन।'}
            </p>
          </div>

          <div className="relative z-10 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-slate-300 font-medium">
              <span className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <strong>{totalChapters}</strong> चैप्टर्स
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                स्मार्ट नोट्स + MCQs
              </span>
            </div>

            <Link
              href="/ai-tutor"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI से सवाल पूछें
            </Link>
          </div>
        </section>

        {/* Chapters Section */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>अध्याय सूची (Chapters)</span>
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
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
                    className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800/90 hover:border-indigo-500/50 rounded-2xl p-4 sm:p-5 transition-all duration-200 flex items-center justify-between gap-4 shadow-lg backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-indigo-300 font-black text-xs sm:text-sm flex items-center justify-center shrink-0 group-hover:border-indigo-500/50 group-hover:bg-indigo-600/20 transition-all shadow-inner">
                        {index + 1}
                      </div>
                      <div className="space-y-1 truncate">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                            {chapter.name}
                          </h3>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1">
                          {chapter.description || `${topicCount} टॉपिक उपलब्ध हैं • हाई यील्ड`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 text-[11px] font-bold text-indigo-300 border border-indigo-500/20">
                        {topicCount} Topics
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all">
                        <ChevronRight className="w-4 h-4" />
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

      {/* 2026 VIP Universal Bottom App Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#050711]/90 backdrop-blur-2xl border-t border-slate-800/80 px-4 py-2">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <span className="text-lg">🏠</span>
            <span>होम</span>
          </Link>

          <Link
            href="/subject"
            className="flex flex-col items-center gap-1 text-[11px] font-semibold text-indigo-400 transition"
          >
            <span className="text-lg">📚</span>
            <span>नोट्स</span>
          </Link>

          {/* Floating AI Super Button */}
          <Link
            href="/ai-tutor"
            className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <div className="w-11 h-11 -mt-6 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/40 text-xl border-2 border-[#050711] animate-pulse">
              ✨
            </div>
            <span className="text-indigo-300 font-bold">AI सुपर</span>
          </Link>

          <Link
            href="/quiz"
            className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <span className="text-lg">🎯</span>
            <span>क्विज़</span>
          </Link>

          <Link
            href="/subject"
            className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <span className="text-lg">👤</span>
            <span>प्रोफ़ाइल</span>
          </Link>
        </div>
      </nav>

    </div>
  );
}