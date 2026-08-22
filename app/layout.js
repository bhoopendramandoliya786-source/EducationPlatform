import './globals.css';
import Link from 'next/link';
import { Home, BookOpen, Sparkles, Trophy, User } from 'lucide-react';

export const metadata = {
  title: 'EduAI Pro - Rajasthan Exam Prep',
  description: '100% Free Complete Exam Syllabus, Smart Notes & Test Engine',
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased pb-20">
        {children}

        {/* Universal Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 py-2 flex items-center justify-around">
          <Link href="/" className="flex flex-col items-center text-slate-400 hover:text-indigo-400">
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-semibold">होम</span>
          </Link>
          <Link href="/notes" className="flex flex-col items-center text-slate-400 hover:text-indigo-400">
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-semibold">नोट्स</span>
          </Link>
          <Link href="/ai-tutor" className="flex flex-col items-center -mt-5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 group-active:scale-95 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-indigo-400 mt-1">AI सुपर</span>
          </Link>
          <Link href="/quiz" className="flex flex-col items-center text-slate-400 hover:text-indigo-400">
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-semibold">क्विज़</span>
          </Link>
          <Link href="/admin" className="flex flex-col items-center text-slate-400 hover:text-indigo-400">
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-semibold">एडमिन</span>
          </Link>
        </nav>
      </body>
    </html>
  );
}
