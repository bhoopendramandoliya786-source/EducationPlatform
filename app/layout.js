import './globals.css';
import Link from 'next/link';
import { Home, BookOpen, Sparkles, Trophy, User, Search } from 'lucide-react';

export const metadata = {
  title: 'EduAI Pro - राजस्थान प्रतियोगी परीक्षा तैयारी',
  description: '100% Free Smart Notes, MCQs, PYQs & AI Tutor',
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi" className="dark">
      <body className="bg-[#0b0f19] text-slate-100 min-h-screen antialiased flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
        
        {/* Top Navbar with Real Search & Profile */}
        <header className="sticky top-0 z-40 bg-[#0b0f19]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-indigo-500/20">
              E
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-base tracking-tight">EduAI</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">PRO</span>
            </div>
          </Link>

          {/* Search Trigger Button / Bar */}
          <Link
            href="/search"
            className="flex-1 max-w-sm flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:border-indigo-500/50 hover:text-slate-200 transition"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate text-[11px]">सर्च करें विषय, टॉपिक या प्रश्न...</span>
          </Link>

          {/* Right Streak & Login */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
              🔥 12
            </div>
            <Link
              href="/login"
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5" /> Login
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-24 pt-2">
          {children}
        </main>

        {/* Universal Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-800/80 px-3 py-2 flex items-center justify-around">
          <Link href="/" className="flex flex-col items-center text-slate-400 hover:text-indigo-400 active:scale-95 transition">
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">होम</span>
          </Link>
          <Link href="/notes" className="flex flex-col items-center text-slate-400 hover:text-indigo-400 active:scale-95 transition">
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">नोट्स</span>
          </Link>
          <Link href="/ai-tutor" className="flex flex-col items-center -mt-5 group active:scale-95 transition">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-indigo-400 mt-1">AI ट्यूटर</span>
          </Link>
          <Link href="/quiz" className="flex flex-col items-center text-slate-400 hover:text-indigo-400 active:scale-95 transition">
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">क्विज़</span>
          </Link>
          <Link href="/student" className="flex flex-col items-center text-slate-400 hover:text-indigo-400 active:scale-95 transition">
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">प्रोफ़ाइल</span>
          </Link>
        </nav>
      </body>
    </html>
  );
}
