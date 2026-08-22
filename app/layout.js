import './globals.css';
import Link from 'next/link';
import { Home, BookOpen, Sparkles, Trophy, Settings } from 'lucide-react';

export const metadata = {
  title: 'EduAI Pro - राजस्थान परीक्षा तैयारी',
  description: '100% Free Complete Exam Syllabus, Smart Notes, MCQs & Test Engine',
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased flex flex-col justify-between">
        {/* Top Universal Navbar */}
        <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-indigo-500/30">
              E
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-base tracking-tight">EduAI</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">PRO</span>
            </div>
          </Link>
          <Link
            href="/admin"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
          >
            Admin Panel
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-24">
          {children}
        </main>

        {/* Universal Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-4 py-2 flex items-center justify-around">
          <Link href="/" className="flex flex-col items-center text-slate-400 hover:text-indigo-400">
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-semibold">होम</span>
          </Link>
          <Link href="/notes" className="flex flex-col items-center text-slate-400 hover:text-indigo-400">
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-semibold">नोट्स</span>
          </Link>
          <Link href="/ai-tutor" className="flex flex-col items-center -mt-5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-indigo-400 mt-1">AI सुपर</span>
          </Link>
          <Link href="/quiz" className="flex flex-col items-center text-slate-400 hover:text-indigo-400">
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-semibold">क्विज़</span>
          </Link>
          <Link href="/admin" className="flex flex-col items-center text-slate-400 hover:text-indigo-400">
            <Settings className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-semibold">एडमिन</span>
          </Link>
        </nav>
      </body>
    </html>
  );
}
