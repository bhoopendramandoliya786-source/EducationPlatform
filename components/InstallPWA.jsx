"use client";
import React, { useState, useEffect } from "react";
import { Download, Sparkles } from "lucide-react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (!isInstallable) return null;

  return (
    <div className="fixed top-14 left-4 right-4 z-40 max-w-md mx-auto">
      <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-500/40 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-top-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-white">EduAI Pro App इंस्टॉल करें</div>
            <div className="text-[10px] text-slate-300">फास्ट एक्सेस और स्मूथ टेस्ट के लिए</div>
          </div>
        </div>
        <button
          onClick={handleInstallClick}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-md active:scale-95 transition flex items-center gap-1.5 flex-shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>इंस्टॉल</span>
        </button>
      </div>
    </div>
  );
}
