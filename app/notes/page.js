"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { 
  ArrowLeft, BookOpen, Layers, CheckCircle2, 
  ChevronRight, Sparkles, Folder, ArrowUpRight 
} from "lucide-react";

export default function NotesHubPage() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const { data: subs } = await supabase
          .from("subjects")
          .select("*")
          .eq("is_active", true)
          .order("id");

        if (subs && subs.length > 0) {
          setSubjects(subs);
          setSelectedSubject(subs[0]);
        }
      } catch (err) {
        console.error("Notes Hub Initial Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    async function loadChaptersAndNotes() {
      if (!selectedSubject) return;
      try {
        // Fetch chapters for this subject
        const { data: chaps } = await supabase
          .from("chapters")
          .select("*, topics(id, name)")
          .eq("subject_id", selectedSubject.id)
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (chaps && chaps.length > 0) {
          setChapters(chaps);
          setSelectedChapter(chaps[0]);
        } else {
          setChapters([]);
          setSelectedChapter(null);
          setNotes([]);
        }
      } catch (err) {
        console.error("Chapters load error:", err);
      }
    }
    loadChaptersAndNotes();
  }, [selectedSubject]);

  useEffect(() => {
    async function loadChapterNotes() {
      if (!selectedChapter) return;
      try {
        const topicIds = selectedChapter.topics?.map((t) => t.id) || [];
        if (topicIds.length === 0) {
          setNotes([]);
          return;
        }

        const { data: noteData } = await supabase
          .from("notes")
          .select("*, topics(id, name)")
          .in("topic_id", topicIds)
          .eq("is_published", true)
          .order("id", { ascending: true });

        if (noteData) setNotes(noteData);
      } catch (err) {
        console.error("Notes fetch error:", err);
      }
    }
    loadChapterNotes();
  }, [selectedChapter]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-900 rounded-lg" />
        <div className="h-20 bg-slate-900 rounded-3xl border border-slate-800" />
        <div className="h-48 bg-slate-900 rounded-3xl border border-slate-800" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 space-y-5 pb-24 pt-2">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="w-4 h-4" /> वापस होम
        </Link>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          Smart Notes Hub
        </span>
      </div>

      {/* Hero Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/50 border border-indigo-500/20 space-y-1.5 shadow-xl">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <h1 className="text-base font-black text-white">स्मार्ट थ्योरी एवं टू-द-पॉइंट नोट्स</h1>
        </div>
        <p className="text-xs text-slate-300">
          परीक्षा उपयोगी बुलेट फैक्ट्स, शॉर्ट ट्रिक्स एवं त्वरित रिवीजन रिपॉजिटरी
        </p>
      </div>

      {/* Subject Filter Tabs */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-400 block px-1">विषय चुनें:</span>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                selectedSubject?.id === sub.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chapter Selection Chips */}
      {chapters.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 block px-1">अध्याय (Chapters):</span>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
            {chapters.map((chap) => (
              <button
                key={chap.id}
                onClick={() => setSelectedChapter(chap)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  selectedChapter?.id === chap.id
                    ? "bg-slate-800 text-cyan-300 border border-cyan-500/40"
                    : "bg-slate-950 border border-slate-800/80 text-slate-400 hover:text-slate-300"
                }`}
              >
                <Folder className="w-3.5 h-3.5 opacity-70" />
                <span>{chap.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modern Booklet Notes List */}
      <div className="space-y-4 pt-1">
        {notes.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
            इस अध्याय में अभी नोट्स जोड़े जा रहे हैं।
          </div>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-lg relative overflow-hidden"
            >
              {/* Note Header */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {n.topics?.name || "Topic Fact"}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  {n.note_type === "revision" ? "⚡ Quick Fact" : "📖 Full Theory"}
                </span>
              </div>

              {/* Title & Body */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white leading-snug">{n.title}</h3>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                  {n.content}
                </p>
              </div>

              {/* Direct Action Link to Topic Practice */}
              {n.topics?.id && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
                  <Link
                    href={`/topic/${n.topics.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1.5 rounded-xl transition active:scale-95"
                  >
                    <span>🎯 अभ्यास MCQs व PYQs हल करें</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
