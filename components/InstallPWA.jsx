"use client";
import React, { useState, useEffect } from "react";
import { Download, Sparkles, X } from "lucide-react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Service Worker Register
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => console.log("SW Reg fail", err));
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      alert("ऐप इंस्टॉल करने के लिए ब्राउज़र के ऊपर 3-डॉट्स (⋮) पर क्लिक करके 'Install app' या 'Add to Home screen' चुनें।");
    }
  };

  if (!showBanner) return null;

  return (
    <div className="px-4 pt-2">
      <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-900/90 via-purple-900/80 to-slate-900 border border-indigo-500/40 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-white">EduAI Pro मोबाइल ऐप</div>
            <div className="text-[10px] text-slate-300">होम स्क्रीन पर जोड़ें और 1-टैप में खोलें</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-md active:scale-95 transition flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>इंस्टॉल</span>
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="p-1.5 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
