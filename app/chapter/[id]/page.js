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
  FileText, 
  Sparkles 
} from 'lucide-react';

export const revalidate = 60;

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
    .select('*, questions(count), notes(count)')
    .eq('chapter_id', id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans pb-24 selection:bg-blue-500/30">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link 
            href={`/subject/${chapter.subjects?.id}`}
            className="inline-flex items-center gap-1 hover:text-white transition-colors bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{chapter.subjects?.name}</span>
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-semibold truncate max-w-[200px]">
            {chapter.name}
          </span>
        </div>

        {/* Chapter Overview */}
        <section className="bg-gradient-to-br from-slate-900 via-[#111726] to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-3">
          <div className="space-y-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
              अध्याय (Chapter)
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {chapter.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {chapter.description || 'इस अध्याय के सभी विषयों का सिलसिलेवार अध्ययन करें।'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400">
            कुल <span className="text-white font-bold">{topics?.length || 0} Topics</span> शामिल हैं
          </div>
        </section>

        {/* Topics List */}
        <section className="space-y-3.5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>विषय सूची (Topics)</span>
          </h2>

          <div className="space-y-3">
            {topics && topics.length > 0 ? (
              topics.map((topic, index) => {
                const questionCount = topic.questions?.[0]?.count || 0;
                const noteCount = topic.notes?.[0]?.count || 0;

                return (
                  <Link
                    key={topic.id}
                    href={`/topic/${topic.id}`}
                    className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 transition-all block shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                            {topic.name}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {topic.description || 'नोट्स पढ़ें, MCQs और PYQs का अभ्यास करें।'}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/60 text-[11px] text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-slate-300">
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          {noteCount} Notes
                        </span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                          {questionCount} Questions
                        </span>
                      </div>
                      <span className="text-amber-400 font-semibold group-hover:underline">
                        Start Topic →
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
    </div>
  );
}