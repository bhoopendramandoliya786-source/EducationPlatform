"use client";

import Link from "next/link";
import { Home, BookOpen, Sparkles, Trophy, User } from "lucide-react";
import { usePathname } from "next/navigation";

export default function BottomNavigation() {
  const pathname = usePathname();

  if (pathname === "/ai-tutor") {
    return null;
  }

  const navItems = [
    { href: "/", label: "होम", icon: Home, exact: true },
    { href: "/notes", label: "नोट्स", icon: BookOpen },
    { href: "/quiz", label: "टेस्ट", icon: Trophy },
    { href: "/student", label: "प्रोफाइल", icon: User },
  ];

  const isRouteActive = (item) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <nav
      aria-label="मुख्य नेविगेशन बार"
      className="bottom-navigation fixed bottom-0 left-0 right-0 z-40 bg-[#06090e]/95 backdrop-blur-xl border-t border-slate-850 px-4 py-2 flex items-center justify-around shadow-2xl font-sans select-none"
    >
      {/* 1. होम */}
      {(() => {
        const item = navItems[0];
        const active = isRouteActive(item);
        const Icon = item.icon;
        return (
          <Link
            href={item.href}
            className={`flex items-center flex-col transition active:scale-90 ${
              active ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })()}

      {/* 2. नोट्स */}
      {(() => {
        const item = navItems[1];
        const active = isRouteActive(item);
        const Icon = item.icon;
        return (
          <Link
            href={item.href}
            className={`flex items-center flex-col transition active:scale-90 ${
              active ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })()}

      {/* 3. AI ट्यूटर (सेंटर फ्लोटिंग बटन) */}
      <Link href="/ai-tutor" className="flex items-center flex-col -mt-5 group">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/25 group-active:scale-95 transition">
          <Sparkles className="w-6 h-6 fill-slate-950 stroke-slate-950" />
        </div>
        <span className="text-[10px] font-black text-emerald-400 mt-0.5 tracking-tight">
          AI ट्यूटर
        </span>
      </Link>

      {/* 4. टेस्ट */}
      {(() => {
        const item = navItems[2];
        const active = isRouteActive(item);
        const Icon = item.icon;
        return (
          <Link
            href={item.href}
            className={`flex items-center flex-col transition active:scale-90 ${
              active ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })()}

      {/* 5. प्रोफाइल */}
      {(() => {
        const item = navItems[3];
        const active = isRouteActive(item);
        const Icon = item.icon;
        return (
          <Link
            href={item.href}
            className={`flex items-center flex-col transition active:scale-90 ${
              active ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })()}
    </nav>
  );
}