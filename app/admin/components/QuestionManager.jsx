"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { HelpCircle, Plus, Edit2, Trash2, Eye, EyeOff, Search, Layers, Filter } from "lucide-react";

export default function QuestionManager() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [questions, setQuestions] = useState([]);

  // Form States
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [answer, setAnswer] = useState("A");
  const [explanation, setExplanation] = useState("");
  const [type, setType] = useState("mcq");
  const [difficulty, setDifficulty] = useState("medium");
  const [year, setYear] = useState("");
  const [source, setSource] = useState("");
  const [isPyq, setIsPyq] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false);

  // Smart Filters
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterChapter, setFilterChapter] = useState("");
  const [filterPyq, setFilterPyq] = useState("all");

  // Pagination (15 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoadingData(true);
    await Promise.all([fetchSubjects(), fetchAllChapters(), fetchQuestions()]);
    setLoadingData(false);
  }

  async function fetchSubjects() {
    const { data } = await supabase
      .from("subjects")
      .select("id, name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (data) setSubjects(data);
  }

  async function fetchAllChapters() {
    const { data } = await supabase
      .from("chapters")
      .select("id, name, subject_id")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (data) setChapters(data);
  }

  async function fetchQuestions() {
    const { data, error } = await supabase
      .from("questions")
      .select(`
        id,
        chapter_id,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        answer,
        explanation,
        type,
        year,
        difficulty,
        source,
        is_pyq,
        is_active,
        created_at,
        chapters (
          id,
          name,
          subject_id,
          subjects (
            id,
            name
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      alert("❌ Question load error: " + error.message);
      return;
    }
    setQuestions(data || []);
  }

  // Form Cascading: Load Chapters when Subject changes
  const formChapters = useMemo(() => {
    if (!subjectId) return [];
    return chapters.filter((c) => String(c.subject_id) === String(subjectId));
  }, [chapters, subjectId]);

  // Filter Cascading: Load Chapters for Filter
  const filterChaptersList = useMemo(() => {
    if (!filterSubject) return chapters;
    return chapters.filter((c) => String(c.subject_id) === String(filterSubject));
  }, [chapters, filterSubject]);

  async function saveQuestion(e) {
    e.preventDefault();

    if (!chapterId) {
      alert("कृपया Subject और Chapter चुनें");
      return;
    }

    if (!question.trim()) {
      alert("Question टेक्स्ट लिखें");
      return;
    }

    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      alert("चारों Options भरना जरूरी है");
      return;
    }

    setLoading(true);

    const payload = {
      chapter_id: chapterId,
      question: question.trim(),
      option_a: optionA.trim(),
      option_b: optionB.trim(),
      option_c: optionC.trim(),
      option_d: optionD.trim(),
      answer,
      explanation: explanation.trim() || null,
      type,
      difficulty,
      year: year ? String(year).trim() : null,
      source: source.trim() || null,
      is_pyq: isPyq,
      is_active: isActive,
    };

    let error = null;

    if (editId) {
      const result = await supabase.from("questions").update(payload).eq("id", editId);
      error = result.error;
    } else {
      const result = await supabase.from("questions").insert([payload]);
      error = result.error;
    }

    setLoading(false);

    if (error) {
      alert("❌ " + error.message);
      return;
    }

    resetForm();
    await fetchQuestions();
  }

  function editQuestion(q) {
    setEditId(q.id);
    const chap = q.chapters;
    if (chap) {
      setSubjectId(String(chap.subject_id || ""));
      setChapterId(String(chap.id || ""));
    }
    setQuestion(q.question || "");
    setOptionA(q.option_a || "");
    setOptionB(q.option_b || "");
    setOptionC(q.option_c || "");
    setOptionD(q.option_d || "");
    setAnswer(q.answer || "A");
    setExplanation(q.explanation || "");
    setType(q.type || "mcq");
    setDifficulty(q.difficulty || "medium");
    setYear(q.year || "");
    setSource(q.source || "");
    setIsPyq(Boolean(q.is_pyq));
    setIsActive(Boolean(q.is_active));

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditId(null);
    setQuestion("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setAnswer("A");
    setExplanation("");
    setType("mcq");
    setDifficulty("medium");
    setYear("");
    setSource("");
    setIsPyq(false);
    setIsActive(true);
  }

  async function toggleActive(q) {
    const { error } = await supabase
      .from("questions")
      .update({ is_active: !q.is_active })
      .eq("id", q.id);

    if (error) {
      alert("❌ " + error.message);
      return;
    }
    await fetchQuestions();
  }

  async function deleteQuestion(id) {
    const ok = confirm("⚠️ क्या आप इस प्रश्न को Delete करना चाहते हैं?");
    if (!ok) return;

    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) {
      alert("❌ Delete नहीं हुआ:\n\n" + error.message);
      return;
    }
    await fetchQuestions();
  }

  // Main Filter Logic
  const filteredQuestions = useMemo(() => {
    const text = search.trim().toLowerCase();

    return questions.filter((q) => {
      const qChapter = q.chapters;
      const qSubject = qChapter?.subjects;

      const matchesSearch =
        !text ||
        q.question?.toLowerCase().includes(text) ||
        q.option_a?.toLowerCase().includes(text) ||
        q.option_b?.toLowerCase().includes(text) ||
        q.option_c?.toLowerCase().includes(text) ||
        q.option_d?.toLowerCase().includes(text) ||
        q.source?.toLowerCase().includes(text);

      const matchesSubject = !filterSubject || String(qSubject?.id) === String(filterSubject);
      const matchesChapter = !filterChapter || String(q.chapter_id) === String(filterChapter);
      const matchesPyq =
        filterPyq === "all" ||
        (filterPyq === "pyq" && q.is_pyq) ||
        (filterPyq === "mcq" && !q.is_pyq);

      return matchesSearch && matchesSubject && matchesChapter && matchesPyq;
    });
  }, [questions, search, filterSubject, filterChapter, filterPyq]);

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / pageSize) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage]);

  if (loadingData) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs animate-pulse">
        ❓ Questions लोड हो रहे हैं...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-200">
      {/* 🏷️ Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" /> Question Manager
          </h2>
          <p className="text-xs text-slate-400">अभ्यास MCQs और विगत वर्ष PYQs सीधे Chapter में जोड़ें</p>
        </div>
        <span className="text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-lg self-start sm:self-auto">
          कुल प्रश्न: {questions.length}
        </span>
      </div>

      {/* 📝 Question Form */}
      <form onSubmit={saveQuestion} className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
          {editId ? <Edit2 className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-3.5 h-3.5 text-emerald-400" />}
          {editId ? "प्रश्न एडिट करें" : "नया प्रश्न जोड़ें"}
        </div>

        {/* Cascading Subject ➔ Chapter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">1. Subject चुनें *</label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setChapterId("");
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Subject चुनें --</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">2. Chapter चुनें *</label>
            <select
              value={chapterId}
              disabled={!subjectId}
              onChange={(e) => setChapterId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-40"
            >
              <option value="">
                {!subjectId ? "-- पहले Subject चुनें --" : "-- Chapter चुनें --"}
              </option>
              {formChapters.map((chap) => (
                <option key={chap.id} value={chap.id}>
                  {chap.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Question Text */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">प्रश्न (Question Text) *</label>
          <textarea
            rows={3}
            placeholder="प्रश्न यहाँ लिखें..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-0.5">Option A *</label>
            <input
              type="text"
              placeholder="विकल्प A"
              value={optionA}
              onChange={(e) => setOptionA(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-0.5">Option B *</label>
            <input
              type="text"
              placeholder="विकल्प B"
              value={optionB}
              onChange={(e) => setOptionB(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-0.5">Option C *</label>
            <input
              type="text"
              placeholder="विकल्प C"
              value={optionC}
              onChange={(e) => setOptionC(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-0.5">Option D *</label>
            <input
              type="text"
              placeholder="विकल्प D"
              value={optionD}
              onChange={(e) => setOptionD(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Meta Attributes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">सही उत्तर *</label>
            <select
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">कठिनाई (Difficulty)</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Source / Exam</label>
            <input
              type="text"
              placeholder="जैसे: REET, RPSC 1st Grade"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">वर्ष (Year)</label>
            <input
              type="text"
              placeholder="जैसे: 2022"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Explanation */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">विस्तृत व्याख्या (Explanation)</label>
          <input
            type="text"
            placeholder="उत्तर की व्याख्या..."
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Toggles */}
        <div className="flex gap-4 pt-1">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isPyq}
              onChange={(e) => setIsPyq(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
            />
            🏆 विगत वर्ष PYQ है
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
            />
            Active रखें
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              editId
                ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
          >
            {loading ? "सेव हो रहा है..." : editId ? "अपडेट करें" : "प्रश्न सेव करें"}
          </button>

          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
            >
              रद्द करें
            </button>
          )}
        </div>
      </form>

      {/* 🔍 Smart Search & Filters */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-400" /> फ़िल्टर एवं खोजें
          </span>
          <button
            onClick={() => {
              setSearch("");
              setFilterSubject("");
              setFilterChapter("");
              setFilterPyq("all");
              setCurrentPage(1);
            }}
            className="text-[11px] text-slate-400 hover:text-white"
          >
            फ़िल्टर रीसेट करें
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="प्रश्न या विकल्प से खोजें..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <select
            value={filterSubject}
            onChange={(e) => {
              setFilterSubject(e.target.value);
              setFilterChapter("");
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="">1. सभी Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={filterChapter}
            onChange={(e) => {
              setFilterChapter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="">2. सभी Chapters</option>
            {filterChaptersList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterPyq}
            onChange={(e) => {
              setFilterPyq(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">MCQ + PYQ दोनों</option>
            <option value="mcq">केवल अभ्यास MCQ</option>
            <option value="pyq">केवल विगत वर्ष PYQ</option>
          </select>
        </div>
      </div>

      {/* 📋 Questions List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-300">
            परिणाम ({filteredQuestions.length})
            <span className="text-slate-500 ml-1.5">
              [पेज {currentPage} / {totalPages}]
            </span>
          </h3>

          {totalPages > 1 && (
            <div className="flex gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-2.5 py-1 bg-slate-800 rounded-lg text-xs font-bold disabled:opacity-30"
              >
                ◀
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-2.5 py-1 bg-slate-800 rounded-lg text-xs font-bold disabled:opacity-30"
              >
                ▶
              </button>
            </div>
          )}
        </div>

        {paginatedQuestions.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-500">
            कोई प्रश्न नहीं मिला।
          </div>
        ) : (
          <div className="space-y-2.5">
            {paginatedQuestions.map((q, index) => (
              <div
                key={q.id}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-indigo-400">
                        Q{(currentPage - 1) * pageSize + index + 1}.
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.2 rounded border bg-indigo-500/10 text-indigo-300 border-indigo-500/20">
                        {q.chapters?.subjects?.name ? `${q.chapters.subjects.name} ➔ ` : ""}
                        {q.chapters?.name || "No Chapter"}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.2 rounded border ${
                          q.is_pyq
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        }`}
                      >
                        {q.is_pyq ? (q.source ? `PYQ: ${q.source} (${q.year || ""})` : "PYQ") : "अभ्यास MCQ"}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-white leading-relaxed pt-0.5">{q.question}</p>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-400 pt-1">
                      <div className={q.answer === "A" ? "text-emerald-400 font-bold" : ""}>A. {q.option_a}</div>
                      <div className={q.answer === "B" ? "text-emerald-400 font-bold" : ""}>B. {q.option_b}</div>
                      <div className={q.answer === "C" ? "text-emerald-400 font-bold" : ""}>C. {q.option_c}</div>
                      <div className={q.answer === "D" ? "text-emerald-400 font-bold" : ""}>D. {q.option_d}</div>
                    </div>

                    {q.explanation && (
                      <p className="text-[10px] text-slate-400 bg-slate-950/80 p-2 rounded-lg mt-1 border border-slate-800/80">
                        💡 <strong>व्याख्या:</strong> {q.explanation}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => editQuestion(q)}
                      className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleActive(q)}
                      className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition"
                      title={q.is_active ? "Hide" : "Show"}
                    >
                      {q.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 pt-2">
            <button
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((p) => p - 1);
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
              className="px-3.5 py-1.5 bg-slate-800 rounded-lg text-xs font-bold disabled:opacity-30"
            >
              ◀ पिछला
            </button>
            <span className="text-xs text-slate-400">
              पेज {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage((p) => p + 1);
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
              className="px-3.5 py-1.5 bg-slate-800 rounded-lg text-xs font-bold disabled:opacity-30"
            >
              अगला ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
}