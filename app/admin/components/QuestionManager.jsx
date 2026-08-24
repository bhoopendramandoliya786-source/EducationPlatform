"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function QuestionManager() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);

  // Form States
  const [topicId, setTopicId] = useState("");
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

  // Smart Filters
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterChapter, setFilterChapter] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPyq, setFilterPyq] = useState("all");

  // Pagination (15 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoadingData(true);
    await Promise.all([
      fetchHierarchy(),
      fetchQuestions(),
    ]);
    setLoadingData(false);
  }

  async function fetchHierarchy() {
    try {
      const [sRes, cRes, tRes] = await Promise.all([
        supabase.from("subjects").select("id, name").order("name", { ascending: true }),
        supabase.from("chapters").select("id, name, subject_id").order("name", { ascending: true }),
        supabase.from("topics").select("id, name, chapter_id").eq("is_active", true).order("name", { ascending: true }),
      ]);

      if (sRes.data) setSubjects(sRes.data);
      if (cRes.data) setChapters(cRes.data);
      if (tRes.data) setTopics(tRes.data);
    } catch (err) {
      console.error("Hierarchy load error:", err);
    }
  }

  async function fetchQuestions() {
    const { data, error } = await supabase
      .from("questions")
      .select(`
        id,
        topic_id,
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
        topics (
          id,
          name,
          chapter_id,
          chapters (
            id,
            name,
            subject_id,
            subjects (
              id,
              name
            )
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

  async function saveQuestion(e) {
    e.preventDefault();

    if (!topicId) {
      alert("Topic select करें");
      return;
    }

    if (!question.trim()) {
      alert("Question लिखें");
      return;
    }

    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      alert("चारों options भरना जरूरी है");
      return;
    }

    setLoading(true);

    const payload = {
      topic_id: Number(topicId),
      question: question.trim(),
      option_a: optionA.trim(),
      option_b: optionB.trim(),
      option_c: optionC.trim(),
      option_d: optionD.trim(),
      answer,
      explanation: explanation.trim() || null,
      type,
      difficulty,
      year: year ? Number(year) : null,
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
    setTopicId(String(q.topic_id || ""));
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
    setTopicId("");
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
    const ok = confirm("⚠️ Question delete करना है?\n\nयह action वापस नहीं होगा।");
    if (!ok) return;

    const { error } = await supabase.from("questions").delete().eq("id", id);

    if (error) {
      alert("❌ Delete नहीं हुआ:\n\n" + error.message + "\n\nअगर यह question किसी quiz में लगा है तो पहले उसे quiz से हटाएँ।");
      return;
    }

    await fetchQuestions();
  }

  // Filter Chapters based on Subject
  const filteredChaptersDropdown = useMemo(() => {
    if (!filterSubject) return chapters;
    return chapters.filter((c) => String(c.subject_id) === String(filterSubject));
  }, [chapters, filterSubject]);

  // Filter Topics based on Chapter
  const filteredTopicsDropdown = useMemo(() => {
    if (!filterChapter) {
      if (!filterSubject) return topics;
      const chIds = filteredChaptersDropdown.map((c) => c.id);
      return topics.filter((t) => chIds.includes(t.chapter_id));
    }
    return topics.filter((t) => String(t.chapter_id) === String(filterChapter));
  }, [topics, filterChapter, filterSubject, filteredChaptersDropdown]);

  // Main Filter Logic
  const filteredQuestions = useMemo(() => {
    const text = search.trim().toLowerCase();

    return questions.filter((q) => {
      const qTopic = q.topics;
      const qChapter = qTopic?.chapters;
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
      const matchesChapter = !filterChapter || String(qChapter?.id) === String(filterChapter);
      const matchesTopic = !filterTopic || String(q.topic_id) === String(filterTopic);

      const matchesType = filterType === "all" || q.type === filterType;
      const matchesPyq =
        filterPyq === "all" ||
        (filterPyq === "pyq" && q.is_pyq) ||
        (filterPyq === "mcq" && !q.is_pyq);

      return (
        matchesSearch &&
        matchesSubject &&
        matchesChapter &&
        matchesTopic &&
        matchesType &&
        matchesPyq
      );
    });
  }, [questions, search, filterSubject, filterChapter, filterTopic, filterType, filterPyq]);

  // Pagination Calculations
  const totalPages = Math.ceil(filteredQuestions.length / pageSize) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage]);

  if (loadingData) {
    return (
      <div style={{ background: "#111827", color: "white", padding: "20px", borderRadius: "16px", marginTop: "20px" }}>
        ❓ Questions loading...
      </div>
    );
  }

  return (
    <div style={{ background: "#111827", color: "white", padding: "20px", borderRadius: "16px", marginTop: "20px" }}>
      <h2>❓ Question Manager</h2>
      <p style={{ color: "#94a3b8", fontSize: "13px" }}>
        MCQ, PYQ, difficulty, explanation और question management.
      </p>

      {/* FORM */}
      <form onSubmit={saveQuestion}>
        {/* TOPIC SELECT */}
        <select
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          style={{ width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155" }}
        >
          <option value="">Select Topic</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.name}
            </option>
          ))}
        </select>

        {/* QUESTION */}
        <textarea
          rows={4}
          placeholder="Question लिखें..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155" }}
        />

        {/* OPTIONS */}
        <input
          placeholder="Option A"
          value={optionA}
          onChange={(e) => setOptionA(e.target.value)}
          style={{ width: "100%", padding: "12px", marginBottom: "8px", borderRadius: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155" }}
        />
        <input
          placeholder="Option B"
          value={optionB}
          onChange={(e) => setOptionB(e.target.value)}
          style={{ width: "100%", padding: "12px", marginBottom: "8px", borderRadius: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155" }}
        />
        <input
          placeholder="Option C"
          value={optionC}
          onChange={(e) => setOptionC(e.target.value)}
          style={{ width: "100%", padding: "12px", marginBottom: "8px", borderRadius: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155" }}
        />
        <input
          placeholder="Option D"
          value={optionD}
          onChange={(e) => setOptionD(e.target.value)}
          style={{ width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155" }}
        />

        {/* ANSWER */}
        <label style={{ display: "block", marginBottom: "5px" }}>Correct Answer</label>
        <select
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          style={{ width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155" }}
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>

        {/* TYPE */}
        <label style={{ display: "block", marginBottom: "5px" }}>Question Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155" }}
        >
          <option value="mcq">MCQ</option>
          <option value="true_false">True / False</option>
          <option value="multiple">Multiple</option>
        </select>

        {/* DIFFICULTY */}
        <label style={{ display: "block", marginBottom: "5px" }}>Difficulty</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          style={{ width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155" }}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        {/* YEAR & SOURCE */}
        <input
          type="number"
          placeholder="Year (जैसे 2025)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          style={{ width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155" }}
        />
        <input
          placeholder="Source (जैसे REET, RAS, LDC...)"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          style={{ width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155" }}
        />

        {/* EXPLANATION */}
        <textarea
          rows={4}
          placeholder="Answer explanation..."
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          style={{ width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155" }}
        />

        {/* PYQ & ACTIVE */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "15px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={isPyq} onChange={(e) => setIsPyq(e.target.checked)} />
            🏆 यह PYQ है
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active Question
          </label>
        </div>

        {/* SAVE BUTTONS */}
        <button
          type="submit"
          disabled={loading}
          style={{
            background: editId ? "#f59e0b" : "#10b981",
            color: editId ? "#000" : "#fff",
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            marginRight: "8px",
            cursor: "pointer",
          }}
        >
          {loading ? "Saving..." : editId ? "Update Question" : "Save Question"}
        </button>

        {editId && (
          <button
            type="button"
            onClick={resetForm}
            style={{ background: "#475569", color: "white", padding: "12px 20px", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* SMART FILTERS SECTION */}
      <div style={{ marginTop: "30px", padding: "18px", background: "#0f172a", borderRadius: "14px", border: "1px solid #1e293b" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 style={{ margin: 0 }}>🔎 स्मार्ट सर्च एवं फ़िल्टर</h3>
          <button
            onClick={() => {
              setSearch("");
              setFilterSubject("");
              setFilterChapter("");
              setFilterTopic("");
              setFilterType("all");
              setFilterPyq("all");
              setCurrentPage(1);
            }}
            style={{ background: "#334155", color: "#94a3b8", border: "none", padding: "5px 10px", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}
          >
            फ़िल्टर रीसेट करें
          </button>
        </div>

        {/* Search Input */}
        <input
          placeholder="प्रश्न या विकल्प का कोई भी शब्द search करें..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          style={{ width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155" }}
        />

        {/* Cascading Hierarchy Filters Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginBottom: "10px" }}>
          {/* 1. Subject Filter */}
          <select
            value={filterSubject}
            onChange={(e) => {
              setFilterSubject(e.target.value);
              setFilterChapter("");
              setFilterTopic("");
              setCurrentPage(1);
            }}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155" }}
          >
            <option value="">1. सभी विषय (Subjects)</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* 2. Chapter Filter */}
          <select
            value={filterChapter}
            onChange={(e) => {
              setFilterChapter(e.target.value);
              setFilterTopic("");
              setCurrentPage(1);
            }}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155" }}
          >
            <option value="">2. सभी अध्याय (Chapters)</option>
            {filteredChaptersDropdown.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* 3. Topic Filter */}
          <select
            value={filterTopic}
            onChange={(e) => {
              setFilterTopic(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155" }}
          >
            <option value="">3. सभी Topics</option>
            {filteredTopicsDropdown.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type & PYQ Selectors */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155" }}
          >
            <option value="all">सभी Types</option>
            <option value="mcq">MCQ</option>
            <option value="true_false">True / False</option>
            <option value="multiple">Multiple</option>
          </select>

          <select
            value={filterPyq}
            onChange={(e) => {
              setFilterPyq(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155" }}
          >
            <option value="all">MCQ + PYQ दोनों</option>
            <option value="mcq">केवल अभ्यास MCQ</option>
            <option value="pyq">केवल विगत वर्ष PYQ</option>
          </select>
        </div>
      </div>

      {/* QUESTIONS LIST WITH PAGINATION */}
      <div style={{ marginTop: "25px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
          <h3 style={{ margin: 0 }}>
            📚 Questions ({filteredQuestions.length})
            <span style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "10px" }}>
              (पेज {currentPage} / {totalPages})
            </span>
          </h3>

          {/* Quick Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                style={{ background: "#334155", color: "#fff", padding: "6px 12px", border: "none", borderRadius: "6px", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                ◀ पिछला
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                style={{ background: "#334155", color: "#fff", padding: "6px 12px", border: "none", borderRadius: "6px", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                अगला ▶
              </button>
            </div>
          )}
        </div>

        {paginatedQuestions.length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: "30px 0" }}>
            कोई question नहीं मिला।
          </p>
        ) : (
          paginatedQuestions.map((q, index) => (
            <div
              key={q.id}
              style={{
                background: "#1e293b",
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "12px",
                border: q.is_active ? "1px solid #334155" : "1px solid #7f1d1d",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "250px" }}>
                  <b style={{ fontSize: "14px", lineHeight: "1.5" }}>
                    Q{(currentPage - 1) * pageSize + index + 1}. {q.question}
                  </b>

                  <p style={{ color: "#60a5fa", fontSize: "12px", marginTop: "4px", marginBottom: "8px" }}>
                    📌 {q.topics?.chapters?.subjects?.name ? `${q.topics.chapters.subjects.name} ➔ ` : ""}
                    {q.topics?.chapters?.name ? `${q.topics.chapters.name} ➔ ` : ""}
                    {q.topics?.name || "Unknown Topic"}
                  </p>

                  <div style={{ fontSize: "13px", color: "#cbd5e1", margin: "6px 0", lineHeight: "1.4" }}>
                    <div>A. {q.option_a}</div>
                    <div>B. {q.option_b}</div>
                    <div>C. {q.option_c}</div>
                    <div>D. {q.option_d}</div>
                  </div>

                  <p style={{ color: "#10b981", fontWeight: "bold", fontSize: "13px", margin: "6px 0" }}>
                    ✅ Answer: {q.answer}
                  </p>

                  {q.explanation && (
                    <p style={{ color: "#94a3b8", fontSize: "12px", margin: "4px 0", background: "#0f172a", padding: "8px", borderRadius: "6px" }}>
                      💡 व्याख्या: {q.explanation}
                    </p>
                  )}

                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                    <span style={{ background: "#334155", padding: "3px 8px", borderRadius: "5px", fontSize: "11px" }}>
                      {q.difficulty}
                    </span>

                    <span style={{ background: q.is_pyq ? "#7c3aed" : "#475569", padding: "3px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "bold" }}>
                      {q.is_pyq ? (q.source ? `PYQ: ${q.source}` : "PYQ") : "अभ्यास MCQ"}
                    </span>

                    {q.year && (
                      <span style={{ background: "#334155", padding: "3px 8px", borderRadius: "5px", fontSize: "11px" }}>
                        {q.year}
                      </span>
                    )}

                    <span style={{ color: q.is_active ? "#10b981" : "#ef4444", fontSize: "11px", padding: "3px 0" }}>
                      {q.is_active ? "● Active" : "● Inactive"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                  <button
                    onClick={() => editQuestion(q)}
                    style={{ background: "#f59e0b", color: "#000", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => toggleActive(q)}
                    style={{ background: q.is_active ? "#3b82f6" : "#10b981", color: "white", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                  >
                    {q.is_active ? "Hide" : "Activate"}
                  </button>

                  <button
                    onClick={() => deleteQuestion(q.id)}
                    style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Bottom Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "20px" }}>
            <button
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((p) => p - 1);
                window.scrollTo({ top: 400, behavior: "smooth" });
              }}
              style={{ background: "#334155", color: "#fff", padding: "8px 16px", border: "none", borderRadius: "8px", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
            >
              ◀ पिछला पेज
            </button>
            <span style={{ fontSize: "13px", color: "#94a3b8" }}>
              पेज {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage((p) => p + 1);
                window.scrollTo({ top: 400, behavior: "smooth" });
              }}
              style={{ background: "#334155", color: "#fff", padding: "8px 16px", border: "none", borderRadius: "8px", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
            >
              अगला पेज ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
}