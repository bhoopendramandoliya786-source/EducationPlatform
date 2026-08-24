"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { ArrowLeft, ChevronRight } from "lucide-react";

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
      <div className="max-w-4xl mx-auto px-4 pt-4 space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-900 rounded-lg" />
        <div className="h-28 bg-slate-900 rounded-3xl border border-slate-800" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-900 rounded-2xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-8 text-center space-y-3">
        <p className="text-xs text-rose-400">विषय नहीं मिला।</p>
        <Link href="/" className="inline-block text-xs font-bold px-4 py-2 rounded-xl bg-slate-900 text-white border border-slate-800">
          होम पर वापस जाएँ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-4">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
        <ArrowLeft className="w-3.5 h-3.5" /> वापस होम
      </Link>

      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/20 space-y-2 shadow-xl">
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          पाठ्यक्रम विषय
        </span>
        <h1 className="text-xl font-black text-white">{subject.name}</h1>
        <p className="text-xs text-slate-300">{subject.description || "सभी अध्याय, टॉपिक एवं टेस्ट"}</p>
      </div>

      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300">अध्याय सूची ({chapters.length} Chapters)</h3>
        </div>

        {chapters.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
            इस विषय में अभी अध्याय जोड़े जा रहे हैं।
          </div>
        ) : (
          <div className="grid gap-2.5">
            {chapters.map((chap, idx) => (
              <Link
                key={chap.id}
                href={`/chapter/${chap.id}`}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 flex items-center justify-between group transition active:scale-[0.99] shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition">{chap.name}</h4>
                    <p className="text-[10px] text-slate-400">
                      {chap.topics?.length || 1} टॉपिक्स उपलब्ध
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}