"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { BookOpen, ArrowLeft, ChevronRight, Sparkles, Filter } from "lucide-react";

export default function SmartNotesHubPage() {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadNotesData() {
      setLoading(true);
      try {
        const [{ data: sList }, { data: nList }] = await Promise.all([
          supabase.from("subjects").select("id, name").eq("is_active", true),
          supabase.from("notes").select("*, topics(name, chapters(name, subject_id))").eq("is_published", true).order("id", { ascending: false })
        ]);

        if (sList) setSubjects(sList);
        if (nList) setNotes(nList);
      } catch (err) {
        console.error("Notes Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadNotesData();
  }, []);

  const filteredNotes = selectedSubject === "all"
    ? notes
    : notes.filter((n) => n.topics?.chapters?.subject_id === Number(selectedSubject));

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-4">
      <div className="flex items-center justify-between pt-1">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="w-3.5 h-3.5" /> होम
        </Link>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
          <BookOpen className="w-3 h-3" /> Smart Bullet Notes
        </span>
      </div>

      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/20 space-y-2 shadow-xl">
        <h1 className="text-xl font-black text-white">स्मार्ट थ्योरी नोट्स रिपॉजिटरी</h1>
        <p className="text-xs text-slate-300">टू-द-पॉइंट बुलेट फैक्ट्स, ट्रिक्स और परीक्षा उपयोगी बिंदु।</p>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedSubject("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
            selectedSubject === "all"
              ? "bg-indigo-600 text-white border-transparent"
              : "bg-slate-900 text-slate-400 border-slate-800"
          }`}
        >
          सभी विषय
        </button>
        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubject(sub.id.toString())}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              selectedSubject === sub.id.toString()
                ? "bg-indigo-600 text-white border-transparent"
                : "bg-slate-900 text-slate-400 border-slate-800"
            }`}
          >
            {sub.name}
          </button>
        ))}
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-900 rounded-3xl border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
            इस विषय में अभी नोट्स उपलब्ध नहीं हैं।
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div key={note.id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {note.topics?.name || "Topic"}
                </span>
                <span className="text-[10px] text-slate-500">{note.note_type || "Study"}</span>
              </div>
              <h3 className="text-sm font-bold text-white">{note.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
