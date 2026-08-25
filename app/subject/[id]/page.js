"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { ArrowLeft, ChevronRight, BookOpen, Layers, Sparkles } from "lucide-react";

export default function SubjectDetailPage() {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadSubjectData() {
      if (!id) return;
      setLoading(true);
      try {
        const { data: subData } = await supabase
          .from("subjects")
          .select("*")
          .eq("id", id)
          .single();
        setSubject(subData);

        const { data: chapData } = await supabase
          .from("chapters")
          .select("*, topics(id, name)")
          .eq("subject_id", id)
          .order("id", { ascending: true });

        if (chapData) setChapters(chapData);
      } catch (err) {
        console.error("Subject Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSubjectData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 pt-4 space-y-4 animate-pulse">
        <div className="h-6 w-24 bg-slate-900 rounded-lg" />
        <div className="h-28 bg-slate-900 rounded-3xl border border-slate-800" />
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-900 rounded-2xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="max-w-md mx-auto px-4 pt-12 text-center space-y-3">
        <p className="text-sm text-rose-400 font-bold">विषय नहीं मिला।</p>
        <Link href="/" className="inline-block text-xs font-bold px-4 py-2 rounded-xl bg-slate-900 text-white border border-slate-800">
          होम पर वापस जाएँ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 space-y-4 pb-28 pt-2 font-sans select-none">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition">
        <ArrowLeft className="w-4 h-4" /> वापस होम
      </Link>

      {/* Subject Hero */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/50 border border-slate-800 shadow-xl space-y-2 relative overflow-hidden">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
          <Sparkles className="w-3 h-3" /> पाठ्यक्रम विषय
        </div>
        <h1 className="text-lg font-black text-white leading-snug">{subject.name}</h1>
        <p className="text-xs text-slate-300">{subject.description || "सभी अध्याय, टू-द-पॉइंट नोट्स एवं स्पीड टेस्ट्स"}</p>
      </div>

      {/* Chapter List */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
          <span>अध्याय सूची ({chapters.length} Chapters)</span>
          <span className="text-[10px] text-indigo-400">100% Complete</span>
        </div>

        {chapters.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
            इस विषय में अभी अध्याय जोड़े जा रहे हैं।
          </div>
        ) : (
          <div className="grid gap-2.5">
            {chapters.map((chap, idx) => (
              <Link
                key={chap.id}
                href={`/chapter/${chap.id}`}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/50 flex items-center justify-between group transition active:scale-[0.99] shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-300 font-black text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition leading-snug">
                      {chap.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span>📑 नोट्स</span>
                      <span>•</span>
                      <span>🎯 MCQs & PYQs</span>
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
