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
  CheckCircle2, 
  Flame, 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Compass, 
  User 
} from 'lucide-react';

// 60-second caching for high performance
export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Fetch Active Subjects with Chapter Counts
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*, chapters(count)')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  // 2. Fetch High-Yield Topics (Connected Database)
  const { data: recentTopics } = await supabase
    .from('topics')
    .select('id, name, slug, chapters(name, subjects(name))')
    .eq('is_active', true)
    .order('id', { ascending: false })
    .limit(4);

  return (
    <div className="min-h-screen bg-[#050711] text-slate-100 font-sans pb-28 selection:bg-indigo-500/30">

      {/* Top Navbar */}
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-6">

        {/* 2026 Ultra Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/60 border border-indigo-500/30 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                2026 AI सुपर लर्निंग कोर
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-sm">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                7-Day Streak 🔥
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-snug">
              तैयारी को बनाएं <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">10x स्मार्ट व सुपर-फ़ास्ट</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              50,000+ टॉपिक-वाइज़ MCQs, 4K विजुअल्स, पिछले 10 वर्षों के PYQs और 24/7 AI ट्यूटर — सब कुछ एक ही जगह।
            </p>

            {/* Action Buttons inside Hero */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              <Link
                href="/ai-tutor"
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                AI ट्यूटर से पूछें
              </Link>
              <Link
                href="/quiz"
                className="px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                डेली टेस्ट शुरू करें
              </Link>
            </div>

            {/* Connected Live Search */}
            <div className="pt-3 max-w-xl">
              <SearchBox />
            </div>
          </div>
        </section>

        {/* 4 Core VIP Feature Cards (2x2 on Mobile, 4-Col on Desktop) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>मुख्य फीचर्स (Core Platform)</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Card 1: Notes */}
            <Link 
              href="/subject" 
              className="group p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all duration-200 text-left flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    High Yield
                  </span>
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-indigo-300 transition-colors">
                  Notes & Study
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">रिविजन नोट्स & मैप्स</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-indigo-400 font-semibold">
                <span>पढ़ना शुरू करें</span>
                <span className="group-hover:translate-x-1 transition">➔</span>
              </div>
            </Link>

            {/* Card 2: Daily MCQs */}
            <Link 
              href="/quiz" 
              className="group p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all duration-200 text-left flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Live Rank
                  </span>
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-300 transition-colors">
                  Daily MCQs
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">50 प्रश्न डेली + टाइमर</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
                <span>टेस्ट दें</span>
                <span className="group-hover:translate-x-1 transition">➔</span>
              </div>
            </Link>

            {/* Card 3: 100+ PYQs */}
            <Link 
              href="/subject" 
              className="group p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all duration-200 text-left flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Verified
                  </span>
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors">
                  100+ PYQs
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">पिछले साल के हल पेपर</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-amber-400 font-semibold">
                <span>अभ्यास करें</span>
                <span className="group-hover:translate-x-1 transition">➔</span>
              </div>
            </Link>

            {/* Card 4: AI Tutor */}
            <Link 
              href="/ai-tutor" 
              className="group p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all duration-200 text-left flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    GPT-4o Pro
                  </span>
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-purple-300 transition-colors">
                  AI Visual Tutor
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">4K फोटो & लाइव डाउट</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-purple-400 font-semibold">
                <span>ओपन ट्यूटर</span>
                <span className="group-hover:translate-x-1 transition">➔</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Dynamic Subjects List (Connected from DB) */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>प्रमुख विषय (Subjects)</span>
            </h2>
            <Link href="/subject" className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
              <span>सभी देखें</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {subjects && subjects.length > 0 ? (
              subjects.map((sub) => {
                const chapterCount = sub.chapters?.[0]?.count || 0;
                return (
                  <Link
                    key={sub.id}
                    href={`/subject/${sub.id}`}
                    className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800/90 hover:border-indigo-500/40 rounded-2xl p-4 sm:p-5 transition-all block shadow-lg space-y-3 backdrop-blur-sm"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {chapterCount} चैप्टर्स शामिल
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          प्रगति: <strong className="text-emerald-400">80%</strong>
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                        {sub.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {sub.description || 'इस विषय के सभी महत्वपूर्ण चैप्टर्स और पिछले वर्षों के प्रश्न।'}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        स्मार्ट नोट्स + MCQs
                      </span>
                      <span className="font-semibold text-indigo-400 group-hover:underline flex items-center gap-0.5 text-xs">
                        पढ़ना शुरू करें →
                      </span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-500">
                विषय लोड हो रहे हैं...
              </div>
            )}
          </div>
        </section>

        {/* Trending High-Yield Topics (Connected from DB) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>ट्रेंडिंग टॉपिक्स (Must Prepare)</span>
            </h2>
            <Link href="/subject" className="text-xs text-slate-400 hover:text-slate-200">
              Explore All ➔
            </Link>
          </div>

          <div className="space-y-2">
            {recentTopics && recentTopics.length > 0 ? (
              recentTopics.map((top, idx) => (
                <Link
                  key={top.id}
                  href={`/topic/${top.id}`}
                  className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-3.5 sm:p-4 transition-all flex items-center justify-between group shadow-md"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                      {idx + 1}
                    </div>
                    <div className="truncate">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                        {top.chapters?.subjects?.name} › {top.chapters?.name}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors truncate">
                        {top.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold hidden sm:inline-block">
                      +50 XP
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))
            ) : null}
          </div>
        </section>

      </main>

      {/* 2026 VIP Fixed Bottom App Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#050711]/90 backdrop-blur-2xl border-t border-slate-800/80 px-4 py-2">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-[11px] font-semibold text-indigo-400 transition"
          >
            <span className="text-lg">🏠</span>
            <span>होम</span>
          </Link>

          <Link
            href="/subject"
            className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <span className="text-lg">📚</span>
            <span>नोट्स</span>
          </Link>

          {/* Center Floating AI Super Button */}
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