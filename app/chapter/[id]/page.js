import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import Navbar from '../../components/Navbar';
import { 
  ArrowLeft, 
  BookOpen, 
  HelpCircle, 
  ChevronRight, 
  Layers, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ChapterPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Chapter and Parent Subject
  const { data: chapter } = await supabase
    .from('chapters')
    .select('*, subjects(id, name)')
    .eq('id', id)
    .single();

  if (!chapter) {
    notFound();
  }

  // 2. Fetch Topics inside this chapter
  const { data: topics } = await supabase
    .from('topics')
    .select('*, questions(count)')
    .eq('chapter_id', id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const totalTopics = topics ? topics.length : 0;

  return (
    <div className="min-h-screen bg-[#050711] text-slate-100 font-sans pb-28 selection:bg-indigo-500/30">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-6">

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link 
            href={`/subject/${chapter.subjects?.id}`}
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors bg-slate-900/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-800 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold">{chapter.subjects?.name}</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-indigo-400 font-bold truncate max-w-[200px]">
            {chapter.name}
          </span>
        </div>

        {/* Chapter Overview Banner */}
        <section className="relative overflow-hidden bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/60 border border-indigo-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                <Layers className="w-3 h-3 text-indigo-400" />
                अध्याय (Chapter Core)
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                High-Yield Module
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {chapter.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {chapter.description || 'इस अध्याय के सभी विषयों का सिलसिलेवार अध्ययन करें, स्मार्ट नोट्स पढ़ें और अभ्यास प्रश्न हल करें।'}
            </p>
          </div>

          <div className="relative z-10 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-slate-300 font-medium">
              <span className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                कुल <strong className="text-white">{totalTopics} Topics</strong> शामिल हैं
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                100% परीक्षा उपयोगी
              </span>
            </div>

            <Link
              href="/ai-tutor"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI ट्यूटर सहायता
            </Link>
          </div>
        </section>

        {/* Topics List */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>विषय सूची (Topics)</span>
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              Total {totalTopics}
            </span>
          </div>

          <div className="space-y-3">
            {topics && topics.length > 0 ? (
              topics.map((topic, index) => {
                const questionCount = topic.questions?.[0]?.count || 0;

                return (
                  <Link
                    key={topic.id}
                    href={`/topic/${topic.id}`}
                    className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800/90 hover:border-indigo-500/50 rounded-2xl p-4 sm:p-5 transition-all duration-200 block shadow-lg space-y-3.5 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <span className="w-9 h-9 rounded-xl bg-slate-800/90 text-indigo-300 border border-slate-700/80 font-black text-xs flex items-center justify-center shrink-0 group-hover:border-indigo-500/50 group-hover:bg-indigo-600/20 transition-all shadow-inner">
                          {index + 1}
                        </span>
                        <div className="space-y-0.5 truncate">
                          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                            {topic.name}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {topic.description || 'स्मार्ट नोट्स पढ़ें और अभ्यास प्रश्न हल करें।'}
                          </p>
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all shrink-0">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 text-xs text-slate-400">
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1.5 text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                          Smart Notes
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-300 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
                          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                          {questionCount} Questions
                        </span>
                      </div>
                      <span className="text-indigo-400 font-bold group-hover:underline flex items-center gap-1 text-xs">
                        टॉपिक शुरू करें →
                      </span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500">
                इस अध्याय में अभी कोई टॉपिक मौजूद नहीं है।
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Universal Bottom App Bar */}
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
            href="/student"
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