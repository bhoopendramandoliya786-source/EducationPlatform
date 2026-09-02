"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Flame } from "lucide-react";
import TelegramBanner from "../../components/TelegramBanner";
import InstallPWA from "../../components/InstallPWA";
import BottomNavigation from "../../components/BottomNavigation";
import Footer from "../../components/Footer";

export default function AppShell({ children }) {
  const pathname = usePathname();

  // जिन पेजों पर पूरा स्क्रीन स्पेस चाहिए
  const isFocusMode = 
    pathname?.startsWith("/quiz") || 
    pathname?.startsWith("/chapter") || 
    pathname?.startsWith("/ai-tutor") ||
    pathname?.startsWith("/admin");

  return (
    <>
      {/* Smart Compact Header */}
      <header className="sticky top-0 z-40 bg-[#06090e]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between gap-2.5">
        <Link href="/" aria-label="EduAI Pro होमपेज" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
            E
          </div>
          <div className="flex items-center gap-1">
            <span className="font-black text-white text-base tracking-tight">EduAI</span>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">PRO</span>
          </div>
        </Link>

        <Link
          href="/search"
          aria-label="विषय या अध्याय खोजें"
          className="flex-1 max-w-xs flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 hover:border-emerald-500/40 transition"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate text-[11px]">खोजें: विषय, अध्याय...</span>
        </Link>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div aria-label="डेली स्ट्रीक स्कोर" className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>12</span>
          </div>
        </div>
      </header>

      {!isFocusMode && <InstallPWA />}

      <main className="flex-1 w-full">{children}</main>

      {!isFocusMode && (
        <>
          <TelegramBanner />
          <Footer />
          <div className="h-20" aria-hidden="true" />
          <BottomNavigation />
        </>
      )}
    </>
  );
}
