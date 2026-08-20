import React from 'react';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/server';
import Navbar from '../components/Navbar';
import { Zap, Trophy, ArrowRight, ChevronRight, Layers, Award } from 'lucide-react';

export const revalidate = 60;

export default async function QuizMainPage() {
  const supabase = await createClient();

  // Fetch Topics with Question Counts
  const { data: topics } = await supabase
    .from('topics')
    .select('*, questions(count), chapters(name, subjects(name))')
    .eq('is_active', true)
    .order('id', { ascending: false });

  return (
    <div className="min-h-screen bg-[#050711] text-slate-100 font-sans pb-28">
      <Navbar />

      <main className="max-w-md mx-auto px-4 pt-3 space-y-4">

        {/* Banner */}
        <section className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/60 border border-indigo-500/30 space-y-2 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase">
              Speed Tests
            </span>
          </div>
          <h1 className="text-xl font-black text-white">
            डेली स्पीड क्विज़ & टेस्ट सीरीज़ 🎯
          </h1>
          <p className="text-xs text-slate-300">
            प्रत्येक टॉपिक के समयबद्ध (Timed) टेस्ट दें, XP पॉइंट्स जीतें और लाइव रैंक देखें।
          </p>
        </section>

        {/* Quiz Topics List */}
        <section className="space-y-2.5">
          {topics && topics.length > 0 ? (
            topics.map((top) => {
              const qCount = top.questions?.[0]?.count || 0;
              return (
                <Link
                  key={top.id}
                  href={`/quiz/${top.id}`}
                  className="group p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/90 hover:border-emerald-500/40 transition-all flex items-center justify-between gap-3 shadow-lg"
                >
                  <div className="space-y-1 truncate">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
                      {top.chapters?.subjects?.name} › {top.chapters?.name}
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                      {top.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{qCount} Questions</span>
                      <span>•</span>
                      <span className="text-amber-400 font-semibold">+50 XP</span>
                    </div>
                  </div>

                  <div className="px-3 py-2 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                    Start Test ➔
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-500">
              कोई क्विज़ उपलब्ध नहीं है।
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

          <Link href="/subject" className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200">
            <span className="text-base">📚</span>
            <span>नोट्स</span>
          </Link>

          <Link href="/ai-tutor" className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200">
            <div className="w-10 h-10 -mt-5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 text-lg border-2 border-[#050711] animate-pulse">
              ✨
            </div>
            <span className="text-indigo-300 font-bold text-[10px]">AI सुपर</span>
          </Link>

          <Link href="/quiz" className="flex flex-col items-center gap-1 text-[11px] font-semibold text-indigo-400">
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