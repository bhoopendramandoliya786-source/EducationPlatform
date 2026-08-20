import React from 'react';
import Link from 'next/link';
import { createClient } from '../lib/supabase/server';
import Navbar from './components/Navbar';
import SearchBox from './components/SearchBox';
import { 
  BookOpen, 
  HelpCircle, 
  Award, 
  Bot, 
  ArrowRight, 
  ChevronRight,
  Sparkles, 
  Zap, 
  Flame,
  Layers
} from 'lucide-react';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Fetch Subjects with Chapter Counts
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*, chapters(count)')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  // 2. Fetch High-Yield Topics
  const { data: recentTopics } = await supabase
    .from('topics')
    .select('id, name, slug, chapters(name, subjects(name))')
    .eq('is_active', true)
    .order('id', { ascending: false })
    .limit(4);

  return (
    <div className="min-h-screen bg-[#050711] text-slate-100 font-sans pb-28">

      {/* Top Clean Navbar */}
      <Navbar />

      <main className="max-w-xl mx-auto px-4 pt-4 space-y-6">

        {/* Clean Hero & Search Section */}
        <section className="space-y-3 text-center sm:text-left">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                नमस्ते, <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">स्मार्ट तैयारी</span> शुरू करें
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                50,000+ प्रश्न, नोट्स और 24/7 AI ट्यूटर
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold shrink-0">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>7 Days</span>
            </div>
          </div>

          {/* Live Search Component */}
          <div className="pt-1">
            <SearchBox />
          </div>
        </section>

        {/* 4 Core Action Cards (Clean & Modern 2x2 Grid) */}
        <section className="grid grid-cols-2 gap-3">

          <Link 
            href="/subject" 
            className="p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/90 hover:border-indigo-500/50 transition-all flex flex-col justify-between h-28 group"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                स्मार्ट नोट्स
              </h3>
              <p className="text-[11px] text-slate-400">सभी विषयों के सार</p>
            </div>
          </Link>

          <Link 
            href="/quiz" 
            className="p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/90 hover:border-emerald-500/50 transition-all flex flex-col justify-between h-28 group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                डेली क्विज़
              </h3>
              <p className="text-[11px] text-slate-400">50 प्रश्न + लाइव स्कोर</p>
            </div>
          </Link>

          <Link 
            href="/subject" 
            className="p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/90 hover:border-amber-500/50 transition-all flex flex-col justify-between h-28 group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                100+ PYQs
              </h3>
              <p className="text-[11px] text-slate-400">विगत वर्षों के हल पेपर</p>
            </div>
          </Link>

          <Link 
            href="/ai-tutor" 
            className="p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/90 hover:border-purple-500/50 transition-all flex flex-col justify-between h-28 group"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                AI ट्यूटर
              </h3>
              <p className="text-[11px] text-slate-400">24/7 तुरंत डाउट हल</p>
            </div>
          </Link>

        </section>

        {/* Subjects Section (Clean Single Cards) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              विषय (Subjects)
            </h2>
            <Link href="/subject" className="text-xs text-indigo-400 hover:underline font-semibold">
              सभी देखें →
            </Link>
          </div>

          <div className="space-y-2.5">
            {subjects && subjects.length > 0 ? (
              subjects.map((sub) => {
                const chapterCount = sub.chapters?.[0]?.count || 0;
                return (
                  <Link
                    key={sub.id}
                    href={`/subject/${sub.id}`}
                    className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800/90 hover:border-indigo-500/40 rounded-2xl p-4 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {chapterCount} Chapters
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                        {sub.name}
                      </h3>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-slate-800/60 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-indigo-600 transition-all shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Link>
                );
              })
            ) : null}
          </div>
        </section>

        {/* Must-Prepare Topics */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ट्रेंडिंग टॉपिक्स (Must Read)
            </h2>
          </div>

          <div className="space-y-2">
            {recentTopics && recentTopics.length > 0 ? (
              recentTopics.map((top, idx) => (
                <Link
                  key={top.id}
                  href={`/topic/${top.id}`}
                  className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-xs font-bold text-slate-400 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <div className="text-[10px] text-slate-500 uppercase truncate">
                        {top.chapters?.name}
                      </div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors truncate">
                        {top.name}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </Link>
              ))
            ) : null}
          </div>
        </section>

      </main>

      {/* Universal Fixed Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#050711]/90 backdrop-blur-xl border-t border-slate-800/80 px-4 py-2">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <Link href="/" className="flex flex-col items-center gap-1 text-[11px] font-semibold text-indigo-400">
            <span className="text-base">🏠</span>
            <span>होम</span>
          </Link>

          <Link href="/subject" className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200">
            <span className="text-base">📚</span>
            <span>नोट्स</span>
          </Link>

          <Link href="/ai-tutor" className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200">
            <div className="w-10 h-10 -mt-5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 text-lg border-2 border-[#050711]">
              ✨
            </div>
            <span className="text-indigo-300 font-bold text-[10px]">AI सुपर</span>
          </Link>

          <Link href="/quiz" className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200">
            <span className="text-base">🎯</span>
            <span>क्विज़</span>
          </Link>

          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200">
            <span className="text-base">👤</span>
            <span>प्रोफ़ाइल</span>
          </Link>
        </div>
      </nav>

    </div>
  );
}