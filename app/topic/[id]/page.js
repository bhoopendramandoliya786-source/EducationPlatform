'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import Navbar from '../../components/Navbar';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  Award, 
  HelpCircle, 
  Zap, 
  Check, 
  X, 
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react';

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.id;
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'mcq' | 'pyq' | 'quiz'
  const [topicData, setTopicData] = useState(null);
  const [notes, setNotes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [user, setUser] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Interactive Answer State: { [questionId]: 'A' | 'B' | 'C' | 'D' }
  const [selectedAnswers, setSelectedAnswers] = useState({});

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // 1. Get Auth User
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        // 2. Fetch Topic with Chapter & Subject
        const { data: topic } = await supabase
          .from('topics')
          .select('*, chapters(id, name, subjects(id, name))')
          .eq('id', topicId)
          .single();

        // 3. Fetch Notes
        const { data: notesData } = await supabase
          .from('notes')
          .select('*')
          .eq('topic_id', topicId)
          .eq('is_published', true)
          .order('sort_order', { ascending: true });

        // 4. Fetch Questions (MCQ + PYQ)
        const { data: questionsData } = await supabase
          .from('questions')
          .select('*')
          .eq('topic_id', topicId)
          .eq('is_active', true)
          .order('id', { ascending: true });

        // 5. Fetch User Progress
        if (currentUser) {
          const { data: prog } = await supabase
            .from('progress')
            .select('completed')
            .eq('topic_id', topicId)
            .eq('user_id', currentUser.id)
            .maybeSingle();

          if (prog) setIsCompleted(prog.completed);
        }

        setTopicData(topic);
        setNotes(notesData || []);
        setQuestions(questionsData || []);
      } catch (err) {
        console.error('Error loading topic:', err);
      } finally {
        setLoading(false);
      }
    }

    if (topicId) {
      loadData();
    }
  }, [topicId]);

  // Mark as Complete Toggle
  const handleMarkComplete = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    const nextStatus = !isCompleted;
    setIsCompleted(nextStatus);

    await supabase.from('progress').upsert({
      user_id: user.id,
      topic_id: topicId,
      completed: nextStatus,
      last_studied_at: new Date().toISOString()
    }, { onConflict: 'user_id,topic_id' });
  };

  // Option Click Handler
  const handleOptionSelect = (qId, optionKey) => {
    if (selectedAnswers[qId]) return; // Freeze once selected
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionKey }));
  };

  const mcqList = questions.filter(q => !q.is_pyq);
  const pyqList = questions.filter(q => q.is_pyq);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans pb-24 selection:bg-blue-500/30">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link 
            href={`/chapter/${topicData?.chapters?.id}`}
            className="inline-flex items-center gap-1 hover:text-white transition-colors bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{topicData?.chapters?.name}</span>
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-semibold truncate max-w-[200px]">
            {topicData?.name}
          </span>
        </div>

        {/* Topic Title Card */}
        <section className="bg-gradient-to-br from-slate-900 via-[#111726] to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-3.5">
          <div className="space-y-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {topicData?.chapters?.subjects?.name} › {topicData?.chapters?.name}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {topicData?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {topicData?.description || 'इस टॉपिक के सभी थ्योरी नोट्स, प्रैक्टिस MCQs और PYQs नीचे उपलब्ध हैं।'}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
            <button
              onClick={handleMarkComplete}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                isCompleted 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isCompleted ? 'Completed ✓' : 'Mark as Complete'}
            </button>
            <span className="text-xs text-slate-400 font-medium">
              {mcqList.length} MCQs • {pyqList.length} PYQs
            </span>
          </div>
        </section>

        {/* Tabs Bar */}
        <nav className="grid grid-cols-4 gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl sticky top-20 z-20 backdrop-blur-md">
          {[
            { id: 'notes', label: 'Notes', icon: BookOpen, count: notes.length },
            { id: 'mcq', label: 'MCQs', icon: HelpCircle, count: mcqList.length },
            { id: 'pyq', label: 'PYQ', icon: Award, count: pyqList.length },
            { id: 'quiz', label: 'Quiz', icon: Zap, count: 'Live' },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1 rounded-full ${active ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Tab Contents */}
        <div className="space-y-4">
          
          {/* NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="space-y-3">
              {notes.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                  इस टॉपिक के लिए अभी कोई नोट्स उपलब्ध नहीं हैं।
                </div>
              ) : (
                notes.map(note => (
                  <article key={note.id} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        {note.title}
                      </h2>
                      <span className="text-[10px] text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                        {note.note_type}
                      </span>
                    </div>
                    <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line pl-3.5 border-l-2 border-blue-500/30">
                      {note.content}
                    </div>
                  </article>
                ))
              )}
            </div>
          )}

          {/* MCQs & PYQs TAB (Interactive click-to-reveal) */}
          {(activeTab === 'mcq' || activeTab === 'pyq') && (
            <div className="space-y-4">
              {(activeTab === 'mcq' ? mcqList : pyqList).length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                  कोई प्रश्न उपलब्ध नहीं हैं।
                </div>
              ) : (
                (activeTab === 'mcq' ? mcqList : pyqList).map((q, idx) => {
                  const userSelected = selectedAnswers[q.id];
                  const isAnswered = !!userSelected;

                  return (
                    <div key={q.id} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                      
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                          <span className="text-blue-400 font-mono mr-1.5">Q{idx + 1}.</span> 
                          {q.question}
                        </h3>
                        {q.is_pyq && (
                          <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
                            {q.source || 'PYQ'} {q.year || ''}
                          </span>
                        )}
                      </div>

                      {/* 4 Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {['A', 'B', 'C', 'D'].map(optKey => {
                          const optText = q[`option_${optKey.toLowerCase()}`];
                          if (!optText) return null;

                          const isCorrect = q.answer === optKey;
                          const isChosen = userSelected === optKey;

                          let style = "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600";
                          
                          if (isAnswered) {
                            if (isCorrect) {
                              style = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                            } else if (isChosen) {
                              style = "bg-rose-500/20 border-rose-500 text-rose-300 font-bold";
                            } else {
                              style = "bg-slate-900/30 border-slate-800 text-slate-600 opacity-50";
                            }
                          }

                          return (
                            <button
                              key={optKey}
                              onClick={() => handleOptionSelect(q.id, optKey)}
                              disabled={isAnswered}
                              className={`flex items-center justify-between p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all text-left ${style}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold bg-slate-800 border border-slate-700">
                                  {optKey}
                                </span>
                                <span>{optText}</span>
                              </div>
                              {isAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                              {isAnswered && isChosen && !isCorrect && <X className="w-4 h-4 text-rose-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Reveal */}
                      {isAnswered && (
                        <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                            💡 Explanation
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {q.explanation || `सही उत्तर (${q.answer}) है।`}
                          </p>
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* QUIZ TAB */}
          {activeTab === 'quiz' && (
            <div className="bg-gradient-to-b from-slate-900 via-[#111726] to-slate-950 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
                <Zap className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">टॉपिक स्पीड क्विज़</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  इस टॉपिक के सभी महत्वपूर्ण प्रश्नों का समयबद्ध (Timed) टेस्ट शुरू करें और अपनी रैंक देखें।
                </p>
              </div>
              <Link 
  href={`/quiz/${topicId}`}
  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-amber-500/10 transition-all inline-flex items-center gap-2"
>
  <span>Start Quiz Now</span>
  <ChevronRight className="w-4 h-4" />
</Link>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}