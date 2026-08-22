'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/client';
import { ArrowLeft, BookOpen, Trophy, ChevronRight, Layers } from 'lucide-react';

export default function SubjectDetailPage() {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data: subData } = await supabase.from('subjects').select('*').eq('id', id).single();
        setSubject(subData);

        const { data: chapData } = await supabase
          .from('chapters')
          .select('*, topics(*)')
          .eq('subject_id', id)
          .order('order_index', { ascending: true });

        if (chapData) setChapters(chapData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) return <div className="p-6 text-xs text-slate-400">विषय लोड हो रहा है...</div>;
  if (!subject) return <div className="p-6 text-xs text-rose-400">विषय नहीं मिला।</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-3 space-y-4">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
        <ArrowLeft className="w-3.5 h-3.5" /> वापस होम पर जाएँ
      </Link>

      <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/20 space-y-2 shadow-xl">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          विषय पाठ्यक्रम
        </span>
        <h1 className="text-xl font-black text-white">{subject.name}</h1>
        <p className="text-xs text-slate-300">{subject.description || 'सभी अध्याय और टॉपिक'}</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300">अध्याय और टॉपिक्स ({chapters.length} Chapters)</h3>
        {chapters.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
            इस विषय में अभी अध्याय जोड़े जा रहे हैं।
          </div>
        ) : (
          <div className="space-y-3">
            {chapters.map((chap, idx) => (
              <div key={chap.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    अध्याय {idx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-white">{chap.name}</h4>
                </div>

                <div className="grid gap-2 pl-2 border-l-2 border-slate-800">
                  {chap.topics && chap.topics.length > 0 ? (
                    chap.topics.map((t) => (
                      <Link
                        key={t.id}
                        href={`/topic/${t.id}`}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-indigo-500/40 flex items-center justify-between active:scale-[0.99] transition group"
                      >
                        <div>
                          <h5 className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition">{t.name}</h5>
                          <span className="text-[10px] text-slate-500">नोट्स + 50 MCQs</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition" />
                      </Link>
                    ))
                  ) : (
                    <div className="text-[10px] text-slate-500 pl-2">टॉपिक्स लोड हो रहे हैं...</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
