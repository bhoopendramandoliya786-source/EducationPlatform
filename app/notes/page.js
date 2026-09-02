"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { 
  ArrowLeft, 
  BookOpen, 
  Search, 
  Sparkles, 
  ArrowUpRight, 
  Bookmark, 
  FolderOpen,
  FileText
} from "lucide-react";

export default function SmartNotesPage() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Load All Subjects
  useEffect(() => {
    let isMounted = true;
    async function loadSubjects() {
      setLoading(true);
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data: subData } = await supabase
          .from("subjects")
          .select("id, name")
          .order("id", { ascending: true });

        if (isMounted && subData && subData.length > 0) {
          setSubjects(subData);
          setSelectedSubjectId(subData[0].id);
        }
      } catch (err) {
        console.error("Subjects fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSubjects();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Load Chapters when Subject changes
  useEffect(() => {
    let isMounted = true;
    async function loadChapters() {
      if (!selectedSubjectId) return;
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data: chapData } = await supabase
          .from("chapters")
          .select("id, name, sort_order")
          .eq("subject_id", selectedSubjectId)
          .order("sort_order", { ascending: true })
          .order("id", { ascending: true });

        if (isMounted) {
          if (chapData && chapData.length > 0) {
            setChapters(chapData);
            setSelectedChapterId(chapData[0].id);
          } else {
            setChapters([]);
            setSelectedChapterId(null);
          }
        }
      } catch (err) {
        console.error("Chapters fetch error:", err);
      }
    }
    loadChapters();

    return () => {
      isMounted = false;
    };
  }, [selectedSubjectId]);

  // 3. Load Notes strictly for Selected Chapter
  useEffect(() => {
    let isMounted = true;
    async function loadNotes() {
      if (!selectedChapterId) {
        setNotes([]);
        return;
      }
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data: topList } = await supabase
          .from("topics")
          .select("id")
          .eq("chapter_id", selectedChapterId);

        const topicIds = (topList || []).map((t) => t.id);

        if (topicIds.length > 0) {
          const { data: nData } = await supabase
            .from("notes")
            .select("id, title, content, sort_order, topics(name)")
            .in("topic_id", topicIds)
            .eq("is_published", true)
            .order("sort_order", { ascending: true })
            .order("id", { ascending: true });

          if (isMounted && nData) setNotes(nData);
        } else {
          const { data: nData } = await supabase
            .from("notes")
            .select("id, title, content, sort_order")
            .eq("chapter_id", selectedChapterId)
            .eq("is_published", true)
            .order("sort_order", { ascending: true })
            .order("id", { ascending: true });

          if (isMounted && nData) setNotes(nData || []);
        }
      } catch (err) {
        console.error("Notes fetch error:", err);
      }
    }
    loadNotes();

    return () => {
      isMounted = false;
    };
  }, [selectedChapterId]);

  const filteredNotes = notes.filter((n) => {
    const text = ((n.title || "") + " " + (n.content || "")).toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  return (
    <main className="max-w-lg mx-auto px-3.5 pb-24 pt-2 space-y-4 font-sans select-none">

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link 
          href="/" 
          aria-label="होमपेज पर वापस जाएँ"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-4 h-4" /> वापस होम
        </Link>
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" /> Smart Notes Hub
        </span>
      </div>

      {/* Hero Banner */}
      <section aria-label="नोट्स बैनर" className="p-5 rounded-[28px] bg-gradient-to-b from-slate-900/95 to-slate-950 border border-emerald-500/20 shadow-xl space-y-2.5 relative overflow-hidden">
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> परीक्षा उपयोगी नोट्स
        </div>

        <div>
          <h1 className="text-xl font-black text-white leading-snug tracking-tight">
            स्मार्ट थ्योरी एवं टू-द-पॉइंट नोट्स 📑
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed mt-1">
            महत्वपूर्ण बुलेट फैक्ट्स, शॉर्ट ट्रिक्स एवं त्वरित रिवीजन रिपॉजिटरी।
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative pt-1">
          <label htmlFor="notes-search-input" className="sr-only">
            टॉपिक या कीवर्ड खोजें
          </label>
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
          <input
            id="notes-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="टॉपिक या कीवर्ड खोजें..."
            className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500/50 transition"
          />
        </div>
      </section>

      {/* 1. Subject Filter Carousel */}
      <section aria-label="विषय चयन" className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
          <span className="flex items-center gap-1.5 text-slate-300">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> 1. विषय चुनें:
          </span>
          <span className="text-emerald-400 font-semibold">{subjects.length} विषय</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelectedSubjectId(sub.id)}
              aria-pressed={selectedSubjectId === sub.id}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedSubjectId === sub.id
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                  : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-emerald-500/30"
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </section>

      {/* 2. Chapter Filter Carousel */}
      {chapters.length > 0 && (
        <section aria-label="अध्याय चयन" className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
            <span className="flex items-center gap-1.5 text-slate-300">
              <FolderOpen className="w-3.5 h-3.5 text-emerald-400" /> 2. अध्याय चुनें:
            </span>
            <span className="text-emerald-400 font-semibold">{chapters.length} अध्याय</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {chapters.map((chap) => (
              <button
                key={chap.id}
                type="button"
                onClick={() => setSelectedChapterId(chap.id)}
                aria-pressed={selectedChapterId === chap.id}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedChapterId === chap.id
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-sm font-black"
                    : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-slate-700"
                }`}
              >
                📁 {chap.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Notes Cards List */}
      <section aria-label="थ्योरी नोट्स सूची" className="space-y-3 pt-1">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
          <span>थ्योरी नोट्स ({filteredNotes.length})</span>
          {selectedChapterId && (
            <Link
              href={`/chapter/${selectedChapterId}`}
              aria-label="इस अध्याय का टेस्ट और MCQs हल करें"
              className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5 hover:underline"
            >
              इस चैप्टर का टेस्ट दें <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {filteredNotes.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">इस अध्याय में नोट्स जल्द जोड़े जा रहे हैं।</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredNotes.map((n, idx) => (
              <article
                key={n.id || idx}
                className="p-5 rounded-[24px] bg-slate-900/80 border border-slate-800/90 space-y-3 shadow-md hover:border-emerald-500/30 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    📖 {n.topics?.name || "थ्योरी कैप्सूल"}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    भाग #{idx + 1}
                  </span>
                </div>

                <h2 className="text-sm font-bold text-white leading-snug">
                  {n.title}
                </h2>

                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line space-y-1 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/70 break-words font-medium">
                  {n.content}
                </div>

                {selectedChapterId && (
                  <div className="pt-1 flex justify-end">
                    <Link
                      href={`/chapter/${selectedChapterId}`}
                      aria-label={`${n.title} के अभ्यास MCQs व PYQs हल करें`}
                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      🎯 अभ्यास MCQs व PYQs हल करें →
                    </Link>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

    </main>
  );
}