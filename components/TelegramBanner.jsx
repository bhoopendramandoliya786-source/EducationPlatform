"use client";

import React, { useState } from "react";
import { Send, X, Sparkles } from "lucide-react";

export default function TelegramBanner() {
  const [showBanner, setShowBanner] = useState(true);

  if (!showBanner) return null;

  return (
    <aside
      aria-label="Telegram Channel Banner"
      className="fixed bottom-20 left-3.5 right-3.5 z-40 max-w-md mx-auto pointer-events-auto font-sans select-none"
    >
      <div className="p-3 rounded-2xl bg-[#06090e]/95 border border-emerald-500/30 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-2 relative overflow-hidden">
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

        <a
          href="https://t.me/EduAI_RajasthanExam"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="EduAI टेलीग्राम चैनल ज्वाइन करें फ्री PDF नोट्स और क्विज़ के लिए"
          className="flex items-center gap-2.5 flex-1 hover:opacity-90 transition min-w-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 shrink-0 font-bold">
            <Send className="w-4 h-4 fill-slate-950" />
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-xs font-black text-white flex items-center gap-1.5 truncate">
              <span>टेलीग्राम चैनल ज्वाइन करें</span>
              <span className="text-[9px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-1 py-0.5 rounded font-black tracking-wide shrink-0">
                फ्री PDF
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">डेली क्विज़, नोट्स और परीक्षा अपडेट्स</p>
          </div>
        </a>

        <button
          type="button"
          onClick={() => setShowBanner(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
          aria-label="टेलीग्राम बैनर बंद करें"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}