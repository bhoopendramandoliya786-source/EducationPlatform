'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import Navbar from '../components/Navbar';
import { 
  User, 
  BookOpen, 
  Trophy, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Flame, 
  Bookmark, 
  Zap, 
  BarChart3,
  LogOut,
  PlayCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    completedTopics: 0,
    totalAttempts: 0,
    averageScore: 0,
    totalBookmarks: 0,
  });
  const [lastStudiedTopic, setLastStudiedTopic] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        // 1. Check Auth User
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        setUser(currentUser);

        // 2. Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();
        setProfile(profileData);

        // 3. Completed Topics Count & Last Studied
        const { data: progressData } = await supabase
          .from('progress')
          .select('*, topics(id, name, description, chapters(id, name, subjects(id, name)))')
          .eq('user_id', currentUser.id)
          .order('last_studied_at', { ascending: false });

        const completedCount = progressData ? progressData.filter(p => p.completed).length : 0;
        if (progressData && progressData.length > 0) {
          setLastStudiedTopic(progressData[0].topics);
        }

        // 4. Quiz Attempts Stats
        const { data: attemptsData } = await supabase
          .from('attempts')
          .select('*, quizzes(title)')
          .eq('user_id', currentUser.id)
          .order('started_at', { ascending: false })
          .limit(5);

        const totalAttemptsCount = attemptsData ? attemptsData.length : 0;
        const avgScore = totalAttemptsCount > 0 
          ? Math.round(attemptsData.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalAttemptsCount) 
          : 0;

        // 5. Bookmarks Count
        const { count: bookmarksCount } = await supabase
          .from('bookmarks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUser.id);

        setStats({
          completedTopics: completedCount,
          totalAttempts: totalAttemptsCount,
          averageScore: avgScore,
          totalBookmarks: bookmarksCount || 0,
        });

        setRecentAttempts(attemptsData || []);

      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans pb-24 selection:bg-blue-500/30">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Profile Card */}
        <section className="bg-gradient-to-br from-slate-900 via-[#111726] to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-400 p-0.5 shadow-lg shadow-blue-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-xl text-white">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-white">
                  {profile?.full_name || 'स्मार्ट स्टूडेंट'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate max-w-[240px]">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-all self-stretch sm:self-auto justify-center"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>लॉगआउट</span>
          </button>
        </section>

        {/* 4 Stats Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">पूरे किए टॉपिक्स</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats.completedTopics}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">क्विज़ अटेम्प्ट्स</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats.totalAttempts}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">औसत स्कोर</span>
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats.averageScore} <span className="text-xs text-slate-500">अंक</span></div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">बुकमार्क्स</span>
              <Bookmark className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats.totalBookmarks}</div>
          </div>
        </section>

        {/* Resume Learning Card */}
        {lastStudiedTopic && (
          <section className="bg-gradient-to-r from-blue-900/30 via-slate-900 to-slate-900 border border-blue-500/30 rounded-3xl p-5 sm:p-6 shadow-lg flex items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>अंतिम पढ़ा हुआ टॉपिक (Continue)</span>
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white truncate">
                {lastStudiedTopic.name}
              </h2>
              <p className="text-xs text-slate-400 truncate">
                {lastStudiedTopic.chapters?.subjects?.name} › {lastStudiedTopic.chapters?.name}
              </p>
            </div>

            <Link
              href={`/topic/${lastStudiedTopic.id}`}
              className="shrink-0 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all"
            >
              <span>आगे पढ़ें</span>
              <PlayCircle className="w-4 h-4" />
            </Link>
          </section>
        )}

        {/* Quick Study Actions */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Link
            href="/subject"
            className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  सभी विषय पढ़ें (Explore Subjects)
                </h3>
                <p className="text-xs text-slate-400">नोट्स और महत्वपूर्ण थ्योरी</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
          </Link>

          <Link
            href="/quiz"
            className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                  लाइव स्पीड क्विज़ (Take Quiz)
                </h3>
                <p className="text-xs text-slate-400">टाइमर के साथ टेस्ट दें</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
          </Link>
        </section>

        {/* Recent Attempts History */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>हालिया क्विज़ टेस्ट (Recent Activity)</span>
          </h2>

          <div className="space-y-2.5">
            {recentAttempts.length > 0 ? (
              recentAttempts.map((att) => (
                <div 
                  key={att.id}
                  className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-bold text-white">
                      {att.quizzes?.title || 'प्रैक्टिस टेस्ट'}
                    </h3>
                    <div className="text-[11px] text-slate-500">
                      {new Date(att.started_at).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-bold text-emerald-400">
                      {att.correct_answers}/{att.total_questions} सही
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      स्कोर: {att.score} अंक
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800 text-center text-xs text-slate-500">
                आपने अभी तक कोई क्विज़ टेस्ट नहीं दिया है।
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}