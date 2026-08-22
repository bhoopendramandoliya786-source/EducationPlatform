"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { Search, BookOpen, Trophy, ArrowLeft, ChevronRight, Sparkles } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ subjects: [], topics: [], notes: [] });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!query.trim()) {
      setResults({ subjects: [], topics: [], notes: [] });
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const [{ data: subs }, { data: tops }, { data: nts }] = await Promise.all([
          supabase.from("subjects").select("*").ilike("name", `%${query}%`).limit(5),
          supabase.from("topics").select("*, chapters(name, subject_id)").ilike("name", `%${query}%`).limit(8),
          supabase.from("notes").select("*, topics(name)").ilike("title", `%${query}%`).limit(5)
        ]);

        setResults({
          subjects: subs || [],
          topics: tops || [],
          notes: nts || []
        });
      } catch (err) {
        console.error("Search Error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const hasResults = results.subjects.length > 0 || results.topics.length > 0 || results.notes.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-4">
      <div className="flex items-center gap-3 pt-1">
        <Link href="/" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="टॉपिक, विषय, नोट्स या प्रश्न खोजें..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {loading && (
        <div className="text-center py-8 text-xs text-slate-400 animate-pulse">
          डेटाबेस से खोजा जा रहा है...
        </div>
      )}

      {!loading && query.trim() && !hasResults && (
        <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
          <Sparkles className="w-6 h-6 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400">"<strong>{query}</strong>" से संबंधित कुछ नहीं मिला।</p>
          <p className="text-[10px] text-slate-500">कृपया अन्य शब्द या टॉपिक का नाम लिखकर देखें।</p>
        </div>
      )}

      {!loading && hasResults && (
        <div className="space-y-4">
          {/* Topics Result */}
          {results.topics.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">टॉपिक्स</span>
              <div className="grid gap-2">
                {results.topics.map((t) => (
                  <Link
                    key={t.id}
                    href={`/topic/${t.id}`}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 flex items-center justify-between group transition"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition">{t.name}</h4>
                      <p className="text-[10px] text-slate-400">{t.chapters?.name || "अध्याय"}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Subjects Result */}
          {results.subjects.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">विषय</span>
              <div className="grid gap-2">
                {results.subjects.map((s) => (
                  <Link
                    key={s.id}
                    href={`/subject/${s.id}`}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 flex items-center justify-between group transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                        {s.name.substring(0, 1)}
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-indigo-400">{s.name}</h4>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
