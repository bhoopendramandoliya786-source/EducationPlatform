"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

import AdminLogin from "./components/AdminLogin";
import DashboardHeader from "./components/DashboardHeader";

import ExamManager from "./components/ExamManager";
import SubjectManager from "./components/SubjectManager";
import ChapterManager from "./components/ChapterManager";
import TopicManager from "./components/TopicManager";
import QuestionManager from "./components/QuestionManager";
import NotesManager from "./components/NotesManager";
import QuizManager from "./components/QuizManager";
import BannerManager from "./components/BannerManager";
import JsonImport from "./components/JsonImport";

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

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
   * ADMIN DASHBOARD
   * ---------------------------------------------------------
   */

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#fff",
        padding: "20px",
        paddingBottom: "60px",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HEADER */}
      <DashboardHeader onLogout={handleLogout} />

      {/* ADMIN INFORMATION */}
      <section
        style={{
          marginTop: "20px",
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: "16px",
          padding: "18px",
        }}
      >
        <h1 style={{ margin: 0, marginBottom: "6px", fontSize: "24px" }}>
          ⚙️ EducationPlatform Admin
        </h1>
        <p style={{ color: "#94a3b8", margin: 0, fontSize: "14px" }}>
          Content Management System
        </p>
        <div
          style={{
            marginTop: "12px",
            color: "#10b981",
            fontSize: "13px",
            fontWeight: "bold",
          }}
        >
          ● Admin authenticated
        </div>
      </section>

      {/* EXAM & SYLLABUS MANAGER */}
      <section style={{ marginTop: "30px" }}>
        <h2 style={{ marginBottom: "6px", color: "#f59e0b" }}>
          🏆 Target Exams & Syllabus Mapping
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: 0 }}>
          परीक्षाएं जोड़ें और प्रत्येक परीक्षा में शामिल विषय (Subjects) मैप करें
        </p>
        <ExamManager />
      </section>

      {/* CONTENT MANAGEMENT */}
      <section style={{ marginTop: "40px" }}>
        <h2 style={{ marginBottom: "6px" }}>
          📚 Content Management
        </h2>
        <p style={{ color: "#64748b", fontSize: "14px", marginTop: 0 }}>
          Subjects → Chapters → Topics → Notes / Questions / Quizzes
        </p>
      </section>

      {/* SUBJECT */}
      <SubjectManager />

      {/* CHAPTER */}
      <ChapterManager />

      {/* TOPIC */}
      <TopicManager />

      {/* QUESTIONS */}
      <QuestionManager />

      {/* NOTES */}
      <NotesManager />

      {/* QUIZZES */}
      <QuizManager />

      {/* JSON IMPORT */}
      <JsonImport />

      {/* FOOTER */}
      <footer
        style={{
          marginTop: "40px",
          padding: "20px",
          textAlign: "center",
          color: "#64748b",
          borderTop: "1px solid #1e293b",
          fontSize: "13px",
        }}
      >
        EducationPlatform Admin System
      </footer>
    </main>
  );
}