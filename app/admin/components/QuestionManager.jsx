"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function QuestionManager() {
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);

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

  const [search, setSearch] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPyq, setFilterPyq] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoadingData(true);

    await Promise.all([
      fetchTopics(),
      fetchQuestions(),
    ]);

    setLoadingData(false);
  }

  async function fetchTopics() {
    const { data, error } = await supabase
      .from("topics")
      .select("id,name")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      alert("❌ Topic load error: " + error.message);
      return;
    }

    setTopics(data || []);
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
          name
        )
      `)
      .order("created_at", {
        ascending: false,
      });

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

    if (
      !optionA.trim() ||
      !optionB.trim() ||
      !optionC.trim() ||
      !optionD.trim()
    ) {
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
      const result = await supabase
        .from("questions")
        .update(payload)
        .eq("id", editId);

      error = result.error;
    } else {
      const result = await supabase
        .from("questions")
        .insert([payload]);

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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
      .update({
        is_active: !q.is_active,
      })
      .eq("id", q.id);

    if (error) {
      alert("❌ " + error.message);
      return;
    }

    await fetchQuestions();
  }

  async function deleteQuestion(id) {
    const ok = confirm(
      "⚠️ Question delete करना है?\n\nयह action वापस नहीं होगा।"
    );

    if (!ok) return;

    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", id);

    if (error) {
      alert(
        "❌ Delete नहीं हुआ:\n\n" +
          error.message +
          "\n\nअगर यह question किसी quiz में लगा है तो पहले उसे quiz से हटाएँ।"
      );
      return;
    }

    await fetchQuestions();
  }

  const filteredQuestions = useMemo(() => {
    const text = search.trim().toLowerCase();

    return questions.filter((q) => {
      const matchesSearch =
        !text ||
        q.question?.toLowerCase().includes(text) ||
        q.option_a?.toLowerCase().includes(text) ||
        q.option_b?.toLowerCase().includes(text) ||
        q.option_c?.toLowerCase().includes(text) ||
        q.option_d?.toLowerCase().includes(text);

      const matchesTopic =
        !filterTopic ||
        String(q.topic_id) === String(filterTopic);

      const matchesType =
        filterType === "all" ||
        q.type === filterType;

      const matchesPyq =
        filterPyq === "all" ||
        (filterPyq === "pyq" && q.is_pyq) ||
        (filterPyq === "mcq" && !q.is_pyq);

      return (
        matchesSearch &&
        matchesTopic &&
        matchesType &&
        matchesPyq
      );
    });
  }, [
    questions,
    search,
    filterTopic,
    filterType,
    filterPyq,
  ]);

  if (loadingData) {
    return (
      <div
        style={{
          background: "#111827",
          color: "white",
          padding: "20px",
          borderRadius: "16px",
          marginTop: "20px",
        }}
      >
        ❓ Questions loading...
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#111827",
        color: "white",
        padding: "20px",
        borderRadius: "16px",
        marginTop: "20px",
      }}
    >
      <h2>
        ❓ Question Manager
      </h2>

      <p
        style={{
          color: "#94a3b8",
          fontSize: "13px",
        }}
      >
        MCQ, PYQ, difficulty, explanation और question
        management.
      </p>

      {/* FORM */}

      <form onSubmit={saveQuestion}>
        {/* TOPIC */}

        <select
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <option value="">
            Select Topic
          </option>

          {topics.map((topic) => (
            <option
              key={topic.id}
              value={topic.id}
            >
              {topic.name}
            </option>
          ))}
        </select>

        {/* QUESTION */}

        <textarea
          rows={4}
          placeholder="Question लिखें..."
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        />

        {/* OPTIONS */}

        <input
          placeholder="Option A"
          value={optionA}
          onChange={(e) =>
            setOptionA(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "8px",
            borderRadius: "8px",
          }}
        />

        <input
          placeholder="Option B"
          value={optionB}
          onChange={(e) =>
            setOptionB(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "8px",
            borderRadius: "8px",
          }}
        />

        <input
          placeholder="Option C"
          value={optionC}
          onChange={(e) =>
            setOptionC(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "8px",
            borderRadius: "8px",
          }}
        />

        <input
          placeholder="Option D"
          value={optionD}
          onChange={(e) =>
            setOptionD(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        />

        {/* ANSWER */}

        <label
          style={{
            display: "block",
            marginBottom: "5px",
          }}
        >
          Correct Answer
        </label>

        <select
          value={answer}
          onChange={(e) =>
            setAnswer(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>

        {/* TYPE */}

        <label
          style={{
            display: "block",
            marginBottom: "5px",
          }}
        >
          Question Type
        </label>

        <select
          value={type}
          onChange={(e) =>
            setType(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <option value="mcq">
            MCQ
          </option>

          <option value="true_false">
            True / False
          </option>

          <option value="multiple">
            Multiple
          </option>
        </select>

        {/* DIFFICULTY */}

        <label
          style={{
            display: "block",
            marginBottom: "5px",
          }}
        >
          Difficulty
        </label>

        <select
          value={difficulty}
          onChange={(e) =>
            setDifficulty(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <option value="easy">
            Easy
          </option>

          <option value="medium">
            Medium
          </option>

          <option value="hard">
            Hard
          </option>
        </select>

        {/* YEAR */}

        <input
          type="number"
          placeholder="Year (जैसे 2025)"
          value={year}
          onChange={(e) =>
            setYear(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        />

        {/* SOURCE */}

        <input
          placeholder="Source (जैसे REET, RAS, LDC...)"
          value={source}
          onChange={(e) =>
            setSource(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        />

        {/* EXPLANATION */}

        <textarea
          rows={5}
          placeholder="Answer explanation..."
          value={explanation}
          onChange={(e) =>
            setExplanation(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        />

        {/* PYQ */}

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "10px",
          }}
        >
          <input
            type="checkbox"
            checked={isPyq}
            onChange={(e) =>
              setIsPyq(e.target.checked)
            }
          />

          🏆 यह PYQ है
        </label>

        {/* ACTIVE */}

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "15px",
          }}
        >
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) =>
              setIsActive(e.target.checked)
            }
          />

          Active Question
        </label>

        {/* SAVE */}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: editId
              ? "#f59e0b"
              : "#10b981",
            color: editId
              ? "#000"
              : "#fff",
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            marginRight: "8px",
          }}
        >
          {loading
            ? "Saving..."
            : editId
            ? "Update Question"
            : "Save Question"}
        </button>

        {editId && (
          <button
            type="button"
            onClick={resetForm}
            style={{
              background: "#475569",
              color: "white",
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* FILTERS */}

      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          background: "#0f172a",
          borderRadius: "12px",
        }}
      >
        <h3>🔎 Question Search / Filter</h3>

        <input
          placeholder="Question search करें..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "8px",
            borderRadius: "8px",
          }}
        />

        <select
          value={filterTopic}
          onChange={(e) =>
            setFilterTopic(e.target.value)
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "8px",
            borderRadius: "8px",
          }}
        >
          <option value="">
            सभी Topics
          </option>

          {topics.map((topic) => (
            <option
              key={topic.id}
              value={topic.id}
            >
              {topic.name}
            </option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) =>
            setFilterType(e.target.value)
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "8px",
            borderRadius: "8px",
          }}
        >
          <option value="all">
            सभी Types
          </option>

          <option value="mcq">
            MCQ
          </option>

          <option value="true_false">
            True / False
          </option>

          <option value="multiple">
            Multiple
          </option>
        </select>

        <select
          value={filterPyq}
          onChange={(e) =>
            setFilterPyq(e.target.value)
          }
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <option value="all">
            MCQ + PYQ
          </option>

          <option value="mcq">
            केवल MCQ
          </option>

          <option value="pyq">
            केवल PYQ
          </option>
        </select>
      </div>

      {/* LIST */}

      <div style={{ marginTop: "25px" }}>
        <h3>
          📚 Questions ({filteredQuestions.length})
        </h3>

        {filteredQuestions.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>
            कोई question नहीं मिला।
          </p>
        ) : (
          filteredQuestions.map((q, index) => (
            <div
              key={q.id}
              style={{
                background: "#1e293b",
                padding: "15px",
                borderRadius: "12px",
                marginBottom: "12px",
                border: q.is_active
                  ? "1px solid #334155"
                  : "1px solid #7f1d1d",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    minWidth: "250px",
                  }}
                >
                  <b>
                    Q{index + 1}. {q.question}
                  </b>

                  <p
                    style={{
                      color: "#60a5fa",
                      fontSize: "13px",
                    }}
                  >
                    📌 {q.topics?.name || "Unknown Topic"}
                  </p>

                  <p>A. {q.option_a}</p>
                  <p>B. {q.option_b}</p>
                  <p>C. {q.option_c}</p>
                  <p>D. {q.option_d}</p>

                  <p
                    style={{
                      color: "#10b981",
                      fontWeight: "bold",
                    }}
                  >
                    ✅ Answer: {q.answer}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        background: "#334155",
                        padding: "4px 8px",
                        borderRadius: "5px",
                        fontSize: "11px",
                      }}
                    >
                      {q.difficulty}
                    </span>

                    <span
                      style={{
                        background: q.is_pyq
                          ? "#7c3aed"
                          : "#475569",
                        padding: "4px 8px",
                        borderRadius: "5px",
                        fontSize: "11px",
                      }}
                    >
                      {q.is_pyq ? "PYQ" : "MCQ"}
                    </span>

                    {q.year && (
                      <span
                        style={{
                          background: "#334155",
                          padding: "4px 8px",
                          borderRadius: "5px",
                          fontSize: "11px",
                        }}
                      >
                        {q.year}
                      </span>
                    )}

                    <span
                      style={{
                        color: q.is_active
                          ? "#10b981"
                          : "#ef4444",
                        fontSize: "11px",
                        padding: "4px",
                      }}
                    >
                      {q.is_active
                        ? "● Active"
                        : "● Inactive"}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() =>
                      editQuestion(q)
                    }
                    style={{
                      background: "#f59e0b",
                      color: "#000",
                      border: "none",
                      padding: "7px 10px",
                      borderRadius: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      toggleActive(q)
                    }
                    style={{
                      background: q.is_active
                        ? "#3b82f6"
                        : "#10b981",
                      color: "white",
                      border: "none",
                      padding: "7px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    {q.is_active
                      ? "Hide"
                      : "Activate"}
                  </button>

                  <button
                    onClick={() =>
                      deleteQuestion(q.id)
                    }
                    style={{
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      padding: "7px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}