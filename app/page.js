import Link from "next/link";
import { 
  BookOpen, Trophy, 
  ArrowRight, Zap, FolderTree, Sparkles, ChevronRight 
} from "lucide-react";

export const revalidate = 60; // 60 सेकंड कैशिंग से LCP 1.5s में लोड होगा

export default async function HomePage() {
  let subjects = [];
  let counts = { notes: 0, tests: 0, subjects: 0 };

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const [subsRes, notesRes, quizRes] = await Promise.all([
      supabase.from("subjects").select("id, name, icon").order("id", { ascending: true }),
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
    console.error(e);
  }

  return (
    <main className="max-w-md mx-auto px-4 space-y-4 pb-28 pt-1 font-sans select-none">

      {/* 1. Hero Spotlight */}
      <section className="p-5 rounded-3xl bg-slate-900 border border-indigo-500/20 space-y-2 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-wider uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Rajasthan Exam Prep 2026
          </span>
          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> {counts.subjects} विषय उपलब्ध
          </span>
        </div>

        <h1 className="text-xl font-black text-white tracking-tight leading-snug">
          दिशा 20-20 & सम्पूर्ण पाठ्यक्रम 🎯
        </h1>

        <p className="text-xs text-slate-300 leading-relaxed">
          राजस्थान सामान्य ज्ञान, इतिहास, कला-संस्कृति, भूगोल एवं राजव्यवस्था के 100% प्रामाणिक नोट्स व PYQ सेट्स।
        </p>
      </section>

      {/* 2. Action Pillars */}
      <section aria-label="Quick Actions" className="grid grid-cols-2 gap-2.5">
        <Link
          href="/notes"
          aria-label="स्मार्ट नोट्स खोलें"
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 space-y-1.5 transition active:scale-[0.98] shadow-md group"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-white group-hover:text-indigo-300 transition">स्मार्ट नोट्स</h2>
          <p className="text-[10px] text-slate-400">{counts.notes}+ टू-द-पॉइंट नोट्स</p>
        </Link>

        <Link
          href="/quiz"
          aria-label="स्पीड टेस्ट खोलें"
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 space-y-1.5 transition active:scale-[0.98] shadow-md group"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <Trophy className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">स्पीड टेस्ट</h2>
          <p className="text-[10px] text-emerald-400 font-bold">{counts.tests}+ लाइव प्रश्न सेट्स</p>
        </Link>

        <Link
          href="/creator"
          aria-label="रील्स क्रिएटर खोलें"
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 space-y-1.5 transition active:scale-[0.98] shadow-md group"
        >
          <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-white group-hover:text-rose-300 transition">रील्स क्रिएटर</h2>
          <p className="text-[10px] text-slate-400">1-क्लिक HD क्विज़ रील्स</p>
        </Link>

        <Link
          href="/ai-tutor"
          aria-label="AI ट्यूटर खोलें"
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 space-y-1.5 transition active:scale-[0.98] shadow-md group"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400">
            <Zap className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-white group-hover:text-purple-300 transition">AI ट्यूटर</h2>
          <p className="text-[10px] text-slate-400">24/7 लाइव डाउट सॉल्व</p>
        </Link>
      </section>

      {/* 3. Subjects List */}
      <section aria-label="Syllabus Subjects" className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white">पाठ्यक्रम विषय (Syllabus)</h2>
              <p className="text-[10px] text-slate-400">{subjects.length} विषय उपलब्ध</p>
            </div>
          </div>
        </div>

        <div className="p-3 grid gap-2">
          {subjects.map((sub) => (
            <Link
              key={sub.id}
              href={"/subject/" + sub.id}
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
                  <p className="text-[10px] text-slate-400 mt-0.5">अध्याय ➔ 20-20 सेट्स ➔ नोट्स व PYQs</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
            </Link>
          ))}
        </div>
      </section>

    </main>
  );
}