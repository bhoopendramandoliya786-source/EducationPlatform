"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { 
  ArrowLeft, BookOpen, Trophy, Sparkles, CheckCircle2, 
  XCircle, HelpCircle, ChevronRight, Award
} from "lucide-react";

export default function TopicDetailPage() {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [notes, setNotes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [activeTab, setActiveTab] = useState("notes");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadTopicData() {
      setLoading(true);
      try {
        const { data: tData } = await supabase.from("topics").select("*, chapters(name, subject_id)").eq("id", id).single();
        setTopic(tData);

        const [{ data: nData }, { data: qData }] = await Promise.all([
          supabase.from("notes").select("*").eq("topic_id", id).eq("is_published", true).order("sort_order", { ascending: true }),
          supabase.from("questions").select("*").eq("topic_id", id).eq("is_active", true)
        ]);

        if (nData) setNotes(nData);
        if (qData) setQuestions(qData);
      } catch (err) {
        console.error("Topic Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTopicData();
  }, [id]);

  const handleOptionSelect = (questionId, optionKey) => {
    if (selectedAnswers[questionId]) return; // Once answered, freeze
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-4 space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-900 rounded-lg" />
        <div className="h-28 bg-slate-900 rounded-3xl border border-slate-800" />
        <div className="h-48 bg-slate-900 rounded-3xl border border-slate-800" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-8 text-center space-y-3">
        <p className="text-xs text-rose-400">यह टॉपिक उपलब्ध नहीं है।</p>
        <Link href="/" className="inline-block text-xs font-bold px-4 py-2 rounded-xl bg-slate-900 text-white border border-slate-800">
          होम पर वापस जाएँ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-4">
      {/* Navigation Breadcrumb */}
      <Link
        href={topic.chapters?.subject_id ? `/subject/${topic.chapters.subject_id}` : "/"}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> वापस विषय सूची पर
      </Link>

      {/* Topic Hero Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-950 border border-indigo-500/20 space-y-2 shadow-xl">
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {topic.chapters?.name || "अध्याय"}
        </span>
        <h1 className="text-xl font-black text-white">{topic.name}</h1>
        <p className="text-xs text-slate-300">{topic.description || "सम्पूर्ण थ्योरी नोट्स और अभ्यास टेस्ट"}</p>
      </div>

      {/* Study vs Test Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("notes")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "notes"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" /> स्मार्ट नोट्स ({notes.length})
        </button>

        <button
          onClick={() => setActiveTab("test")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "test"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Trophy className="w-4 h-4" /> प्रैक्टिस टेस्ट ({questions.length})
        </button>
      </div>

      {/* Tab 1: Smart Notes */}
      {activeTab === "notes" && (
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
              इस टॉपिक के नोट्स तैयार किए जा रहे हैं।
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-indigo-300">{note.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                    {note.note_type || "Study"}
                  </span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {note.content}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Interactive MCQ Test Engine */}
      {activeTab === "test" && (
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
              इस टॉपिक के प्रश्न जल्द उपलब्ध होंगे।
            </div>
          ) : (
            questions.map((q, idx) => {
              const userAnswer = selectedAnswers[q.id];
              const isAttempted = Boolean(userAnswer);
              const isCorrect = userAnswer === q.answer;

              return (
                <div key={q.id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-white leading-snug">
                      <span className="text-indigo-400 mr-1.5">Q{idx + 1}.</span>
                      {q.question}
                    </h3>
                    {q.is_pyq && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                        PYQ {q.year ? `(${q.year})` : ""}
                      </span>
                    )}
                  </div>

                  {/* 4 Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { key: "A", text: q.option_a },
                      { key: "B", text: q.option_b },
                      { key: "C", text: q.option_c },
                      { key: "D", text: q.option_d }
                    ].map((opt) => {
                      let btnStyle = "bg-slate-950/80 border-slate-800/90 text-slate-300 hover:border-indigo-500/40";
                      
                      if (isAttempted) {
                        if (opt.key === q.answer) {
                          btnStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold";
                        } else if (opt.key === userAnswer) {
                          btnStyle = "bg-rose-500/10 border-rose-500/40 text-rose-300";
                        } else {
                          btnStyle = "bg-slate-950/40 border-slate-900 text-slate-600 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={opt.key}
                          disabled={isAttempted}
                          onClick={() => handleOptionSelect(q.id, opt.key)}
                          className={`p-3 rounded-2xl border text-left text-xs flex items-center justify-between transition active:scale-[0.98] ${btnStyle}`}
                        >
                          <span><strong>{opt.key}.</strong> {opt.text}</span>
                          {isAttempted && opt.key === q.answer && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                          {isAttempted && opt.key === userAnswer && opt.key !== q.answer && <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Explanation */}
                  {isAttempted && q.explanation && (
                    <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-400 text-[11px]">
                        <HelpCircle className="w-3.5 h-3.5" /> व्याख्या (Explanation):
                      </div>
                      <p className="leading-relaxed text-[11px] text-slate-300">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
