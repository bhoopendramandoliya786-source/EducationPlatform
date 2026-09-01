import Link from "next/link";
import { 
  Trophy, 
  FolderTree, 
  Sparkles, 
  ChevronRight, 
  PlayCircle,
  Zap,
  Target
} from "lucide-react";
import StudentStreakCard from "./components/StudentStreakCard";

// 5 मिनट (300s) ISR कैशिंग - इससे सर्वर पर लोड 0 रहेगा और पेज <0.5s में खुलेगा
export const revalidate = 300; 

export default async function HomePage() {
  let subjects = [];
  let counts = { notes: 0, tests: 0, subjects: 0 };

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: { persistSession: false }, // सर्वर पर सेशन चेक न करके स्पीड बढ़ाता है
      }
    );

    // पैरेलल फ़ेचिंग (Parallel Execution)
    const [subsRes, notesRes, quizRes] = await Promise.all([
      supabase
        .from("subjects")
        .select("id, name, icon")
        .order("id", { ascending: true }),
      supabase.from("notes").select("id", { count: "exact", head: true }),
      supabase.from("questions").select("id", { count: "exact", head: true })
    ]);

    subjects = subsRes.data || [];
    counts = {
      notes: notesRes.count || 0,
      tests: quizRes.count || 0,
      subjects: subjects.length
    };
  } catch (e) {
    console.error("Data fetch error:", e);
  }

  return (
    <main className="max-w-md mx-auto px-4 space-y-4 pb-28 pt-1 font-sans select-none">

      {/* 1. Hero Live Challenge Card */}
      <section className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 space-y-3.5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-wider uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Rajasthan Exam Prep 2026
          </span>
          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> {counts.subjects} विषय उपलब्ध
          </span>
        </div>

        <div>
          <h1 className="text-xl font-black text-white tracking-tight leading-snug">
            राजस्थान GK महा-अभ्यास 🎯
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed mt-1">
            CET, REET, पटवार व पुलिस परीक्षा के लिए {counts.tests}+ टू-द-पॉइंट PYQ और महत्वपूर्ण नोट्स।
          </p>
        </div>

        {/* Start Live Test CTA */}
        <Link
          href="/quiz"
          prefetch={true}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition"
        >
          <PlayCircle className="w-4 h-4" />
          <span>आज का डेली टेस्ट शुरू करें (10 PYQ) →</span>
        </Link>
      </section>

      {/* 2. Real-time Student Streak & Progress Card */}
      <StudentStreakCard totalTests={counts.tests} />

      {/* 3. Subjects & Chapters List */}
      <section aria-label="Syllabus Subjects" className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white">पाठ्यक्रम विषय (Syllabus)</h2>
              <p className="text-[10px] text-slate-400">{subjects.length} विषय • अध्यायवार PYQ अभ्यास</p>
            </div>
          </div>
        </div>

        <div className="p-3 grid gap-2">
          {subjects.map((sub) => (
            <Link
              key={sub.id}
              href={`/subject/${sub.id}`}
              prefetch={true}
              aria-label={`${sub.name} विषय खोलें`}
              className="p-3.5 rounded-2xl bg-slate-950/70 hover:bg-indigo-950/40 border border-slate-800/80 hover:border-indigo-500/40 flex items-center justify-between group transition active:scale-[0.99] shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-black text-sm">
                  {sub.icon || sub.name?.charAt(0) || "S"}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition leading-snug">
                    {sub.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">अध्याय ➔ 50 MCQ ➔ 100 PYQ सेट्स</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  अभ्यास करें
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
              </div>
            </Link>
          ))}
        </div>
      </section>

    </main>
  );
}