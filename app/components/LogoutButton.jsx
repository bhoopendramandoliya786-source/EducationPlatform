'use client';

import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleLogout() {
    try {
      setLoading(true);
      
      // 1. Supabase Client से टोकन डिलीट करें
      await supabase.auth.signOut();

      // 2. ब्राउज़र में बची हुई सारी Supabase Auth कुकीज़ जबरन क्लियर करें
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // 3. लोकल स्टोरेज और सेशन स्टोरेज खाली करें
      if (typeof window !== "undefined") {
        window.localStorage.clear();
        window.sessionStorage.clear();
        
        // 4. सीधे पब्लिक होमपेज पर हार्ड रीडायरेक्ट
        window.location.replace('/');
      }
    } catch (err) {
      console.error("Logout Error:", err);
      window.location.replace('/');
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}