"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { Flame, Trophy } from "lucide-react";

export default function StudentStreakCard({ totalTests }) {
  const [streak, setStreak] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setIsLoggedIn(true);

          const { data: profile } = await supabase
            .from("profiles")
            .select("streak_count")
            .eq("id", user.id)
            .single();

          if (profile?.streak_count) {
            setStreak(profile.streak_count);
          }

          const { count } = await supabase
            .from("progress")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id);

          setSolvedCount(count || 0);
        }
      } catch (err) {
        console.error("Streak load error:", err);
      }
    }

    loadUserData();
  }, []);

  return (
    <section className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-2 gap-3 shadow-md">
      {/* Streak Box */}
      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-500">
          <Flame className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="text-xs font-black text-white flex items-center gap-1">
            {streak} <span className="text-[10px] text-orange-400 font-bold">दिन</span>
          </div>
          <p className="text-[9px] text-slate-400">लगातार अभ्यास</p>
        </div>
      </div>

      {/* Solved PYQ Box */}
      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Trophy className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-black text-white">
            {isLoggedIn ? `${solvedCount} हल` : `${totalTests}+`}
          </div>
          <p className="text-[9px] text-slate-400">PYQ प्रश्न</p>
        </div>
      </div>
    </section>
  );
}
