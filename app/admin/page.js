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

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  // 🎯 Clean Active Tab State (structure | notes | questions | quizzes)
  const [activeTab, setActiveTab] = useState("structure");

  /*
   * ---------------------------------------------------------
   * VERIFY ADMIN
   * ---------------------------------------------------------
   */

  const verifyAdminSession = useCallback(async () => {
    setCheckingAdmin(true);

    try {
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        setSession(null);
        return false;
      }

      if (!currentSession?.user) {
        setSession(null);
        return false;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", currentSession.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Admin profile verification error:", profileError);
        setSession(null);
        return false;
      }

      if (!profile || profile.role !== "admin") {
        console.warn("Non-admin attempted admin access.");
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

  /*
   * ---------------------------------------------------------
   * INITIAL SESSION CHECK & AUTH LISTENER
   * ---------------------------------------------------------
   */

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

  /*
   * ---------------------------------------------------------
   * LOGOUT
   * ---------------------------------------------------------
   */

  const handleLogout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
      }
    } catch (error) {
      console.error("Logout exception:", error);
    } finally {
      setSession(null);
    }
  }, []);

  /*
   * ---------------------------------------------------------
   * LOADING SCREEN
   * ---------------------------------------------------------
   */

  if (loading || checkingAdmin) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#020617",
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "380px",
            boxSizing: "border-box",
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: "18px",
            padding: "30px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "38px", marginBottom: "10px" }}>🔐</div>
          <h2 style={{ margin: 0, fontSize: "22px" }}>Admin Panel</h2>
          <p style={{ color: "#94a3b8", marginTop: "10px", marginBottom: 0, fontSize: "14px" }}>
            Admin access verify किया जा रहा है...
          </p>
        </div>
      </main>
    );
  }

  /*
   * ---------------------------------------------------------
   * NOT ADMIN / NOT LOGGED IN
   * ---------------------------------------------------------
   */

  if (!session) {
    return <AdminLogin onSuccess={verifyAdminSession} />;
  }

  /*
   * ---------------------------------------------------------
   * ADMIN DASHBOARD (CLEAN TABBED ARCHITECTURE)
   * ---------------------------------------------------------
   */

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#fff",
        padding: "16px",
        paddingBottom: "80px",
        boxSizing: "border-box",
        fontFamily: "system-ui, -apple-system, sans-serif",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      {/* HEADER */}
      <DashboardHeader onLogout={handleLogout} />

      {/* ADMIN STATUS BAR */}
      <section
        style={{
          marginTop: "16px",
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: "18px",
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
            ⚙️ EduAI Pro Control Center
          </h1>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "12px", marginTop: "2px" }}>
            Clean Modular Architecture (Subject ➔ Chapter ➔ Content)
          </p>
        </div>
        <div
          style={{
            color: "#10b981",
            fontSize: "12px",
            fontWeight: "bold",
            background: "rgba(16, 185, 129, 0.1)",
            padding: "4px 10px",
            borderRadius: "20px",
            border: "1px solid rgba(16, 185, 129, 0.2)",
          }}
        >
          ● Admin Active
        </div>
      </section>

      {/* 🚀 4 CLEAN NAVIGATION TABS (NO CLUTTER) */}
      <nav
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "8px",
          marginTop: "20px",
          marginBottom: "24px",
        }}
      >
        <button
          onClick={() => setActiveTab("structure")}
          style={{
            padding: "12px 8px",
            borderRadius: "14px",
            border: activeTab === "structure" ? "1px solid #6366f1" : "1px solid #1e293b",
            background: activeTab === "structure" ? "rgba(99, 102, 241, 0.2)" : "#0f172a",
            color: activeTab === "structure" ? "#818cf8" : "#94a3b8",
            fontWeight: "bold",
            fontSize: "13px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          🏛️ स्ट्रक्चर (Exams/Subjects)
        </button>

        <button
          onClick={() => setActiveTab("notes")}
          style={{
            padding: "12px 8px",
            borderRadius: "14px",
            border: activeTab === "notes" ? "1px solid #10b981" : "1px solid #1e293b",
            background: activeTab === "notes" ? "rgba(16, 185, 129, 0.2)" : "#0f172a",
            color: activeTab === "notes" ? "#34d399" : "#94a3b8",
            fontWeight: "bold",
            fontSize: "13px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          📖 नोट्स (Notes Sheet)
        </button>

        <button
          onClick={() => setActiveTab("questions")}
          style={{
            padding: "12px 8px",
            borderRadius: "14px",
            border: activeTab === "questions" ? "1px solid #f59e0b" : "1px solid #1e293b",
            background: activeTab === "questions" ? "rgba(245, 158, 11, 0.2)" : "#0f172a",
            color: activeTab === "questions" ? "#fbbf24" : "#94a3b8",
            fontWeight: "bold",
            fontSize: "13px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          ❓ प्रश्न बैंक (MCQ/JSON)
        </button>

        <button
          onClick={() => setActiveTab("quizzes")}
          style={{
            padding: "12px 8px",
            borderRadius: "14px",
            border: activeTab === "quizzes" ? "1px solid #ec4899" : "1px solid #1e293b",
            background: activeTab === "quizzes" ? "rgba(236, 72, 153, 0.2)" : "#0f172a",
            color: activeTab === "quizzes" ? "#f472b6" : "#94a3b8",
            fontWeight: "bold",
            fontSize: "13px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          🏆 टेस्ट मैनेजर (Quizzes)
        </button>
      </nav>

      {/* ----------------- TAB 1: STRUCTURE (EXAMS, SUBJECTS, CHAPTERS) ----------------- */}
      {activeTab === "structure" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <BannerManager />
          <ExamManager />
          <SubjectManager />
          <ChapterManager />
        </div>
      )}

      {/* ----------------- TAB 2: NOTES MANAGER ----------------- */}
      {activeTab === "notes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <NotesManager />
        </div>
      )}

      {/* ----------------- TAB 3: QUESTIONS & BULK JSON IMPORTER ----------------- */}
      {activeTab === "questions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <JsonImport />
          <QuestionManager />
        </div>
      )}

      {/* ----------------- TAB 4: QUIZZES / SPEED TESTS ----------------- */}
      {activeTab === "quizzes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <QuizManager />
        </div>
      )}

      {/* FOOTER */}
      <footer
        style={{
          marginTop: "40px",
          padding: "20px",
          textAlign: "center",
          color: "#64748b",
          borderTop: "1px solid #1e293b",
          fontSize: "12px",
        }}
      >
        EduAI Pro Control Dashboard • Zero Clutter Architecture
      </footer>
    </main>
  );
}