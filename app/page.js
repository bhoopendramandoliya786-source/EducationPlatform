"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import { 
  BookOpen, Trophy, Layers, 
  ChevronRight, ChevronDown, ArrowRight, Zap, FolderTree 
} from "lucide-react";

export default function HomePage() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [banners, setBanners] = useState([]);
  const [counts, setCounts] = useState({ notes: 0, tests: 0 });
  const [isOpenSubjects, setIsOpenSubjects] = useState(true);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      try {
        const [examsRes, subsRes, bannersRes, notesRes, quizRes] = await Promise.all([
          supabase.from("exams").select("*").eq("is_active", true).order("id"),
          supabase.from("subjects").select("*").eq("is_active", true).order("id", { ascending: true }),
          supabase.from("banners").select("*").order("created_at", { ascending: false }),
          supabase.from("notes").select("*", { count: "exact", head: true }),
          supabase.from("quizzes").select("*", { count: "exact", head: true })
        ]);

        if (examsRes.data && examsRes.data.length > 0) {
          setExams(examsRes.data);
          setSelectedExam(examsRes.data[0]);
        }

        if (subsRes.data) {
          setSubjects(subsRes.data);
        }

        if (bannersRes.data) {
          setBanners(bannersRes.data);
        }

        setCounts({
          notes: notesRes.count || 0,
          tests: quizRes.count || 0
        });
      } catch (err) {
        console.error("Home Load Error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
  }, []);

  return (
    <div className="max-w-md mx-auto px-4 space-y-5 pb-24 pt-2">
      {/* Top Exam Selector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
          <span>लक्ष्य परीक्षा चुनें (Select Exam)</span>
          <span className="text-indigo-400 font-extrabold">RPSC / RSMSSB</span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {exams.map((ex) => (
            <button
              key={ex.id}
              onClick={() => setSelectedExam(ex)}
              className={"px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition " + (selectedExam?.id === ex.id ? "bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20" : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white")}
            >
              {ex.name}
            </button>
          ))}
        </div>
      </div>

      {/* Target Exam Hero */}
      {selectedExam && (
        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/60 border border-indigo-500/20 space-y-1.5 shadow-xl">
          <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">{selectedExam.category || "EXAM PORTAL"}</span>
          <h1 className="text-lg font-black text-white">{selectedExam.name}</h1>
          <p className="text-xs text-slate-300">{selectedExam.description || "संपूर्ण पाठ्यक्रम, स्मार्ट थ्योरी एवं टॉपिकवाइज़ टेस्ट"}</p>
          <div className="pt-2 text-[11px] font-semibold text-emerald-400">
            उपलब्ध विषय: {subjects.length}
          </div>
        </div>
      )}

      {/* 4 Standard Action Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <Link
          href="/notes"
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 space-y-1 transition active:scale-[0.98]"
        >
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h3 className="text-xs font-bold text-white">स्मार्ट नोट्स</h3>
          <p className="text-[10px] text-slate-400">{counts.notes}+ टू-द-पॉइंट नोट्स</p>
        </Link>

        <Link
          href="/quiz"
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 space-y-1 transition active:scale-[0.98]"
        >
          <Trophy className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xs font-bold text-white">स्पीड टेस्ट</h3>
          <p className="text-[10px] text-slate-400">{counts.tests}+ लाइव मॉक टेस्ट</p>
        </Link>

        <Link
          href="/flashcards"
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 space-y-1 transition active:scale-[0.98]"
        >
          <Layers className="w-5 h-5 text-amber-400" />
          <h3 className="text-xs font-bold text-white">फ्लैशकार्ड्स</h3>
          <p className="text-[10px] text-slate-400">अनलिमिटेड 1-टैप कार्ड्स</p>
        </Link>

        <Link
          href="/student"
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 space-y-1 transition active:scale-[0.98]"
        >
          <Zap className="w-5 h-5 text-purple-400" />
          <h3 className="text-xs font-bold text-white">AI ट्यूटर</h3>
          <p className="text-[10px] text-slate-400">24/7 लाइव डाउट सॉल्व</p>
        </Link>
      </div>

      {/* Dynamic Live Banners */}
      <div className="space-y-2">
        {banners.length > 0 ? (
          banners.map((b) => (
            <div
              key={b.id}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-purple-950/80 border border-indigo-500/30 flex items-center justify-between gap-2 shadow-md"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 whitespace-nowrap">
                  {b.badge_text || "अपडेट"}
                </span>
                <p className="text-xs text-slate-200 font-semibold leading-tight">{b.title}</p>
              </div>
              {b.link && (
                <Link href={b.link} className="text-indigo-400 hover:text-indigo-300 flex-shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          ))
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 text-center text-xs text-slate-300 flex items-center justify-center gap-2">
            <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">अपडेट</span>
            <span>🎯 सभी विषयों के नए मॉक टेस्ट एवं नोट्स लाइव उपलब्ध हैं!</span>
          </div>
        )}
      </div>

      {/* Interactive Dropdown / Accordion for Subjects */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl transition">
        <button
          onClick={() => setIsOpenSubjects(!isOpenSubjects)}
          className="w-full p-4 flex items-center justify-between bg-slate-900/90 hover:bg-slate-800/80 transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FolderTree className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-xs font-bold text-white">पाठ्यक्रम विषय (Syllabus Subjects)</h3>
              <p className="text-[10px] text-slate-400">{subjects.length} विषय उपलब्ध • टैप करके खोलें/बंद करें</p>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
            {isOpenSubjects ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </button>

        {isOpenSubjects && (
          <div className="p-3 pt-0 grid gap-2 divide-y divide-slate-800/40">
            {subjects.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                विषय लोड हो रहे हैं...
              </div>
            ) : (
              subjects.map((sub) => (
                <Link
                  key={sub.id}
                  href={"/subject/" + sub.id}
                  className="p-3 rounded-2xl bg-slate-950/60 hover:bg-indigo-950/30 border border-slate-800/60 hover:border-indigo-500/30 flex items-center justify-between group transition active:scale-[0.99] mt-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xs">
                      {sub.icon || sub.name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition">{sub.name}</h4>
                      <p className="text-[10px] text-slate-400">अध्याय ➔ टॉपिक ➔ नोट्स, MCQs व PYQs</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
