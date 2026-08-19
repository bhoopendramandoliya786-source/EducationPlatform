"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function ChapterManager() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState("");
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
      fetchSubjects(),
      fetchChapters(),
    ]);

    setLoadingData(false);
  }

  async function fetchSubjects() {
    const { data, error } = await supabase
      .from("subjects")
      .select("id,name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      alert("Subject load error: " + error.message);
      return;
    }

    setSubjects(data || []);
  }

  async function fetchChapters() {
    const { data, error } = await supabase
      .from("chapters")
      .select(`
        id,
        subject_id,
        name,
        description,
        sort_order,
        is_active,
        created_at,
        subjects (
          name
        )
      `)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      alert("Chapter load error: " + error.message);
      return;
    }

    setChapters(data || []);
  }

  function makeSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
  }

  async function saveChapter(e) {
    e.preventDefault();

    if (!selectedSubject) {
      alert("Subject select करें");
      return;
    }

    if (!name.trim()) {
      alert("Chapter name जरूरी है");
      return;
    }

    setLoading(true);

    const payload = {
      subject_id: Number(selectedSubject),
      name: name.trim(),
      slug: makeSlug(name),
      description: description.trim(),
      sort_order: Number(sortOrder) || 0,
      is_active: isActive,
    };

    let error = null;

    if (editId) {
      const result = await supabase
        .from("chapters")
        .update(payload)
        .eq("id", editId);

      error = result.error;
    } else {
      const result = await supabase
        .from("chapters")
        .insert([payload]);

      error = result.error;
    }

    setLoading(false);

    if (error) {
      alert("❌ " + error.message);
      return;
    }

    resetForm();
    await fetchChapters();
  }

  function editChapter(chapter) {
    setEditId(chapter.id);
    setSelectedSubject(String(chapter.subject_id));
    setName(chapter.name || "");
    setDescription(chapter.description || "");
    setSortOrder(chapter.sort_order || 0);
    setIsActive(chapter.is_active);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function resetForm() {
    setEditId(null);
    setSelectedSubject("");
    setName("");
    setDescription("");
    setSortOrder(0);
    setIsActive(true);
  }

  async function toggleActive(chapter) {
    const { error } = await supabase
      .from("chapters")
      .update({
        is_active: !chapter.is_active,
      })
      .eq("id", chapter.id);

    if (error) {
      alert("❌ " + error.message);
      return;
    }

    await fetchChapters();
  }

  async function deleteChapter(id) {
    const ok = confirm(
      "⚠️ Chapter delete करना है?\n\nअगर इसमें Topics जुड़े हैं तो delete नहीं होगा।"
    );

    if (!ok) return;

    const { error } = await supabase
      .from("chapters")
      .delete()
      .eq("id", id);

    if (error) {
      alert(
        "❌ Delete नहीं हुआ:\n\n" +
        error.message +
        "\n\nपहले इसके Topics हटाएँ या deactivate करें।"
      );
      return;
    }

    await fetchChapters();
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
        📚 Chapters loading...
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
        📖 Chapter Manager
      </h2>

      <p
        style={{
          color: "#94a3b8",
          fontSize: "13px",
        }}
      >
        Subject के अंदर Chapters manage करें।
      </p>

      <form onSubmit={saveChapter}>
        {/* SUBJECT */}

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <option value="">
            Select Subject
          </option>

          {subjects.map((subject) => (
            <option
              key={subject.id}
              value={subject.id}
            >
              {subject.name}
            </option>
          ))}
        </select>

        {/* CHAPTER NAME */}

        <input
          placeholder="Chapter name"
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
          placeholder="Chapter description"
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
            onChange={(e) => setIsActive(e.target.checked)}
          />

          Active Chapter
        </label>

        {/* BUTTONS */}

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
          }}
        >
          {loading
            ? "Saving..."
            : editId
            ? "Update Chapter"
            : "Add Chapter"}
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

      {/* CHAPTER LIST */}

      <div style={{ marginTop: "25px" }}>
        <h3>
          📚 All Chapters ({chapters.length})
        </h3>

        {chapters.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>
            अभी कोई Chapter नहीं है।
          </p>
        ) : (
          chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              style={{
                background: "#1e293b",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "10px",
                border: chapter.is_active
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
                    {index + 1}. {chapter.name}
                  </b>

                  <p
                    style={{
                      margin: "5px 0",
                      color: "#f59e0b",
                      fontSize: "13px",
                    }}
                  >
                    📚 {chapter.subjects?.name || "Unknown Subject"}
                  </p>

                  {chapter.description && (
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: "12px",
                      }}
                    >
                      {chapter.description}
                    </p>
                  )}

                  <span
                    style={{
                      fontSize: "11px",
                      color: chapter.is_active
                        ? "#10b981"
                        : "#ef4444",
                    }}
                  >
                    {chapter.is_active
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
                    onClick={() => editChapter(chapter)}
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
                    onClick={() => toggleActive(chapter)}
                    style={{
                      background: chapter.is_active
                        ? "#3b82f6"
                        : "#10b981",
                      color: "white",
                      border: "none",
                      padding: "7px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    {chapter.is_active
                      ? "Hide"
                      : "Activate"}
                  </button>

                  <button
                    onClick={() =>
                      deleteChapter(chapter.id)
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