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
  Layers,
  Share2,
  Bookmark,
  Volume2
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
      <div className="min-h-screen bg-[#050711] text-white flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400 font-medium">टॉपिक लोड हो रहा है...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050711] text-slate-100 font-sans pb-28 selection:bg-indigo-500/30">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-5">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link 
            href={`/chapter/${topicData?.chapters?.id}`}
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors bg-slate-900/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-800 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold">{topicData?.chapters?.name}</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-indigo-400 font-bold truncate max-w-[180px] sm:max-w-xs">
            {topicData?.name}
          </span>
        </div>

        {/* 2026 VIP Topic Header Card */}
        <section className="relative overflow-hidden bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/60 border border-indigo-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                <Layers className="w-3 h-3 text-indigo-400" />
                {topicData?.chapters?.subjects?.name} › {topicData?.chapters?.name}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                +50 XP रिवॉर्ड
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {topicData?.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {topicData?.description || 'इस टॉपिक के सभी थ्योरी नोट्स, 4K डायग्राम्स, प्रैक्टिस MCQs और पिछले वर्षों के प्रश्न नीचे उपलब्ध हैं।'}
            </p>
          </div>

          <div className="relative z-10 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleMarkComplete}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
                isCompleted 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white shadow-indigo-600/25'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isCompleted ? 'पूर्ण हुआ (Completed) ✓' : 'Mark as Complete'}
            </button>
            <span className="text-xs text-slate-400 font-semibold bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
              {mcqList.length} MCQs • {pyqList.length} PYQs
            </span>
          </div>
        </section>

        {/* 4 Tabs Bar (Glassmorphic Slider) */}
        <nav className="grid grid-cols-4 gap-1.5 p-1.5 bg-slate-900/80 border border-slate-800/90 rounded-2xl sticky top-16 z-20 backdrop-blur-xl shadow-xl">
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
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
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
            <div className="space-y-4">
              {notes.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                  इस टॉपिक के लिए अभी कोई नोट्स उपलब्ध नहीं हैं।
                </div>
              ) : (
                notes.map(note => (
                  <article key={note.id} className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3.5 backdrop-blur-sm transition-all">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-slate-100 flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
                        {note.title}
                      </h2>
                      <span className="text-[10px] text-indigo-300 uppercase tracking-wider bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20 font-bold">
                        {note.note_type || 'Study Material'}
                      </span>
                    </div>

                    <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line pl-4 border-l-2 border-indigo-500/40">
                      {note.content}
                    </div>

                    {/* Integrated AI Assistant Strip */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        AI एनहैंस्ड नोट्स
                      </span>
                      <Link
                        href="/ai-tutor"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-950/60 border border-slate-700 hover:border-indigo-500/40 text-indigo-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <span>✨</span> AI से समझें
                      </Link>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}

          {/* MCQs & PYQs TAB (Interactive 1-Touch Reveal) */}
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
                    <div key={q.id} className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 backdrop-blur-sm">
                      
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                          <span className="text-indigo-400 font-black mr-2 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                            Q{idx + 1}
                          </span> 
                          {q.question}
                        </h3>
                        {q.is_pyq && (
                          <span className="shrink-0 px-2.5 py-1 text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-lg">
                            {q.source || 'PYQ'} {q.year || ''}
                          </span>
                        )}
                      </div>

                      {/* 4 Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {['A', 'B', 'C', 'D'].map(optKey => {
                          const optText = q[`option_${optKey.toLowerCase()}`];
                          if (!optText) return null;

                          const isCorrect = q.answer === optKey;
                          const isChosen = userSelected === optKey;

                          let style = "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700";
                          
                          if (isAnswered) {
                            if (isCorrect) {
                              style = "bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold shadow-lg shadow-emerald-900/20";
                            } else if (isChosen) {
                              style = "bg-rose-950/60 border-rose-500 text-rose-300 font-bold";
                            } else {
                              style = "bg-slate-950/30 border-slate-900 text-slate-600 opacity-40";
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
                                <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold bg-white/5 border border-white/10 text-slate-300">
                                  {optKey}
                                </span>
                                <span>{optText}</span>
                              </div>
                              {isAnswered && isCorrect && <span className="text-emerald-400 font-bold text-xs bg-emerald-500/20 px-2 py-0.5 rounded-md">✓ सही</span>}
                              {isAnswered && isChosen && !isCorrect && <span className="text-rose-400 font-bold text-xs bg-rose-500/20 px-2 py-0.5 rounded-md">✕ गलत</span>}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Reveal */}
                      {isAnswered && (
                        <div className="p-4 bg-slate-950/90 border border-indigo-900/40 rounded-xl space-y-1.5 text-xs">
                          <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                            <span>💡</span> व्याख्या (Explanation)
                          </div>
                          <p className="text-slate-300 leading-relaxed">
                            {q.explanation || `सही उत्तर विकल्प (${q.answer}) है।`}
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
            <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 text-center space-y-4 shadow-2xl backdrop-blur-xl">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-300 flex items-center justify-center mx-auto border border-indigo-500/30 text-2xl shadow-lg">
                ⚡
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">टॉपिक स्पीड लाइव क्विज़</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  इस टॉपिक के सभी महत्वपूर्ण प्रश्नों का समयबद्ध (Timed) टेस्ट शुरू करें और अपनी रैंक देखें।
                </p>
              </div>
              <Link 
                href={`/quiz/${topicId}`}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all inline-flex items-center gap-2"
              >
                <span>Start Live Quiz Now</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

        </div>
      </main>

      {/* 2026 VIP Universal Bottom App Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#050711]/90 backdrop-blur-2xl border-t border-slate-800/80 px-4 py-2">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <span className="text-lg">🏠</span>
            <span>होम</span>
          </Link>

          <Link
            href="/subject"
            className="flex flex-col items-center gap-1 text-[11px] font-semibold text-indigo-400 transition"
          >
            <span className="text-lg">📚</span>
            <span>नोट्स</span>
          </Link>

          {/* Floating AI Super Button */}
          <Link
            href="/ai-tutor"
            className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <div className="w-11 h-11 -mt-6 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/40 text-xl border-2 border-[#050711] animate-pulse">
              ✨
            </div>
            <span className="text-indigo-300 font-bold">AI सुपर</span>
          </Link>

          <Link
            href="/quiz"
            className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <span className="text-lg">🎯</span>
            <span>क्विज़</span>
          </Link>

          <Link
            href="/subject"
            className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <span className="text-lg">👤</span>
            <span>प्रोफ़ाइल</span>
          </Link>
        </div>
      </nav>

    </div>
  );
}