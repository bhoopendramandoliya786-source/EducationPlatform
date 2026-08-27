"use client";
import React, { useState } from "react";
import { Send, X } from "lucide-react";

export default function TelegramBanner() {
  const [showBanner, setShowBanner] = useState(true);

  if (!showBanner) return null;

  return (
    <aside aria-label="Telegram Channel Banner" className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto pointer-events-auto">
      <div className="p-3 rounded-2xl bg-slate-900/95 border border-sky-500/30 backdrop-blur-md shadow-2xl flex items-center justify-between gap-2">
        <a
          href="https://t.me/EduAI_RajasthanExam"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="EduAI टेलीग्राम चैनल ज्वाइन करें फ्री PDF नोट्स और क्विज़ के लिए"
          className="flex items-center gap-2.5 flex-1 hover:opacity-90 transition"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Send className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>टेलीग्राम चैनल ज्वाइन करें</span>
              <span className="text-[9px] bg-sky-500/20 text-sky-400 border border-sky-500/30 px-1 py-0.5 rounded font-semibold">फ्री PDF</span>
            </div>
            <p className="text-[10px] text-slate-400">डेली क्विज़, नोट्स और परीक्षा अपडेट्स</p>
          </div>
        </a>
        <button
          type="button"
          onClick={() => setShowBanner(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          aria-label="टेलीग्राम बैनर बंद करें"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}