"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { Search, ArrowLeft, ChevronRight, Sparkles } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ subjects: [], topics: [], notes: [] });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults({ subjects: [], topics: [], notes: [] });
      setLoading(false);
      return;
    }

    let isCurrent = true;
    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const [{ data: subs }, { data: tops }, { data: nts }] = await Promise.all([
          supabase
            .from("subjects")
            .select("id, name")
            .ilike("name", `%${trimmed}%`)
            .limit(5),
          supabase
            .from("topics")
            .select("id, name, chapters(id, name, subject_id)")
            .ilike("name", `%${trimmed}%`)
            .limit(8),
          supabase
            .from("notes")
            .select("id, title, chapter_id")
            .ilike("title", `%${trimmed}%`)
            .limit(5)
        ]);

        if (isCurrent) {
          setResults({
            subjects: subs || [],
            topics: tops || [],
            notes: nts || []
          });
        }
      } catch (err) {
        console.error("Search Error:", err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    }, 250);

    return () => {
      isCurrent = false;
      clearTimeout(delayDebounce);
    };
  }, [query, supabase]);

  const hasResults = results.subjects.length > 0 || results.topics.length > 0 || results.notes.length > 0;

  return (
    <main className="max-w-md mx-auto px-4 space-y-4 pb-28 pt-1 font-sans select-none">
      <div className="flex items-center gap-2.5 pt-1">
        <Link
          href="/"
          aria-label="होमपेज पर वापस जाएँ"
          className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition active:scale-95 flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="relative flex-1">
          <label htmlFor="search-input" className="sr-only">
            विषय, अध्याय या नोट्स खोजें
          </label>
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            id="search-input"
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="टॉपिक, विषय, नोट्स या प्रश्न खोजें..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
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
          <p className="text-xs text-slate-300 font-medium">
            "<strong>{query}</strong>" से संबंधित कुछ नहीं मिला।
          </p>
          <p className="text-[10px] text-slate-500">
            कृपया अन्य शब्द या टॉपिक का नाम लिखकर देखें।
          </p>
        </div>
      )}

      {!loading && hasResults && (
        <div className="space-y-4">
          {/* Topics Result */}
          {results.topics.length > 0 && (
            <section aria-label="टॉपिक्स परिणाम" className="space-y-2">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">टॉपिक्स</h2>
              <div className="grid gap-2">
                {results.topics.map((t) => (
                  <Link
                    key={t.id}
                    href={`/topic/${t.id}`}
                    aria-label={`${t.name} टॉपिक खोलें`}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 flex items-center justify-between group transition active:scale-[0.99]"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-indigo-400 transition leading-snug">
                        {t.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t.chapters?.name || "अध्याय"}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Subjects Result */}
          {results.subjects.length > 0 && (
            <section aria-label="विषय परिणाम" className="space-y-2">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">विषय</h2>
              <div className="grid gap-2">
                {results.subjects.map((s) => (
                  <Link
                    key={s.id}
                    href={`/subject/${s.id}`}
                    aria-label={`${s.name} विषय खोलें`}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 flex items-center justify-between group transition active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                        {s.name.substring(0, 1)}
                      </div>
                      <h3 className="text-xs font-bold text-white group-hover:text-indigo-400 transition leading-snug">
                        {s.name}
                      </h3>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Notes Result */}
          {results.notes.length > 0 && (
            <section aria-label="नोट्स परिणाम" className="space-y-2">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">नोट्स</h2>
              <div className="grid gap-2">
                {results.notes.map((n) => (
                  <Link
                    key={n.id}
                    href={`/chapter/${n.chapter_id}`}
                    aria-label={`${n.title} नोट्स खोलें`}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 flex items-center justify-between group transition active:scale-[0.99]"
                  >
                    <h3 className="text-xs font-bold text-white group-hover:text-indigo-400 transition leading-snug">
                      {n.title}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}