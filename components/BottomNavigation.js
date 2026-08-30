"use client";

import Link from "next/link";
import { Home, BookOpen, Sparkles, Trophy, User } from "lucide-react";
import { usePathname } from "next/navigation";

export default function BottomNavigation() {
  const pathname = usePathname();

  if (pathname === "/ai-tutor") {
    return null;
  }

  return (
    <nav
      aria-label="मुख्य नेविगेशन बार"
      className="bottom-navigation fixed bottom-0 left-0 right-0 z-40 bg-[#090e1a]/95 backdrop-blur-xl border-t border-slate-800/80 px-4 py-2 flex items-center justify-around shadow-2xl"
    >
      <Link href="/" className="flex items-center flex-col text-slate-400 hover:text-indigo-400">
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">होम</span>
      </Link>

      <Link href="/notes" className="flex items-center flex-col text-slate-400 hover:text-indigo-400">
        <BookOpen className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">नोट्स</span>
      </Link>

      <Link href="/ai-tutor" className="flex items-center flex-col -mt-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
          <Sparkles className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold text-indigo-400 mt-0.5">
          AI ट्यूटर
        </span>
      </Link>

      <Link href="/quiz" className="flex items-center flex-col text-slate-400 hover:text-indigo-400">
        <Trophy className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">टेस्ट</span>
      </Link>

      <Link href="/student" className="flex items-center flex-col text-slate-400 hover:text-indigo-400">
        <User className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">प्रोफाइल</span>
      </Link>
    </nav>
  );
}
