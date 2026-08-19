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
  Flame 
} from 'lucide-react';

// Revalidate data every 60 seconds (50L students caching)
export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Fetch Subjects with Chapter Counts
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*, chapters(count)')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  // 2. Fetch High-Yield Topics (Featured)
  const { data: recentTopics } = await supabase
    .from('topics')
    .select('id, name, slug, chapters(name, subjects(name))')
    .eq('is_active', true)
    .order('id', { ascending: false })
    .limit(4);

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans pb-24 selection:bg-blue-500/30">
      
      {/* Dynamic Navigation */}
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-8">
        
        {/* Hero Section */}
        <section className="text-center space-y-4 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            50 लाख+ छात्रों का भरोसेमंद स्मार्ट प्लेटफ़ॉर्म
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            अपनी तैयारी को बनाएं <span className="bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-transparent">10x स्मार्ट और सुपर-फ़ास्ट</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            कक्षा-वार नोट्स, 50,000+ टॉपिक-वाइज़ MCQs, 100+ परीक्षाओं के PYQs और 24/7 AI ट्यूटर — सब कुछ एक ही जगह।
          </p>

          {/* LIVE SEARCHBOX COMPONENT */}
          <div className="pt-2 max-w-xl mx-auto">
            <SearchBox />
          </div>
        </section>

        {/* 4 Quick Modules Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link 
            href="/subject" 
            className="group p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all text-left space-y-2 shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-white">Notes & Study</h3>
              <p className="text-[11px] text-slate-400">रिविजन नोट्स</p>
            </div>
          </Link>

          <Link 
            href="/quiz" 
            className="group p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all text-left space-y-2 shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-white">Daily MCQs</h3>
              <p className="text-[11px] text-slate-400">50 प्रश्न डेली</p>
            </div>
          </Link>

          <Link 
            href="/subject" 
            className="group p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all text-left space-y-2 shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-white">100+ PYQs</h3>
              <p className="text-[11px] text-slate-400">पिछले साल के पेपर</p>
            </div>
          </Link>

          <Link 
            href="/ai-tutor" 
            className="group p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-all text-left space-y-2 shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-white">AI Tutor</h3>
              <p className="text-[11px] text-slate-400">डाउट क्लियरिंग</p>
            </div>
          </Link>
        </section>

        {/* Subjects List */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>प्रमुख विषय (Subjects)</span>
            </h2>
            <Link href="/subject" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
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
                    className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/30 rounded-2xl p-5 transition-all block shadow-sm space-y-3"
                  >
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {chapterCount} चैप्टर्स शामिल
                      </span>
                      <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                        {sub.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {sub.description || 'इस विषय के सभी महत्वपूर्ण चैप्टर्स और पिछले वर्षों के प्रश्न।'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        स्मार्ट नोट्स + MCQs
                      </span>
                      <span className="font-semibold text-blue-400 group-hover:underline flex items-center gap-0.5">
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

        {/* Trending High-Yield Topics */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>ट्रेंडिंग टॉपिक्स (Must Read)</span>
          </h2>

          <div className="space-y-2">
            {recentTopics && recentTopics.length > 0 ? (
              recentTopics.map((top) => (
                <Link
                  key={top.id}
                  href={`/topic/${top.id}`}
                  className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-xl p-3.5 transition-all flex items-center justify-between group"
                >
                  <div className="truncate">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                      {top.chapters?.subjects?.name} › {top.chapters?.name}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-amber-400 transition-colors truncate">
                      {top.name}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
                </Link>
              ))
            ) : null}
          </div>
        </section>

      </main>
    </div>
  );
}