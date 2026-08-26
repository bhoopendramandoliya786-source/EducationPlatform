"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Trophy, Plus, Edit2, Trash2, Eye, EyeOff, Search, CheckCircle2, HelpCircle } from "lucide-react";

export default function QuizManager() {
  const [chapters, setChapters] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [chapterId, setChapterId] = useState("");

  const [totalQuestions, setTotalQuestions] = useState(10);
  const [duration, setDuration] = useState(15);
  const [quizType, setQuizType] = useState("chapter");

  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [searchQuestion, setSearchQuestion] = useState("");

  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoadingData(true);
    await Promise.all([fetchChapters(), fetchQuestions(), fetchQuizzes()]);
    setLoadingData(false);
  }

  async function fetchChapters() {
    const { data } = await supabase
      .from("chapters")
      .select("id, name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (data) setChapters(data);
  }

  async function fetchQuestions() {
    const { data } = await supabase
      .from("questions")
      .select(`
        id,
        chapter_id,
        question,
        is_pyq,
        difficulty,
        chapters (
          name
        )
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(500);
    if (data) setQuestions(data);
  }

  async function fetchQuizzes() {
    const { data } = await supabase
      .from("quizzes")
      .select(`
        *,
        chapters (
          name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setQuizzes(data);
  }

  // Filter questions based on selected chapter and search
  const filteredQuestions = useMemo(() => {
    let result = questions;

    if (chapterId) {
      result = result.filter((q) => String(q.chapter_id) === String(chapterId));
    }

    if (searchQuestion.trim()) {
      const qText = searchQuestion.toLowerCase();
      result = result.filter((q) => q.question?.toLowerCase().includes(qText));
    }

    return result;
  }, [questions, chapterId, searchQuestion]);

  function toggleQuestion(id) {
    setSelectedQuestions((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= Number(totalQuestions)) {
        alert(`आप अधिकतम ${Number(totalQuestions)} questions select कर सकते हैं।`);
        return prev;
      }
      return [...prev, id];
    });
  }

  function selectAllVisibleQuestions() {
    const limit = Number(totalQuestions);
    const ids = filteredQuestions.slice(0, limit).map((q) => q.id);
    setSelectedQuestions(ids);
  }

  function clearSelectedQuestions() {
    setSelectedQuestions([]);
  }

  async function saveQuiz(e) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Quiz title जरूरी है");
      return;
    }

    const questionLimit = Number(totalQuestions);
    if (!questionLimit || questionLimit < 1) {
      alert("Total questions कम से कम 1 होना चाहिए");
      return;
    }

    if (selectedQuestions.length !== questionLimit) {
      alert(`कृपया ठीक ${questionLimit} questions select करें। अभी ${selectedQuestions.length} selected हैं।`);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        chapter_id: chapterId || null,
        total_questions: questionLimit,
        duration_minutes: duration && Number(duration) > 0 ? Number(duration) : null,
        quiz_type: quizType,
        is_published: true,
      };

      let quizId = editId;

      if (editId) {
        const { error } = await supabase.from("quizzes").update(payload).eq("id", editId);
        if (error) throw error;

        await supabase.from("quiz_questions").delete().eq("quiz_id", editId);
      } else {
        const { data, error } = await supabase
          .from("quizzes")
          .insert([payload])
          .select("id")
          .single();
        if (error) throw error;
        quizId = data.id;
      }

      const quizQuestions = selectedQuestions.map((qId, index) => ({
        quiz_id: quizId,
        question_id: qId,
        question_order: index + 1,
      }));

      const { error: questionError } = await supabase.from("quiz_questions").insert(quizQuestions);
      if (questionError) throw questionError;

      resetForm();
      await fetchQuizzes();
    } catch (error) {
      console.error("Quiz save error:", error);
      alert("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function editQuiz(quiz) {
    setEditId(quiz.id);
    setTitle(quiz.title || "");
    setDescription(quiz.description || "");
    setChapterId(quiz.chapter_id || "");
    setTotalQuestions(quiz.total_questions || 10);
    setDuration(quiz.duration_minutes || 15);
    setQuizType(quiz.quiz_type || "chapter");

    const { data } = await supabase
      .from("quiz_questions")
      .select("question_id")
      .eq("quiz_id", quiz.id)
      .order("question_order", { ascending: true });

    if (data) {
      setSelectedQuestions(data.map((item) => item.question_id));
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteQuiz(id) {
    if (!confirm("क्या आप वाकई इस Quiz को delete करना चाहते हैं?")) return;

    setLoading(true);
    try {
      await supabase.from("quiz_questions").delete().eq("quiz_id", id);
      await supabase.from("quizzes").delete().eq("id", id);
      await fetchQuizzes();
      if (editId === id) resetForm();
    } catch (error) {
      alert("❌ Delete error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish(quiz) {
    const { error } = await supabase
      .from("quizzes")
      .update({ is_published: !quiz.is_published })
      .eq("id", quiz.id);

    if (error) {
      alert("❌ " + error.message);
      return;
    }
    await fetchQuizzes();
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setChapterId("");
    setTotalQuestions(10);
    setDuration(15);
    setQuizType("chapter");
    setSelectedQuestions([]);
    setEditId(null);
  }

  if (loadingData) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs animate-pulse">
        🏆 Quiz Manager लोड हो रहा है...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-200">

      {/* 🏷️ Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-400" /> Quiz & Speed Test Manager
          </h2>
          <p className="text-xs text-slate-400">सीधे Chapter आधारित टेस्ट एवं मॉक टेस्ट बनाएँ</p>
        </div>
        <span className="text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1 rounded-lg self-start sm:self-auto">
          कुल Quizzes: {quizzes.length}
        </span>
      </div>

      {/* 📝 Quiz Form */}
      <form onSubmit={saveQuiz} className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
          {editId ? <Edit2 className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-3.5 h-3.5 text-emerald-400" />}
          {editId ? "Quiz एडिट करें" : "नया Quiz बनाएँ"}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Quiz का शीर्षक *</label>
            <input
              type="text"
              placeholder="जैसे: वन्यजीव अभयारण्य - स्पीड टेस्ट"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Chapter से लिंक करें (Optional)</label>
            <select
              value={chapterId}
              onChange={(e) => {
                setChapterId(e.target.value);
                setSelectedQuestions([]);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">-- All Chapters / Mega Mock --</option>
              {chapters.map((chap) => (
                <option key={chap.id} value={chap.id}>
                  {chap.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">विवरण (Description)</label>
          <input
            type="text"
            placeholder="जैसे: 20 प्रश्न • 10 मिनट समय सीमा"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">कुल प्रश्न संख्या *</label>
            <input
              type="number"
              min="1"
              value={totalQuestions}
              onChange={(e) => {
                setTotalQuestions(e.target.value);
                setSelectedQuestions([]);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">समय (Minutes) *</label>
            <input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Quiz Type</label>
            <select
              value={quizType}
              onChange={(e) => setQuizType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="chapter">Chapter Speed Test</option>
              <option value="practice">Practice Quiz</option>
              <option value="mock">Full Mock Test</option>
              <option value="daily">Daily Quiz</option>
            </select>
          </div>
        </div>

        {/* Question Selector Box */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-purple-400" /> प्रश्न चुनें
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                selectedQuestions.length === Number(totalQuestions)
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/20"
              }`}
            >
              चयनित: {selectedQuestions.length} / {totalQuestions}
            </span>
          </div>

          {/* Search Question & Bulk Select */}
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
            <div className="w-full sm:w-2/3 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
              <input
                type="text"
                placeholder="प्रश्नों में खोजें..."
                value={searchQuestion}
                onChange={(e) => setSearchQuestion(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex gap-1.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={selectAllVisibleQuestions}
                className="px-2.5 py-1 bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold hover:bg-indigo-600/40"
              >
                Auto-Select {totalQuestions}
              </button>
              <button
                type="button"
                onClick={clearSelectedQuestions}
                className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-700"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Scrollable Questions Checkboxes */}
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
            {filteredQuestions.length === 0 ? (
              <p className="text-center text-slate-500 text-xs py-4">कोई प्रश्न उपलब्ध नहीं है।</p>
            ) : (
              filteredQuestions.map((q, index) => {
                const isChecked = selectedQuestions.includes(q.id);
                return (
                  <label
                    key={q.id}
                    className={`p-2 rounded-xl border text-xs flex items-start gap-2 cursor-pointer transition ${
                      isChecked
                        ? "bg-purple-950/40 border-purple-500/40 text-purple-200"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleQuestion(q.id)}
                      className="mt-0.5 rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-0"
                    />
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="text-slate-200 font-medium">
                        <span className="font-bold text-purple-400 mr-1">Q{index + 1}.</span>
                        {q.question}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {q.chapters?.name || "General"} • {q.is_pyq ? "PYQ" : "MCQ"} • {q.difficulty}
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              editId
                ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                : "bg-purple-600 text-white hover:bg-purple-500"
            }`}
          >
            {loading ? "सेव हो रहा है..." : editId ? "अपडेट करें" : "Quiz बनाएँ"}
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

      {/* 📋 Created Quizzes List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300">मौजूदा Quizzes ({quizzes.length})</h3>

        {quizzes.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-500">
            अभी कोई Quiz नहीं बनाया गया है।
          </div>
        ) : (
          <div className="space-y-2">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-white">{quiz.title}</h4>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.2 rounded-full border ${
                        quiz.is_published
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                      }`}
                    >
                      {quiz.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {quiz.chapters?.name ? `📚 ${quiz.chapters.name} • ` : ""}
                    {quiz.total_questions} प्रश्न • {quiz.duration_minutes || 15} मिनट
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => editQuiz(quiz)}
                    className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => togglePublish(quiz)}
                    className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition"
                    title={quiz.is_published ? "Unpublish" : "Publish"}
                  >
                    {quiz.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => deleteQuiz(quiz.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}