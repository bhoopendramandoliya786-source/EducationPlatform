'use client';

import { supabase } from "../../lib/supabase";

export default function LogoutButton() {
  async function logout() {
    // 1. Supabase Session Logout
    await supabase.auth.signOut();

    // 2. Hard redirect to Public Home Page (कैश पूरी तरह खाली हो जाएगा और बैक बटन पर पुराना डेटा नहीं दिखेगा)
    window.location.href = "/";
  }

  return (
    <button
      onClick={logout}
      className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
    >
      Logout
    </button>
  );
}