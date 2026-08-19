"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function AdminLogin({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    if (loading) return;

    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("❌ Email और password दोनों जरूरी हैं");
      return;
    }

    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (loginError || !data?.user) {
        setError("❌ Email या password गलत है");
        return;
      }

      const user = data.user;

      /*
       * Admin verification
       *
       * profiles table में role = admin होना जरूरी है।
       * इससे केवल authenticated admin ही dashboard खोल सकता है।
       */
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (
        profileError ||
        !profile ||
        profile.role !== "admin"
      ) {
        await supabase.auth.signOut();

        setError("❌ इस account को Admin access नहीं है");
        return;
      }

      /*
       * Login सफल
       */
      if (typeof onSuccess === "function") {
        onSuccess();
      }
    } catch (err) {
      console.error("Admin login error:", err);

      setError("❌ Login के दौरान समस्या हुई। फिर से कोशिश करें।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#020617",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: "18px",
          padding: "28px",
          color: "#fff",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              fontSize: "42px",
              marginBottom: "8px",
            }}
          >
            🔐
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "24px",
            }}
          >
            Admin Login
          </h1>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "13px",
              marginTop: "8px",
            }}
          >
            EducationPlatform Administration
          </p>
        </div>

        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "13px",
            color: "#cbd5e1",
          }}
        >
          Admin Email
        </label>

        <input
          type="email"
          autoComplete="username"
          placeholder="Enter admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "10px",
            border: "1px solid #334155",
            background: "#020617",
            color: "#fff",
            outline: "none",
          }}
        />

        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "13px",
            color: "#cbd5e1",
          }}
        >
          Password
        </label>

        <input
          type="password"
          autoComplete="current-password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "10px",
            border: "1px solid #334155",
            background: "#020617",
            color: "#fff",
            outline: "none",
          }}
        />

        {error && (
          <div
            role="alert"
            style={{
              background: "#450a0a",
              border: "1px solid #7f1d1d",
              color: "#fca5a5",
              padding: "10px",
              borderRadius: "10px",
              marginBottom: "15px",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px",
            background: loading ? "#64748b" : "#f59e0b",
            color: "#000",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Checking..." : "Login to Admin Panel"}
        </button>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: "11px",
            marginTop: "18px",
            marginBottom: 0,
          }}
        >
          Authorized administrators only
        </p>
      </form>
    </main>
  );
}