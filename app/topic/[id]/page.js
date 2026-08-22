"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { 
  ArrowLeft, BookOpen, CheckCircle2, XCircle, HelpCircle, 
  Trophy, Sparkles, Clock, Flame, Calendar, Award
} from "lucide-react";

export default function TopicWorkspacePage() {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [notes, setNotes] = useState([]);
  const [mcqList, setMcqList] = useState([]);
  const [pyqList, setPyqList] = useState([]);
  const [quizInfo, setQuizInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("notes"); // notes | mcq | pyq | quiz
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadTopicData() {
      if (!id) return;
      setLoading(true);
      try {
        const { data: topData } = await supabase
          .from("topics")
          .select("*, chapters(id, name, subjects(id, name))")
          .eq("id", id)
          .single();
        setTopic(topData);

        const { data: nData } = await supabase
          .from("notes")
          .select("*")
          .eq("topic_id", id)
          .eq("is_published", true);
        if (nData) setNotes(nData);

        const { data: qData } = await supabase
          .from("questions")
          .select("*")
          .eq("topic_id", id)
          .eq("is_active", true);

        if (qData) {
          setMcqList(qData.filter((q) => !q.is_pyq));
          setPyqList(qData.filter((q) => q.is_pyq));
        }

        const { data: qzData } = await supabase
          .from("quizzes")
          .select("*")
          .eq("topic_id", id)
          .eq("is_published", true)
          .maybeSingle();
        if (qzData) setQuizInfo(qzData);
      } catch (err) {
        console.error("Topic Data Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTopicData();
  }, [id]);

  const handleSelectOption = (questionId, optKey) => {
    if (selectedAnswers[questionId]) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optKey }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-4 animate-pulse">
        <div className="h-6 w-36 bg-slate-900 rounded-lg" />
        <div className="h-28 bg-slate-900 rounded-3xl border border-slate-800" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 h-24 bg-slate-900 rounded-2xl" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-10 text-center space-y-4">
        <p className="text-sm font-semibold text-rose-400">टॉपिक नहीं मिला या उपलब्ध नहीं है।</p>
        <Link href="/" className="inline-block text-xs font-bold px-5 py-2.5 rounded-xl bg-slate-900 text-white border border-slate-800">
          होम पर वापस जाएँ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-5 pb-16">
      {/* Top Breadcrumb */}
      <Link
        href={topic.chapters?.id ? `/chapter/${topic.chapters.id}` : "/"}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-400 hover:text-indigo-300 transition"
      >
        <ArrowLeft className="w-4 h-4" /> वापस अध्याय ({topic.chapters?.name || "अध्याय"})
      </Link>

      {/* Topic Header Hero */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/50 border border-indigo-500/30 space-y-2.5 shadow-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            {topic.chapters?.subjects?.name || "विषय"}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            • {topic.chapters?.name}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">{topic.name}</h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium">
          {topic.description || "सम्पूर्ण थ्योरी नोट्स, बहुविकल्पीय प्रश्न, विगत वर्ष हल प्रश्न एवं स्पीड टेस्ट"}
        </p>
      </div>

      {/* Big 4 Action Cards / Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Smart Notes */}
        <button
          onClick={() => setActiveTab("notes")}
          className={`p-4 sm:p-5 rounded-2xl border text-center space-y-2 transition duration-200 active:scale-95 ${
            activeTab === "notes"
              ? "bg-indigo-600/30 border-indigo-400 text-white font-black shadow-xl shadow-indigo-500/25 ring-2 ring-indigo-500/40"
              : "bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
          }`}
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-sm font-black">1. स्मार्ट नोट्स</div>
          <div className="text-xs font-bold text-indigo-300">{notes.length} नोट्स उपलब्ध</div>
        </button>

        {/* 2. Practice MCQs */}
        <button
          onClick={() => setActiveTab("mcq")}
          className={`p-4 sm:p-5 rounded-2xl border text-center space-y-2 transition duration-200 active:scale-95 ${
            activeTab === "mcq"
              ? "bg-emerald-600/30 border-emerald-400 text-white font-black shadow-xl shadow-emerald-500/25 ring-2 ring-emerald-500/40"
              : "bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
          }`}
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-sm font-black">2. अभ्यास MCQs</div>
          <div className="text-xs font-bold text-emerald-300">{mcqList.length} प्रश्न उपलब्ध</div>
        </button>

        {/* 3. Official PYQs */}
        <button
          onClick={() => setActiveTab("pyq")}
          className={`p-4 sm:p-5 rounded-2xl border text-center space-y-2 transition duration-200 active:scale-95 ${
            activeTab === "pyq"
              ? "bg-amber-600/30 border-amber-400 text-white font-black shadow-xl shadow-amber-500/25 ring-2 ring-amber-500/40"
              : "bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
          }`}
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-sm font-black">3. विगत वर्ष PYQs</div>
          <div className="text-xs font-bold text-amber-300">{pyqList.length} प्रश्न उपलब्ध</div>
        </button>

        {/* 4. Speed Quiz */}
        <button
          onClick={() => setActiveTab("quiz")}
          className={`p-4 sm:p-5 rounded-2xl border text-center space-y-2 transition duration-200 active:scale-95 ${
            activeTab === "quiz"
              ? "bg-purple-600/30 border-purple-400 text-white font-black shadow-xl shadow-purple-500/25 ring-2 ring-purple-500/40"
              : "bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
          }`}
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="text-sm font-black">4. लाइव क्विज़</div>
          <div className="text-xs font-bold text-purple-300">स्पीड टेस्ट + कार्ड्स</div>
        </button>
      </div>

      {/* 1. NOTES TAB CONTENT (Large & Clear Typography) */}
      {activeTab === "notes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-indigo-300">स्मार्ट थ्योरी एवं महत्वपूर्ण तथ्य ({notes.length})</h2>
          </div>

          {notes.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
              इस टॉपिक के नोट्स तैयार किए जा रहे हैं।
            </div>
          ) : (
            notes.map((n) => (
              <div key={n.id} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800/90 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {n.note_type === "revision" ? "⚡ त्वरित रिवीजन पॉइंट" : "📖 विस्तृत थ्योरी"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{n.title}</h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed sm:leading-loose whitespace-pre-line font-normal">
                  {n.content}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. MCQs TAB CONTENT */}
      {activeTab === "mcq" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-emerald-300">अभ्यास प्रश्न सूची ({mcqList.length})</h2>
          </div>

          {mcqList.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
              इस टॉपिक में अभ्यास प्रश्न जल्द जोड़े जा रहे हैं।
            </div>
          ) : (
            mcqList.map((q, idx) => {
              const userAnswer = selectedAnswers[q.id];
              const isAttempted = Boolean(userAnswer);

              return (
                <div key={q.id} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800/90 space-y-4 shadow-lg">
                  <h3 className="text-sm sm:text-base font-bold text-white leading-normal">
                    <span className="text-emerald-400 mr-2 font-black">Q{idx + 1}.</span>
                    {q.question}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: "A", text: q.option_a },
                      { key: "B", text: q.option_b },
                      { key: "C", text: q.option_c },
                      { key: "D", text: q.option_d }
                    ].map((opt) => {
                      let btnStyle = "bg-slate-950/90 border-slate-800 text-slate-300 hover:border-emerald-500/40";
                      if (isAttempted) {
                        if (opt.key === q.answer) {
                          btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                        } else if (opt.key === userAnswer) {
                          btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300 font-bold";
                        } else {
                          btnStyle = "bg-slate-950/40 border-slate-900 text-slate-600 opacity-60";
                        }
                      }
                      return (
                        <button
                          key={opt.key}
                          disabled={isAttempted}
                          onClick={() => handleSelectOption(q.id, opt.key)}
                          className={`p-4 rounded-2xl border text-left text-xs sm:text-sm flex items-center justify-between transition active:scale-[0.99] ${btnStyle}`}
                        >
                          <span className="leading-snug"><strong>{opt.key}.</strong> {opt.text}</span>
                          {isAttempted && opt.key === q.answer && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 ml-2" />}
                          {isAttempted && opt.key === userAnswer && opt.key !== q.answer && <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  {isAttempted && q.explanation && (
                    <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs sm:text-sm text-indigo-200 space-y-1">
                      <div className="font-bold text-indigo-400 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4" /> उत्तर व्याख्या:
                      </div>
                      <p className="leading-relaxed text-slate-200">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 3. PYQs TAB CONTENT */}
      {activeTab === "pyq" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-amber-300">विगत वर्षों के हल प्रश्न ({pyqList.length})</h2>
          </div>

          {pyqList.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
              इस टॉपिक के विगत वर्ष प्रश्न (PYQs) जल्द जोड़े जा रहे हैं।
            </div>
          ) : (
            pyqList.map((q, idx) => {
              const userAnswer = selectedAnswers[q.id];
              const isAttempted = Boolean(userAnswer);

              return (
                <div key={q.id} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800/90 space-y-4 shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm sm:text-base font-bold text-white leading-normal">
                      <span className="text-amber-400 mr-2 font-black">PYQ {idx + 1}.</span>
                      {q.question}
                    </h3>
                    <span className="text-[10px] sm:text-xs font-black px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                      {q.source || "Official Exam"} {q.year ? `(${q.year})` : ""}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: "A", text: q.option_a },
                      { key: "B", text: q.option_b },
                      { key: "C", text: q.option_c },
                      { key: "D", text: q.option_d }
                    ].map((opt) => {
                      let btnStyle = "bg-slate-950/90 border-slate-800 text-slate-300 hover:border-amber-500/40";
                      if (isAttempted) {
                        if (opt.key === q.answer) {
                          btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                        } else if (opt.key === userAnswer) {
                          btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300 font-bold";
                        } else {
                          btnStyle = "bg-slate-950/40 border-slate-900 text-slate-600 opacity-60";
                        }
                      }
                      return (
                        <button
                          key={opt.key}
                          disabled={isAttempted}
                          onClick={() => handleSelectOption(q.id, opt.key)}
                          className={`p-4 rounded-2xl border text-left text-xs sm:text-sm flex items-center justify-between transition active:scale-[0.99] ${btnStyle}`}
                        >
                          <span className="leading-snug"><strong>{opt.key}.</strong> {opt.text}</span>
                          {isAttempted && opt.key === q.answer && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 ml-2" />}
                          {isAttempted && opt.key === userAnswer && opt.key !== q.answer && <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  {isAttempted && q.explanation && (
                    <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs sm:text-sm text-indigo-200 space-y-1">
                      <div className="font-bold text-indigo-400 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4" /> विस्तृत व्याख्या:
                      </div>
                      <p className="leading-relaxed text-slate-200">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 4. SPEED QUIZ TAB */}
      {activeTab === "quiz" && (
        <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-950/70 via-slate-900 to-indigo-950/50 border border-purple-500/30 space-y-5 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-purple-600/20 border border-purple-500/30 mx-auto flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/20">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="text-lg sm:text-xl font-black text-white">{topic.name}</h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              इस स्पीड टेस्ट में इस टॉपिक के सभी MCQs और PYQs शामिल हैं। टेस्ट सबमिट करने पर अंतिम स्कोरकार्ड और 3D फ्लिप रिवीजन फ्लैशकार्ड्स मिलेंगे।
            </p>
          </div>

          <div className="pt-2">
            {quizInfo ? (
              <Link
                href={`/quiz/${quizInfo.id}`}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-sm font-black text-white shadow-xl shadow-purple-500/30 active:scale-95 transition"
              >
                <span>स्पीड टेस्ट प्रारंभ करें →</span>
              </Link>
            ) : (
              <div className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl inline-block">
                इस टॉपिक का लाइव टेस्ट तैयार किया जा रहा है।
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
