"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function QuizManager() {
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [chapterId, setChapterId] = useState("");
  const [topicId, setTopicId] = useState("");

  const [totalQuestions, setTotalQuestions] = useState(10);
  const [duration, setDuration] = useState(30);
  const [quizType, setQuizType] = useState("practice");

  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoadingData(true);

    await Promise.all([
      fetchChapters(),
      fetchTopics(),
      fetchQuestions(),
      fetchQuizzes(),
    ]);

    setLoadingData(false);
  }

  async function fetchChapters() {
    const { data, error } = await supabase
      .from("chapters")
      .select("id,name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (!error) {
      setChapters(data || []);
    } else {
      console.error(error);
    }
  }

  async function fetchTopics() {
    const { data, error } = await supabase
      .from("topics")
      .select("id,name,chapter_id")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (!error) {
      setTopics(data || []);
    } else {
      console.error(error);
    }
  }

  async function fetchQuestions() {
    const { data, error } = await supabase
      .from("questions")
      .select(`
        id,
        topic_id,
        question,
        is_pyq,
        is_active,
        difficulty,
        topics (
          name
        )
      `)
      .eq("is_active", true)
      .order("id", { ascending: false })
      .limit(500);

    if (!error) {
      setQuestions(data || []);
    } else {
      console.error(error);
    }
  }

  async function fetchQuizzes() {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error) {
      setQuizzes(data || []);
    } else {
      console.error(error);
    }
  }

  const filteredTopics = useMemo(() => {
    if (!chapterId) return topics;

    return topics.filter(
      (topic) => String(topic.chapter_id) === String(chapterId)
    );
  }, [topics, chapterId]);

  const filteredQuestions = useMemo(() => {
    let result = questions;

    if (topicId) {
      result = result.filter(
        (question) =>
          String(question.topic_id) === String(topicId)
      );
    } else if (chapterId) {
      const chapterTopicIds = new Set(
        topics
          .filter(
            (topic) =>
              String(topic.chapter_id) === String(chapterId)
          )
          .map((topic) => String(topic.id))
      );

      result = result.filter((question) =>
        chapterTopicIds.has(String(question.topic_id))
      );
    }

    return result;
  }, [questions, topics, chapterId, topicId]);

  function toggleQuestion(id) {
    setSelectedQuestions((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      if (prev.length >= Number(totalQuestions)) {
        alert(
          `आप अधिकतम ${Number(totalQuestions)} questions select कर सकते हैं।`
        );
        return prev;
      }

      return [...prev, id];
    });
  }

  function selectAllVisibleQuestions() {
    const limit = Number(totalQuestions);

    const ids = filteredQuestions
      .slice(0, limit)
      .map((question) => question.id);

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
      alert(
        `कृपया ठीक ${questionLimit} questions select करें। अभी ${selectedQuestions.length} selected हैं।`
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        chapter_id: chapterId ? Number(chapterId) : null,
        topic_id: topicId ? Number(topicId) : null,
        total_questions: questionLimit,
        duration_minutes:
          duration && Number(duration) > 0
            ? Number(duration)
            : null,
        quiz_type: quizType,
      };

      let quizId = editId;

      if (editId) {
        const { error } = await supabase
          .from("quizzes")
          .update(payload)
          .eq("id", editId);

        if (error) throw error;

        /*
         * Existing quiz के questions replace किए जा रहे हैं।
         */
        const { error: deleteError } = await supabase
          .from("quiz_questions")
          .delete()
          .eq("quiz_id", editId);

        if (deleteError) throw deleteError;
      } else {
        const { data, error } = await supabase
          .from("quizzes")
          .insert([payload])
          .select("id")
          .single();

        if (error) throw error;

        quizId = data.id;
      }

      const quizQuestions = selectedQuestions.map(
        (questionId, index) => ({
          quiz_id: quizId,
          question_id: questionId,
          question_order: index + 1,
        })
      );

      const { error: questionError } = await supabase
        .from("quiz_questions")
        .insert(quizQuestions);

      if (questionError) throw questionError;

      alert(
        editId
          ? "✅ Quiz successfully updated"
          : "✅ Quiz successfully created"
      );

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
    setTopicId(quiz.topic_id || "");
    setTotalQuestions(quiz.total_questions || 10);
    setDuration(quiz.duration_minutes || 30);
    setQuizType(quiz.quiz_type || "practice");

    const { data, error } = await supabase
      .from("quiz_questions")
      .select("question_id")
      .eq("quiz_id", quiz.id)
      .order("question_order", { ascending: true });

    if (!error) {
      setSelectedQuestions(
        (data || []).map((item) => item.question_id)
      );
    } else {
      alert("Questions load नहीं हो सके: " + error.message);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deleteQuiz(id) {
    if (!confirm("यह Quiz delete करना है?")) {
      return;
    }

    setLoading(true);

    try {
      /*
       * पहले relation records हटेंगे,
       * फिर quiz delete होगा।
       */
      const { error: questionError } = await supabase
        .from("quiz_questions")
        .delete()
        .eq("quiz_id", id);

      if (questionError) throw questionError;

      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchQuizzes();

      if (editId === id) {
        resetForm();
      }
    } catch (error) {
      console.error(error);
      alert("❌ Delete error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish(quiz) {
    const { error } = await supabase
      .from("quizzes")
      .update({
        is_published: !quiz.is_published,
      })
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
    setTopicId("");
    setTotalQuestions(10);
    setDuration(30);
    setQuizType("practice");
    setSelectedQuestions([]);
    setEditId(null);
  }

  function handleChapterChange(value) {
    setChapterId(value);

    /*
     * Chapter बदलने पर पुराना topic reset।
     */
    setTopicId("");
    setSelectedQuestions([]);
  }

  function handleTopicChange(value) {
    setTopicId(value);
    setSelectedQuestions([]);
  }

  return (
    <section
      style={{
        background: "#111827",
        color: "#fff",
        padding: "20px",
        borderRadius: "16px",
        marginTop: "20px",
      }}
    >
      <h2>📝 Quiz Manager</h2>

      {loadingData ? (
        <p style={{ color: "#94a3b8" }}>
          Quiz data loading...
        </p>
      ) : (
        <>
          <form onSubmit={saveQuiz}>
            <input
              placeholder="Quiz title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "11px",
                boxSizing: "border-box",
                marginTop: "10px",
              }}
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              style={{
                width: "100%",
                padding: "11px",
                boxSizing: "border-box",
                marginTop: "10px",
              }}
            />

            <select
              value={chapterId}
              onChange={(e) =>
                handleChapterChange(e.target.value)
              }
              style={{
                width: "100%",
                padding: "11px",
                marginTop: "10px",
              }}
            >
              <option value="">All Chapters / General Quiz</option>

              {chapters.map((chapter) => (
                <option
                  key={chapter.id}
                  value={chapter.id}
                >
                  {chapter.name}
                </option>
              ))}
            </select>

            <select
              value={topicId}
              onChange={(e) =>
                handleTopicChange(e.target.value)
              }
              style={{
                width: "100%",
                padding: "11px",
                marginTop: "10px",
              }}
            >
              <option value="">All Topics / Chapter Quiz</option>

              {filteredTopics.map((topic) => (
                <option
                  key={topic.id}
                  value={topic.id}
                >
                  {topic.name}
                </option>
              ))}
            </select>

            <select
              value={quizType}
              onChange={(e) =>
                setQuizType(e.target.value)
              }
              style={{
                width: "100%",
                padding: "11px",
                marginTop: "10px",
              }}
            >
              <option value="practice">Practice</option>
              <option value="daily">Daily</option>
              <option value="chapter">Chapter</option>
              <option value="topic">Topic</option>
              <option value="mock">Mock</option>
              <option value="revision">Revision</option>
            </select>

            <input
              type="number"
              min="1"
              value={totalQuestions}
              onChange={(e) => {
                setTotalQuestions(e.target.value);
                setSelectedQuestions([]);
              }}
              placeholder="Total Questions"
              style={{
                width: "100%",
                padding: "11px",
                boxSizing: "border-box",
                marginTop: "10px",
              }}
            />

            <input
              type="number"
              min="1"
              value={duration}
              onChange={(e) =>
                setDuration(e.target.value)
              }
              placeholder="Duration in minutes"
              style={{
                width: "100%",
                padding: "11px",
                boxSizing: "border-box",
                marginTop: "10px",
              }}
            />

            <div
              style={{
                background: "#020617",
                border: "1px solid #334155",
                borderRadius: "12px",
                padding: "15px",
                marginTop: "15px",
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
                <strong>
                  ❓ Select Questions
                </strong>

                <span
                  style={{
                    color:
                      selectedQuestions.length ===
                      Number(totalQuestions)
                        ? "#10b981"
                        : "#f59e0b",
                  }}
                >
                  {selectedQuestions.length}/
                  {Number(totalQuestions) || 0}
                </span>
              </div>

              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={selectAllVisibleQuestions}
                  style={{
                    background: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "7px",
                  }}
                >
                  Select First{" "}
                  {Number(totalQuestions) || 0}
                </button>

                <button
                  type="button"
                  onClick={clearSelectedQuestions}
                  style={{
                    background: "#475569",
                    color: "#fff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "7px",
                  }}
                >
                  Clear
                </button>
              </div>

              <div
                style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  marginTop: "12px",
                }}
              >
                {filteredQuestions.length === 0 ? (
                  <p
                    style={{
                      color: "#94a3b8",
                    }}
                  >
                    इस selection के लिए कोई question नहीं मिला।
                  </p>
                ) : (
                  filteredQuestions.map(
                    (question, index) => {
                      const selected =
                        selectedQuestions.includes(
                          question.id
                        );

                      return (
                        <label
                          key={question.id}
                          style={{
                            display: "block",
                            background: selected
                              ? "#172554"
                              : "#1e293b",
                            border: selected
                              ? "1px solid #3b82f6"
                              : "1px solid #334155",
                            padding: "10px",
                            borderRadius: "8px",
                            marginBottom: "8px",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() =>
                              toggleQuestion(
                                question.id
                              )
                            }
                            style={{
                              marginRight: "8px",
                            }}
                          />

                          <b>Q{index + 1}.</b>{" "}
                          {question.question}

                          <div
                            style={{
                              color: "#94a3b8",
                              fontSize: "11px",
                              marginTop: "5px",
                            }}
                          >
                            {question.topics?.name || "Topic"}{" "}
                            •{" "}
                            {question.is_pyq
                              ? "PYQ"
                              : "MCQ"}{" "}
                            •{" "}
                            {question.difficulty}
                          </div>
                        </label>
                      );
                    }
                  )
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "15px",
                background: loading
                  ? "#64748b"
                  : "#a855f7",
                color: "#fff",
                padding: "12px 20px",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {loading
                ? "Saving..."
                : editId
                ? "Update Quiz"
                : "Create Quiz"}
            </button>

            {editId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  marginTop: "10px",
                  marginLeft: "8px",
                  background: "#475569",
                  color: "#fff",
                  padding: "12px 20px",
                  border: "none",
                  borderRadius: "8px",
                }}
              >
                Cancel Edit
              </button>
            )}
          </form>

          <div style={{ marginTop: "25px" }}>
            <h3>📋 Created Quizzes</h3>

            {quizzes.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>
                अभी कोई Quiz नहीं बना है।
              </p>
            ) : (
              quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  style={{
                    background: "#1e293b",
                    padding: "14px",
                    borderRadius: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <b>{quiz.title}</b>

                                    <p
                    style={{
                      color: quiz.is_published
                        ? "#10b981"
                        : "#f59e0b",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  >
                    {quiz.is_published ? "● Published" : "● Draft"}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginTop: "10px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => editQuiz(quiz)}
                      style={{
                        background: "#3b82f6",
                        color: "#fff",
                        border: "none",
                        padding: "8px 14px",
                        borderRadius: "7px",
                        cursor: "pointer",
                      }}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePublish(quiz)}
                      style={{
                        background: quiz.is_published
                          ? "#f59e0b"
                          : "#10b981",
                        color: "#000",
                        border: "none",
                        padding: "8px 14px",
                        borderRadius: "7px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      {quiz.is_published
                        ? "Unpublish"
                        : "Publish"}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteQuiz(quiz.id)}
                      style={{
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        padding: "8px 14px",
                        borderRadius: "7px",
                        cursor: "pointer",
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}