'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase/client';
import { BookOpen } from 'lucide-react';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadNotes() {
      const { data } = await supabase.from('notes').select('*');
      if (data) setNotes(data);
      setLoading(false);
    }
    loadNotes();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-indigo-400" />
        <div>
          <h1 className="text-base font-bold text-white">स्मार्ट थ्योरी नोट्स</h1>
          <p className="text-xs text-slate-400">टू द पॉइंट परीक्षा उपयोगी फैक्ट्स</p>
        </div>
      </div>
      {loading ? (
        <div className="text-xs text-slate-400 p-4">नोट्स लोड हो रहे हैं...</div>
      ) : notes.length === 0 ? (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
          जल्द ही नए नोट्स यहाँ उपलब्ध होंगे।
        </div>
      ) : (
        <div className="grid gap-3">
          {notes.map((n) => (
            <div key={n.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-indigo-300">{n.title}</h3>
              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{n.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
