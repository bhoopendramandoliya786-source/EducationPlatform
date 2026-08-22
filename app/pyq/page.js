'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase/client';
import { HelpCircle } from 'lucide-react';

export default function PYQPage() {
  const [pyqs, setPyqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadPYQs() {
      const { data } = await supabase.from('questions').select('*').eq('question_type', 'pyq');
      if (data) setPyqs(data);
      setLoading(false);
    }
    loadPYQs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
        <HelpCircle className="w-6 h-6 text-amber-400" />
        <div>
          <h1 className="text-base font-bold text-white">विगत वर्षों के हल प्रश्न (100+ PYQs)</h1>
          <p className="text-xs text-slate-400">RSMSSB एवं RPSC के पिछले पेपर्स</p>
        </div>
      </div>
      {loading ? (
        <div className="text-xs text-slate-400 p-4">लोड हो रहे हैं...</div>
      ) : pyqs.length === 0 ? (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
          PYQs जल्द ही लोड किए जा रहे हैं।
        </div>
      ) : (
        <div className="grid gap-3">
          {pyqs.map((q, i) => (
            <div key={q.id || i} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-white">Q{i + 1}. {q.question_text || q.question}</h3>
              <p className="text-[11px] text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                <strong>उत्तर:</strong> {q.correct_option || q.answer} - {q.explanation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
