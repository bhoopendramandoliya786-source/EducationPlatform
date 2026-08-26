"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

import AdminLogin from "./components/AdminLogin";
import DashboardHeader from "./components/DashboardHeader";

import ExamManager from "./components/ExamManager";
import SubjectManager from "./components/SubjectManager";
import ChapterManager from "./components/ChapterManager";
import QuestionManager from "./components/QuestionManager";
import NotesManager from "./components/NotesManager";
import QuizManager from "./components/QuizManager";
import BannerManager from "./components/BannerManager";
import JsonImport from "./components/JsonImport";

import { BookOpen, FileText, HelpCircle, Trophy, Layers } from "lucide-react";

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  // 🎯 Active Tab State (structure | notes | questions | tests)
  const [activeTab, setActiveTab] = useState("structure");

  /*
   * ---------------------------------------------------------
   * VERIFY ADMIN SESSION
   * ---------------------------------------------------------
   */
  const verifyAdminSession = useCallback(async () => {
    setCheckingAdmin(true);

    try {
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !currentSession?.user) {
        setSession(null);
        return false;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", currentSession.user.id)
        .maybeSingle();

      if (profileError || !profile || profile.role !== "admin") {
        console.warn("Non-admin attempted access.");
        await supabase.auth.signOut();
        setSession(null);
        return false;
      }

      setSession(currentSession);
      return true;
    } catch (error) {
      console.error("Admin verification error:", error);
      setSession(null);
      return false;
    } finally {
      setCheckingAdmin(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    async function initialize() {
      if (!mounted) return;
      await verifyAdminSession();
    }
    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!mounted) return;
      if (event === "SIGNED_OUT" || !currentSession) {
        setSession(null);
        setLoading(false);
        setCheckingAdmin(false);
        return;
      }
      setTimeout(() => {
        if (!mounted) return;
        verifyAdminSession();
      }, 0);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [verifyAdminSession]);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout exception:", error);
    } finally {
      setSession(null);
    }
  }, []);

  if (loading || checkingAdmin) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-3">
          <div className="text-3xl animate-bounce">🔐</div>
          <h2 className="text-base font-bold text-white">EduAI Pro Control</h2>
          <p className="text-xs text-slate-400">Admin access verify किया जा रहा है...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return <AdminLogin onSuccess={verifyAdminSession} />;
  }

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 font-sans pb-24">
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 pt-4 space-y-5">

        {/* HEADER */}
        <DashboardHeader onLogout={handleLogout} />

        {/* STATUS BANNER */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              ⚙️ EduAI Pro Control Center
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Direct Flow: Subject ➔ Chapter ➔ Smart Notes & Question Bank
            </p>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            ● Admin Active
          </span>
        </section>

        {/* 🚀 4 CLEAN NAVIGATION TABS */}
        <nav className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => setActiveTab("structure")}
            className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
              activeTab === "structure"
                ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <Layers className={`w-4 h-4 ${activeTab === "structure" ? "text-indigo-400" : "text-slate-500"}`} />
            <div>
              <div className="text-xs font-bold leading-tight">1. विषय एवं अध्याय</div>
              <div className="text-[9px] text-slate-500">Subjects & Chapters</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("notes")}
            className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
              activeTab === "notes"
                ? "bg-emerald-600/20 border-emerald-500 text-white shadow-lg"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTab === "notes" ? "text-emerald-400" : "text-slate-500"}`} />
            <div>
              <div className="text-xs font-bold leading-tight">2. स्मार्ट नोट्स</div>
              <div className="text-[9px] text-slate-500">Booklet Sheets</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("questions")}
            className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
              activeTab === "questions"
                ? "bg-amber-600/20 border-amber-500 text-white shadow-lg"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <HelpCircle className={`w-4 h-4 ${activeTab === "questions" ? "text-amber-400" : "text-slate-500"}`} />
            <div>
              <div className="text-xs font-bold leading-tight">3. प्रश्न बैंक & JSON</div>
              <div className="text-[9px] text-slate-500">MCQs & 1-Click Import</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("tests")}
            className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
              activeTab === "tests"
                ? "bg-purple-600/20 border-purple-500 text-white shadow-lg"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <Trophy className={`w-4 h-4 ${activeTab === "tests" ? "text-purple-400" : "text-slate-500"}`} />
            <div>
              <div className="text-xs font-bold leading-tight">4. टेस्ट एवं बैनर</div>
              <div className="text-[9px] text-slate-500">Quizzes, Exams & Ads</div>
            </div>
          </button>
        </nav>

        {/* ----------------- TAB 1: STRUCTURE (SUBJECTS & CHAPTERS) ----------------- */}
        {activeTab === "structure" && (
          <div className="space-y-6">
            <SubjectManager />
            <ChapterManager />
          </div>
        )}

        {/* ----------------- TAB 2: NOTES MANAGER ----------------- */}
        {activeTab === "notes" && (
          <div className="space-y-6">
            <NotesManager />
          </div>
        )}

        {/* ----------------- TAB 3: QUESTIONS & JSON IMPORTER ----------------- */}
        {activeTab === "questions" && (
          <div className="space-y-6">
            <JsonImport />
            <QuestionManager />
          </div>
        )}

        {/* ----------------- TAB 4: QUIZZES, EXAMS & BANNERS ----------------- */}
        {activeTab === "tests" && (
          <div className="space-y-6">
            <ExamManager />
            <QuizManager />
            <BannerManager />
          </div>
        )}

        {/* FOOTER */}
        <footer className="pt-8 pb-4 text-center text-[11px] text-slate-600 border-t border-slate-800/80">
          EduAI Pro Control Dashboard • Fast & Clean Multi-Source Engine
        </footer>

      </div>
    </main>
  );
}