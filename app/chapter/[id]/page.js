"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { ArrowLeft, BookOpen, Trophy, ChevronRight, Layers } from "lucide-react";

export default function ChapterDetailPage() {
  const { id } = useParams();
  const [chapter, setChapter] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadChapterData() {
      setLoading(true);
      try {
        const { data: ch } = await supabase
          .from("chapters")
          .select("*, subjects(id, name)")
          .eq("id", id)
          .single();
        setChapter(ch);

        const { data: tList } = await supabase
          .from("topics")
          .select("*, notes(count), questions(count)")
          .eq("chapter_id", id)
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (tList) setTopics(tList);
      } catch (err) {
        console.error("Chapter Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadChapterData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-4 animate-pulse">
        <div className="h-28 bg-slate-900 rounded-3xl border border-slate-800" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-8 text-center space-y-3">
        <p className="text-xs text-rose-400">अध्याय नहीं मिला।</p>
        <Link href="/" className="inline-block text-xs font-bold px-4 py-2 rounded-xl bg-slate-900 text-white border border-slate-800">
          होम पर जाएँ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-4">
      <Link
        href={chapter.subjects?.id ? `/subject/${chapter.subjects.id}` : "/"}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> वापस विषय ({chapter.subjects?.name || "विषय"})
      </Link>

      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/20 space-y-2 shadow-xl">
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          अध्याय विवरण
        </span>
        <h1 className="text-xl font-black text-white">{chapter.name}</h1>
        <p className="text-xs text-slate-300">{chapter.description || "सभी टॉपिक, स्मार्ट नोट्स एवं प्रैक्टिस टेस्ट"}</p>
      </div>

      <div className="space-y-3 pt-1">
        <h3 className="text-xs font-bold text-slate-300">उपलब्ध टॉपिक ({topics.length})</h3>
        <div className="grid gap-2.5">
          {topics.map((top) => (
            <Link
              key={top.id}
              href={`/topic/${top.id}`}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 flex items-center justify-between group transition active:scale-[0.99]"
            >
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white group-hover:text-indigo-400">{top.name}</h4>
                <p className="text-[10px] text-slate-400">
                  {top.description || "स्मार्ट नोट्स एवं 50 MCQs"}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
