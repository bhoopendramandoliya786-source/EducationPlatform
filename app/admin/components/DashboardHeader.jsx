"use client";

import { useState } from "react";

export default function DashboardHeader({ onLogout }) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      if (typeof onLogout === "function") {
        await onLogout();
      }
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header
      style={{
        width: "100%",
        boxSizing: "border-box",
        background: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: "14px",
        padding: "15px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px",
        flexWrap: "wrap",
      }}
    >
      {/* Brand */}
      <div
        style={{
          minWidth: 0,
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#fff",
            fontSize: "20px",
            lineHeight: "1.3",
          }}
        >
          ⚙️ Admin Panel
        </h2>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "5px",
            fontSize: "12px",
            color: "#10b981",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              background: "#10b981",
              borderRadius: "50%",
              display: "inline-block",
            }}
          />

          Admin Authenticated
        </div>
      </div>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        style={{
          background: loggingOut ? "#7f1d1d" : "#ef4444",
          color: "#fff",
          border: "none",
          padding: "9px 15px",
          borderRadius: "9px",
          fontWeight: "bold",
          cursor: loggingOut ? "not-allowed" : "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {loggingOut ? "Logging out..." : "Logout"}
      </button>
    </header>
  );
}