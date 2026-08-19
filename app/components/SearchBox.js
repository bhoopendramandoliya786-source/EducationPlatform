'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { Search, BookOpen, Layers, FileText, ChevronRight, X, Loader2 } from 'lucide-react';

export default function SearchBox() {
  const router = useRouter();
  const supabase = createClient();
  const boxRef = useRef(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // बाहर क्लिक करने पर ड्रॉपडाउन बंद करें
  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Supabase से लाइव सर्च
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const q = query.trim();

        // Subjects खोजें
        const { data: subData } = await supabase
          .from('subjects')
          .select('id, name')
          .ilike('name', `%${q}%`)
          .limit(3);

        // Chapters खोजें
        const { data: chapData } = await supabase
          .from('chapters')
          .select('id, name, subjects(name)')
          .ilike('name', `%${q}%`)
          .limit(3);

        // Topics खोजें
        const { data: topData } = await supabase
          .from('topics')
          .select('id, name, chapters(name, subjects(name))')
          .ilike('name', `%${q}%`)
          .limit(4);

        const formattedSubjects = (subData || []).map(item => ({
          id: `sub-${item.id}`,
          type: 'Subject',
          title: item.name,
          subtitle: 'सम्पूर्ण विषय',
          link: `/subject/${item.id}`,
          icon: BookOpen,
          color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
        }));

        const formattedChapters = (chapData || []).map(item => ({
          id: `chap-${item.id}`,
          type: 'Chapter',
          title: item.name,
          subtitle: item.subjects?.name || 'अध्याय',
          link: `/chapter/${item.id}`,
          icon: Layers,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
        }));

        const formattedTopics = (topData || []).map(item => ({
          id: `top-${item.id}`,
          type: 'Topic',
          title: item.name,
          subtitle: `${item.chapters?.subjects?.name || ''} › ${item.chapters?.name || ''}`,
          link: `/topic/${item.id}`,
          icon: FileText,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
        }));

        setResults([...formattedSubjects, ...formattedChapters, ...formattedTopics]);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={boxRef} className="relative w-full z-40">
      <div className="relative flex items-center w-full bg-slate-900/90 border border-slate-800 focus-within:border-blue-500/60 rounded-2xl p-2 sm:p-2.5 transition-all shadow-lg backdrop-blur-md">
        <div className="pl-2.5 pr-2 text-slate-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="सब्जेक्ट, चैप्टर या टॉपिक खोजें..."
          className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500 font-medium"
        />

        {query && (
          <button 
            onClick={() => { setQuery(''); setResults([]); }}
            className="p-1 text-slate-400 hover:text-white mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {loading && (
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin mr-2 shrink-0" />
        )}
      </div>

      {open && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl max-h-[380px] overflow-y-auto">
          {loading && results.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span>खोज रहे हैं...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2 space-y-1">
              {results.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.link}
                    onClick={() => {
                      setOpen(false);
                      setQuery('');
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                          {item.title}
                        </div>
                        <div className="text-[10px] sm:text-xs text-slate-400 truncate">
                          <span className="font-semibold text-slate-500 mr-1">[{item.type}]</span>
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              "{query}" से संबंधित कोई सामग्री नहीं मिली।
            </div>
          )}
        </div>
      )}
    </div>
  );
 }