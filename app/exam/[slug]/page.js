"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { ArrowLeft, ChevronRight, Download, BookOpen, Layers } from "lucide-react";

export default function ExamSyllabusPage() {
  const { slug } = useParams();
  const [exam, setExam] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadExamData() {
      setLoading(true);
      try {
        const { data: ex } = await supabase.from("exams").select("*").eq("slug", slug).single();
        setExam(ex);

        if (ex) {
          const { data: maps } = await supabase
            .from("exam_subjects")
            .select("subjects(*)")
            .eq("exam_id", ex.id)
            .order("sort_order", { ascending: true });

          if (maps) setSubjects(maps.map((m) => m.subjects).filter(Boolean));
        }
      } catch (err) {
        console.error("Exam Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadExamData();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-4 animate-pulse">
        <div className="h-32 bg-slate-900 rounded-3xl border border-slate-800" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-8 text-center space-y-3">
        <p className="text-xs text-rose-400">परीक्षा का सिलेबस नहीं मिला।</p>
        <Link href="/" className="inline-block text-xs font-bold px-4 py-2 rounded-xl bg-slate-900 text-white border border-slate-800">
          होम पर वापस जाएँ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-4">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
        <ArrowLeft className="w-3.5 h-3.5" /> वापस होम
      </Link>

      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/20 space-y-2.5 shadow-xl">
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {exam.category || "State Exam"}
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-white">{exam.name}</h1>
        <p className="text-xs text-slate-300 leading-relaxed">{exam.description || "विस्तृत आधिकारिक पाठ्यक्रम"}</p>
        
        {exam.syllabus_pdf_url && (
          <a
            href={exam.syllabus_pdf_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:underline pt-2"
          >
            <Download className="w-3.5 h-3.5" /> आधिकारिक सिलेबस PDF डाउनलोड करें
          </a>
        )}
      </div>

      <div className="space-y-3 pt-1">
        <h3 className="text-xs font-bold text-slate-300">पाठ्यक्रम में शामिल विषय ({subjects.length})</h3>
        <div className="grid gap-2.5">
          {subjects.map((sub) => (
            <Link
              key={sub.id}
              href={`/subject/${sub.id}`}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 flex items-center justify-between group transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                  {sub.name.substring(0, 1)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-400">{sub.name}</h4>
                  <p className="text-[10px] text-slate-400">चैप्टर व टॉपिक अध्ययन करें</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
