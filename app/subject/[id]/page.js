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
  GraduationCap 
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

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans pb-24 selection:bg-blue-500/30">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Back Link */}
        <Link 
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>मुख्य पृष्ठ (Home)</span>
        </Link>

        {/* Subject Header Card */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#111726] to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold tracking-wider uppercase">
              <GraduationCap className="w-3.5 h-3.5" />
              विषय (Subject Module)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {subject.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              {subject.description || 'इस विषय के सभी महत्वपूर्ण चैप्टर्स, थ्योरी नोट्स और पिछले वर्षों के प्रश्नों का संपूर्ण संकलन।'}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center gap-4 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Layers className="w-4 h-4 text-blue-400" />
              {chapters ? chapters.length : 0} चैप्टर्स
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              परीक्षा उपयोगी संपूर्ण सामग्री
            </span>
          </div>
        </section>

        {/* Chapters Section */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              अध्याय सूची (Chapters)
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Total {chapters?.length || 0}
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
                    className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-4 sm:p-5 transition-all flex items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800/90 border border-slate-700/80 text-blue-400 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 group-hover:border-blue-500/40 group-hover:bg-blue-500/10 transition-colors">
                        {index + 1}
                      </div>
                      <div className="space-y-0.5 truncate">
                        <h3 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors truncate">
                          {chapter.name}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1">
                          {chapter.description || `${topicCount} टॉपिक उपलब्ध हैं`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-medium text-slate-400 border border-slate-700/50">
                        {topicCount} Topics
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-blue-600 transition-all">
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
    </div>
  );
}