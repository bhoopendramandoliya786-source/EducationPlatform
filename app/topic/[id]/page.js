'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { ArrowLeft, BookOpen, Trophy, Sparkles } from 'lucide-react';

export default function TopicDetailPage() {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [notes, setNotes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('notes');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadTopicData() {
      setLoading(true);
      try {
        const { data: topicData } = await supabase.from('topics').select('*').eq('id', id).single();
        setTopic(topicData);

        const { data: notesData } = await supabase.from('notes').select('*').eq('topic_id', id);
        if (notesData) setNotes(notesData);

        const { data: qData } = await supabase.from('questions').select('*').eq('topic_id', id);
        if (qData) setQuestions(qData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTopicData();
  }, [id]);

  if (loading) return <div className="p-6 text-xs text-slate-400">टॉपिक डेटा लोड हो रहा है...</div>;
  if (!topic) return <div className="p-6 text-xs text-rose-400">टॉपिक नहीं मिला।</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-3 space-y-4">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
        <ArrowLeft className="w-3.5 h-3.5" /> वापस होम पर जाएँ
      </Link>

      <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/20 space-y-2 shadow-xl">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          टॉपिक अध्ययन
        </span>
        <h1 className="text-xl font-black text-white">{topic.name}</h1>
        <p className="text-xs text-slate-300">{topic.description}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'notes' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4" /> स्मार्ट नोट्स ({notes.length})
        </button>
        <button
          onClick={() => setActiveTab('mcqs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'mcqs' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-900 text-slate-400'
          }`}
        >
          <Trophy className="w-4 h-4" /> 50 MCQs & PYQs ({questions.length})
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'notes' ? (
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
              इस टॉपिक के नोट्स तैयार किए जा रहे हैं।
            </div>
          ) : (
            notes.map((n) => (
              <div key={n.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h3 className="text-xs font-bold text-indigo-300">{n.title}</h3>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{n.content}</p>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {questions.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
              इस टॉपिक के प्रश्न तैयार किए जा रहे हैं।
            </div>
          ) : (
            questions.map((q, idx) => (
              <div key={q.id || idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <div className="text-xs font-bold text-white">Q{idx + 1}. {q.question_text || q.question}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-300">A. {q.option_a}</div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-300">B. {q.option_b}</div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-300">C. {q.option_c}</div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-300">D. {q.option_d}</div>
                </div>
                <div className="text-[11px] text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                  <strong>सही उत्तर:</strong> {q.correct_option || q.answer} • {q.explanation}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
