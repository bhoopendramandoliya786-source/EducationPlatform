import React from 'react';
import Link from 'next/link';
import { createClient } from '../lib/supabase/server';
import Navbar from './components/Navbar';
import SearchBox from './components/SearchBox';
import { 
  BookOpen, 
  Award, 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  Zap, 
  Flame, 
  CheckCircle2, 
  TrendingUp, 
  GraduationCap,
  Trophy,
  Download,
  FileText
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const selectedExamSlug = resolvedSearchParams?.exam || 'all';

  const supabase = await createClient();

  // 1. Fetch Active Exams
  const { data: exams } = await supabase
    .from('exams')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  // Current Selected Exam Details (if any)
  const currentExam = exams?.find(e => e.slug === selectedExamSlug);

  // 2. Fetch Subjects based on Selected Exam
  const { data: rawSubjects } = await supabase
    .from('subjects')
    .select('*, chapters(count), exam_subjects(exam_id, exams(slug))')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const subjects = selectedExamSlug === 'all'
    ? rawSubjects
    : (rawSubjects || []).filter(sub => 
        sub.exam_subjects?.some(es => es.exams?.slug === selectedExamSlug)
      );

  // 3. Fetch High-Yield Topics
  const { data: recentTopics } = await supabase
    .from('topics')
    .select('id, name, slug, chapters(name, subjects(name))')
    .eq('is_active', true)
    .order('id', { ascending: false })
    .limit(4);

  return (
    <div className="min-h-screen bg-[#050711] text-slate-100 font-sans pb-28">
      {/* Top Navbar */}
      <Navbar />

      <main className="max-w-md mx-auto px-4 pt-3 space-y-5">

        {/* Daily Target / Greeting Banner */}
        <section className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-purple-950/50 border border-indigo-500/20 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                ● 2026 AI लर्निंग
              </span>
              <h1 className="text-lg font-black text-white">
                नमस्ते, आज का लक्ष्य पूरा करें 🎯
              </h1>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold shrink-0">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
              <span>7 Days</span>
            </div>
          </div>
          <SearchBox />
        </section>

        {/* Target Exam Horizontal Switcher */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>लक्ष्य परीक्षा (Select Target Exam)</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                selectedExamSlug === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-500/50 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              🔥 All Exams
            </Link>

            {exams && exams.map((ex) => {
              const active = selectedExamSlug === ex.slug;
              return (
                <Link
                  key={ex.id}
                  href={`/?exam=${ex.slug}`}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                    active
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black border-amber-400 shadow-md shadow-amber-500/20 scale-105'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800'
                  }`}
                >
                  {ex.name}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Selected Exam Syllabus & PDF Action Card (Shown when an exam is clicked) */}
        {currentExam && (
          <section className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-indigo-950/40 border border-amber-500/30 space-y-3 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {currentExam.category || 'Target Syllabus'}
                </span>
                <h3 className="text-base font-black text-white mt-1">
                  {currentExam.name}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-1">
                  {currentExam.description || 'पाठ्यक्रम, विगत वर्षों के प्रश्न और स्मार्ट नोट्स।'}
                </p>
              </div>
              <Link
                href={`/exam/${currentExam.slug}`}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1 shadow-md shadow-amber-500/20"
              >
                <span>विस्तृत सिलेबस</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
              {currentExam.syllabus_pdf_url ? (
                <a
                  href={currentExam.syllabus_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Syllabus PDF डाउनलोड करें</span>
                </a>
              ) : (
                <Link
                  href={`/exam/${currentExam.slug}`}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>परीक्षा पैटर्न व सिलेबस देखें</span>
                </Link>
              )}
            </div>
          </section>
        )}

        {/* 4 Core Action Cards */}
        <section className="grid grid-cols-2 gap-2.5">
          <Link href="/subject" className="p-3.5 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-900/80 border border-indigo-500/20 hover:border-indigo-500/50 transition-all flex flex-col justify-between h-24 group shadow-md">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Notes</span>
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-indigo-300 transition-colors">स्मार्ट नोट्स</h3>
              <p className="text-[10px] text-slate-400">सभी विषयों के सार</p>
            </div>
          </Link>

          <Link href="/quiz" className="p-3.5 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-slate-900/80 border border-emerald-500/20 hover:border-emerald-500/50 transition-all flex flex-col justify-between h-24 group shadow-md">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Live</span>
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-300 transition-colors">डेली क्विज़</h3>
              <p className="text-[10px] text-slate-400">50 MCQs + टाइमर</p>
            </div>
          </Link>

          <Link href="/subject" className="p-3.5 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-900/80 border border-amber-500/20 hover:border-amber-500/50 transition-all flex flex-col justify-between h-24 group shadow-md">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">PYQs</span>
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors">100+ PYQs</h3>
              <p className="text-[10px] text-slate-400">विगत वर्षों के पेपर</p>
            </div>
          </Link>

          <Link href="/ai-tutor" className="p-3.5 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900/80 border border-purple-500/20 hover:border-purple-500/50 transition-all flex flex-col justify-between h-24 group shadow-md">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">AI 4o</span>
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-purple-300 transition-colors">AI ट्यूटर</h3>
              <p className="text-[10px] text-slate-400">24/7 लाइव डाउट</p>
            </div>
          </Link>
        </section>

        {/* Subjects Visual Cards */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>प्रमुख विषय (Subjects)</span>
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
                    className="group p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all block space-y-2.5 shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {chapterCount} Chapters
                        </span>
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {sub.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {sub.description || 'इस विषय के सभी थ्योरी नोट्स और पिछले वर्षों के प्रश्न।'}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-indigo-600 transition-all shrink-0">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        स्मार्ट नोट्स + MCQs
                      </span>
                      <span className="text-indigo-400 font-semibold group-hover:underline">
                        पढ़ना शुरू करें →
                      </span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="p-6 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-500">
                इस परीक्षा के लिए विषय जल्द जोड़े जा रहे हैं।
              </div>
            )}
          </div>
        </section>

        {/* Must-Prepare Trending Topics */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>ट्रेंडिंग टॉपिक्स (Must Read)</span>
            </h2>
          </div>

          <div className="space-y-2">
            {recentTopics && recentTopics.length > 0 ? (
              recentTopics.map((top, idx) => (
                <Link
                  key={top.id}
                  href={`/topic/${top.id}`}
                  className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800/90 hover:border-amber-500/30 rounded-xl p-3 transition-all flex items-center justify-between group shadow-sm"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/80 text-xs font-bold text-indigo-300 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
                        {top.chapters?.subjects?.name} › {top.chapters?.name}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-amber-400 transition-colors truncate">
                        {top.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      +50 XP
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))
            ) : null}
          </div>
        </section>
      </main>

      {/* Universal Fixed Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#050711]/95 backdrop-blur-2xl border-t border-slate-800/80 px-4 py-2">
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