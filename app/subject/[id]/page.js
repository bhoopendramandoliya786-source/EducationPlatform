"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  ArrowLeft, 
  ChevronRight, 
  Sparkles, 
  BookOpen, 
  Layers, 
  Play, 
  CheckCircle2, 
  FileText,
  Target
} from "lucide-react";

export default function SubjectDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [subject, setSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSubjectData() {
      if (!id) return;
      setLoading(true);
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const [subRes, chapRes] = await Promise.all([
          supabase
            .from("subjects")
            .select("id, name, description")
            .eq("id", id)
            .single(),
          supabase
            .from("chapters")
            .select("id, name, description, sort_order")
            .eq("subject_id", id)
            .order("sort_order", { ascending: true })
            .order("id", { ascending: true })
        ]);

        if (isMounted) {
          if (subRes.data) setSubject(subRes.data);
          if (chapRes.data) setChapters(chapRes.data);
        }
      } catch (err) {
        console.error("Subject Load Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSubjectData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-lg mx-auto px-4 pt-6 space-y-4 animate-pulse">
        <div className="h-6 w-28 bg-slate-900 rounded-xl" />
        <div className="h-32 bg-slate-900 rounded-[28px] border border-slate-800" />
        <div className="grid gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-slate-900/60 rounded-2xl border border-slate-800" />
          ))}
        </div>
      </main>
    );
  }

  if (!subject) {
    return (
      <main className="max-w-lg mx-auto px-4 pt-14 text-center space-y-3">
        <p className="text-sm text-rose-400 font-bold">विषय नहीं मिला।</p>
        <Link
          href="/"
          className="inline-block text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-900 text-white border border-slate-800 hover:border-emerald-500/40 transition"
        >
          होम पर वापस जाएँ
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-3.5 space-y-4 pb-24 pt-2 font-sans select-none">

      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> वापस होम
        </Link>
        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
          {chapters.length} कुल अध्याय
        </span>
      </div>

      {/* Subject Hero Header */}
      <section className="p-5 rounded-[28px] bg-gradient-to-b from-slate-900/95 to-slate-950 border border-emerald-500/20 shadow-xl space-y-2.5 relative overflow-hidden">
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black tracking-wider uppercase border border-emerald-500/20">
            <Sparkles className="w-3 h-3 text-emerald-400" /> पाठ्यक्रम मास्टर
          </span>
          <span className="text-[11px] font-bold text-slate-300">
            100% सिलेबस कवर्ड
          </span>
        </div>

        <div>
          <h1 className="text-xl font-black text-white tracking-tight leading-snug">
            {subject.name}
          </h1>
          <p className="text-xs text-slate-300/90 leading-relaxed mt-1">
            {subject.description || "सभी अध्याय, टू-द-पॉइंट स्मार्ट नोट्स, 50 MCQs एवं विगत वर्ष PYQ टेस्ट।"}
          </p>
        </div>
      </section>

      {/* Chapters Grid List */}
      <section className="space-y-3 pt-1">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Layers className="w-4 h-4" /> अध्याय सूची
          </span>
          <span className="text-[10px] text-slate-500 uppercase font-medium">टैप करके शुरू करें</span>
        </div>

        {chapters.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
            इस विषय में अभी अध्याय जोड़े जा रहे हैं।
          </div>
        ) : (
          <div className="grid gap-2.5">
            {chapters.map((chap, idx) => (
              <Link
                key={chap.id}
                href={`/chapter/${chap.id}`}
                className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-emerald-950/20 border border-slate-800/90 hover:border-emerald-500/40 flex items-center justify-between group transition active:scale-[0.99] shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xs group-hover:scale-105 transition">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition leading-snug">
                      {chap.name}
                    </h2>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1 text-emerald-400/90">
                        <FileText className="w-3 h-3" /> नोट्स
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-teal-300/90">
                        <Target className="w-3 h-3" /> MCQs & PYQs
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                    अभ्यास
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </main>
  );
}