import "./globals.css";
import Link from "next/link";
import { Home, BookOpen, Sparkles, Trophy, User, Search, Flame } from "lucide-react";

export const metadata = {
  title: "EduAI Pro - प्रतियोगी परीक्षाओं की सर्वश्रेष्ठ तैयारी",
  description: "100% फ्री स्मार्ट नोट्स, मॉक टेस्ट सीरीज, विगत वर्ष प्रश्न पत्र एवं 24/7 AI ट्यूटर सपोर्ट।",
  keywords: "RAS, REET, CET, Rajasthan SI, GK Notes, Mock Test, PYQ, Competition Exam Prep",
  openGraph: {
    title: "EduAI Pro - Complete Exam Prep Platform",
    description: "Syllabus, Smart Notes, Test Engine & AI Doubt Solver",
    type: "website",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi" className="dark">
      <body className="bg-[#070b14] text-slate-100 min-h-screen antialiased flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-50 bg-[#070b14]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
              E
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-base tracking-tight">EduAI</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">PRO</span>
            </div>
          </Link>

          {/* Quick Search */}
          <Link
            href="/search"
            className="flex-1 max-w-sm flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800/90 text-xs text-slate-400 hover:border-indigo-500/50 hover:text-slate-200 transition shadow-inner"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate text-[11px]">खोजें: विषय, अध्याय या टॉपिक...</span>
          </Link>

          {/* Streak & User Action */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>12</span>
            </div>
            <Link
              href="/student"
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">प्रोफाइल</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Body Content */}
        <main className="flex-1 pb-24 pt-2">
          {children}
        </main>

        {/* VIP 5-Touch Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#090e1a]/95 backdrop-blur-xl border-t border-slate-800/80 px-4 py-2 flex items-center justify-around">
          <Link href="/" className="flex flex-col items-center text-slate-400 hover:text-indigo-400 active:scale-95 transition">
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">होम</span>
          </Link>
          <Link href="/notes" className="flex flex-col items-center text-slate-400 hover:text-indigo-400 active:scale-95 transition">
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">नोट्स</span>
          </Link>
          <Link href="/ai-tutor" className="flex flex-col items-center -mt-5 group active:scale-95 transition">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/40 group-hover:scale-105 transition">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-indigo-400 mt-1">AI ट्यूटर</span>
          </Link>
          <Link href="/quiz" className="flex flex-col items-center text-slate-400 hover:text-indigo-400 active:scale-95 transition">
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">टेस्ट</span>
          </Link>
          <Link href="/student" className="flex flex-col items-center text-slate-400 hover:text-indigo-400 active:scale-95 transition">
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">प्रोफाइल</span>
          </Link>
        </nav>
      </body>
    </html>
  );
}
