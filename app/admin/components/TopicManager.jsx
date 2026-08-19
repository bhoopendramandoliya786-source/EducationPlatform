"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function TopicManager() {
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  const [selectedChapter, setSelectedChapter] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

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
    ]);

    setLoadingData(false);
  }

  async function fetchChapters() {
    const { data, error } = await supabase
      .from("chapters")
      .select("id,name,subject_id")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      alert("❌ Chapter load error: " + error.message);
      return;
    }

    setChapters(data || []);
  }

  async function fetchTopics() {
    const { data, error } = await supabase
      .from("topics")
      .select(`
        id,
        chapter_id,
        name,
        description,
        sort_order,
        is_active,
        created_at,
        chapters (
          name
        )
      `)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      alert("❌ Topic load error: " + error.message);
      return;
    }

    setTopics(data || []);
  }

  function makeSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
  }

  async function saveTopic(e) {
    e.preventDefault();

    if (!selectedChapter) {
      alert("Chapter select करें");
      return;
    }

    if (!name.trim()) {
      alert("Topic name जरूरी है");
      return;
    }

    setLoading(true);

    const payload = {
      chapter_id: Number(selectedChapter),
      name: name.trim(),
      slug: makeSlug(name),
      description: description.trim(),
      sort_order: Number(sortOrder) || 0,
      is_active: isActive,
    };

    let error = null;

    if (editId) {
      const result = await supabase
        .from("topics")
        .update(payload)
        .eq("id", editId);

      error = result.error;
    } else {
      const result = await supabase
        .from("topics")
        .insert([payload]);

      error = result.error;
    }

    setLoading(false);

    if (error) {
      alert("❌ " + error.message);
      return;
    }

    resetForm();
    await fetchTopics();
  }

  function editTopic(topic) {
    setEditId(topic.id);
    setSelectedChapter(String(topic.chapter_id));
    setName(topic.name || "");
    setDescription(topic.description || "");
    setSortOrder(topic.sort_order || 0);
    setIsActive(topic.is_active);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function resetForm() {
    setEditId(null);
    setSelectedChapter("");
    setName("");
    setDescription("");
    setSortOrder(0);
    setIsActive(true);
  }

  async function toggleActive(topic) {
    const { error } = await supabase
      .from("topics")
      .update({
        is_active: !topic.is_active,
      })
      .eq("id", topic.id);

    if (error) {
      alert("❌ " + error.message);
      return;
    }

    await fetchTopics();
  }

  async function deleteTopic(id) {
    const ok = confirm(
      "⚠️ Topic delete करना है?\n\nअगर इसमें Notes, Questions या Flashcards जुड़े हैं तो delete नहीं होगा।"
    );

    if (!ok) return;

    const { error } = await supabase
      .from("topics")
      .delete()
      .eq("id", id);

    if (error) {
      alert(
        "❌ Delete नहीं हुआ:\n\n" +
          error.message +
          "\n\nपहले जुड़े हुए content को हटाएँ या Topic को Hide करें।"
      );
      return;
    }

    await fetchTopics();
  }

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
        🧩 Topics loading...
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
      <h2>📌 Topic Manager</h2>

      <p
        style={{
          color: "#94a3b8",
          fontSize: "13px",
        }}
      >
        Chapter के अंदर Topics manage करें।
      </p>

      <form onSubmit={saveTopic}>
        {/* CHAPTER */}

        <select
          value={selectedChapter}
          onChange={(e) => setSelectedChapter(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <option value="">
            Select Chapter
          </option>

          {chapters.map((chapter) => (
            <option
              key={chapter.id}
              value={chapter.id}
            >
              {chapter.name}
            </option>
          ))}
        </select>

        {/* TOPIC NAME */}

        <input
          placeholder="Topic name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        />

        {/* DESCRIPTION */}

        <textarea
          placeholder="Topic description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        />

        {/* SORT ORDER */}

        <input
          type="number"
          placeholder="Sort order"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        />

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

          Active Topic
        </label>

        {/* SAVE */}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: editId ? "#f59e0b" : "#3b82f6",
            color: editId ? "#000" : "#fff",
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
            ? "Update Topic"
            : "Add Topic"}
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

      {/* TOPIC LIST */}

      <div style={{ marginTop: "25px" }}>
        <h3>
          🧩 All Topics ({topics.length})
        </h3>

        {topics.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>
            अभी कोई Topic नहीं है।
          </p>
        ) : (
          topics.map((topic, index) => (
            <div
              key={topic.id}
              style={{
                background: "#1e293b",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "10px",
                border: topic.is_active
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
                <div>
                  <b>
                    {index + 1}. {topic.name}
                  </b>

                  <p
                    style={{
                      margin: "5px 0",
                      color: "#60a5fa",
                      fontSize: "13px",
                    }}
                  >
                    📖{" "}
                    {topic.chapters?.name ||
                      "Unknown Chapter"}
                  </p>

                  {topic.description && (
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: "12px",
                      }}
                    >
                      {topic.description}
                    </p>
                  )}

                  <span
                    style={{
                      fontSize: "11px",
                      color: topic.is_active
                        ? "#10b981"
                        : "#ef4444",
                    }}
                  >
                    {topic.is_active
                      ? "● Active"
                      : "● Inactive"}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "5px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => editTopic(topic)}
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
                      toggleActive(topic)
                    }
                    style={{
                      background: topic.is_active
                        ? "#3b82f6"
                        : "#10b981",
                      color: "white",
                      border: "none",
                      padding: "7px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    {topic.is_active
                      ? "Hide"
                      : "Activate"}
                  </button>

                  <button
                    onClick={() =>
                      deleteTopic(topic.id)
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