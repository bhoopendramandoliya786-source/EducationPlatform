"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function SubjectsManager() {
  const [subjects, setSubjects] = useState([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubjects();
  }, []);

  function createSlug(value) {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]/gu, "")
      .replace(/-+/g, "-");
  }

  async function fetchSubjects() {
    setFetching(true);
    setError("");

    const { data, error } = await supabase
      .from("subjects")
      .select(
        "id,name,slug,description,icon,sort_order,is_active,created_at,updated_at"
      )
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setSubjects(data || []);
    }

    setFetching(false);
  }

  function handleNameChange(value) {
    setName(value);

    if (!editId) {
      setSlug(createSlug(value));
    }
  }

  async function saveSubject(e) {
    e.preventDefault();

    setError("");

    const cleanName = name.trim();
    const cleanSlug = slug.trim();

    if (!cleanName) {
      setError("Subject name जरूरी है");
      return;
    }

    if (!cleanSlug) {
      setError("Slug जरूरी है");
      return;
    }

    setLoading(true);

    const payload = {
      name: cleanName,
      slug: cleanSlug,
      description: description.trim() || null,
      icon: icon.trim() || null,
      sort_order: Number(sortOrder) || 0,
    };

    let result;

    if (editId) {
      result = await supabase
        .from("subjects")
        .update(payload)
        .eq("id", editId);
    } else {
      result = await supabase
        .from("subjects")
        .insert([payload]);
    }

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    resetForm();
    await fetchSubjects();

    setLoading(false);
  }

  function editSubject(subject) {
    setEditId(subject.id);

    setName(subject.name || "");
    setSlug(subject.slug || "");
    setDescription(subject.description || "");
    setIcon(subject.icon || "");
    setSortOrder(subject.sort_order ?? 0);

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function resetForm() {
    setEditId(null);
    setName("");
    setSlug("");
    setDescription("");
    setIcon("");
    setSortOrder(0);
    setError("");
  }

  async function toggleActive(subject) {
    setError("");

    const { error } = await supabase
      .from("subjects")
      .update({
        is_active: !subject.is_active,
      })
      .eq("id", subject.id);

    if (error) {
      setError(error.message);
      return;
    }

    await fetchSubjects();
  }

  async function deleteSubject(subject) {
    const confirmed = window.confirm(
      `क्या "${subject.name}" subject delete करना है?`
    );

    if (!confirmed) return;

    setError("");

    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", subject.id);

    if (error) {
      setError(
        "Subject delete नहीं हुआ। हो सकता है इसमें Chapters जुड़े हुए हों। पहले उन्हें हटाएँ या Subject को inactive करें।"
      );
      return;
    }

    await fetchSubjects();
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
      <h2 style={{ marginTop: 0 }}>
        📚 Subjects Manager
      </h2>

      {error && (
        <div
          style={{
            background: "#451a1a",
            color: "#fecaca",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        >
          ❌ {error}
        </div>
      )}

      <form onSubmit={saveSubject}>
        <input
          type="text"
          placeholder="Subject Name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(createSlug(e.target.value))}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Icon / Emoji"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          style={inputStyle}
        />

        <input
          type="number"
          placeholder="Sort Order"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={inputStyle}
        />

        <textarea
          placeholder="Subject Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          style={inputStyle}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#10b981",
              color: "white",
              border: "none",
              padding: "11px 18px",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {loading
              ? "Saving..."
              : editId
              ? "Update Subject"
              : "Add Subject"}
          </button>

          {editId && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                background: "#475569",
                color: "white",
                border: "none",
                padding: "11px 18px",
                borderRadius: "8px",
                fontWeight: "bold",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div style={{ marginTop: "25px" }}>
        <h3>
          Subjects ({subjects.length})
        </h3>

        {fetching ? (
          <p>Loading subjects...</p>
        ) : subjects.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>
            अभी कोई subject नहीं है।
          </p>
        ) : (
          subjects.map((subject) => (
            <div
              key={subject.id}
              style={{
                background: "#1e293b",
                padding: "14px",
                borderRadius: "10px",
                marginBottom: "10px",
                border: "1px solid #334155",
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
                  <h3 style={{ margin: "0 0 5px" }}>
                    {subject.icon || "📚"} {subject.name}
                  </h3>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#94a3b8",
                    }}
                  >
                    slug: {subject.slug || "-"}
                  </div>

                  {subject.description && (
                    <p
                      style={{
                        color: "#cbd5e1",
                        fontSize: "14px",
                      }}
                    >
                      {subject.description}
                    </p>
                  )}
                </div>

                <div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "5px 8px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      background: subject.is_active
                        ? "#064e3b"
                        : "#450a0a",
                      color: subject.is_active
                        ? "#6ee7b7"
                        : "#fca5a5",
                    }}
                  >
                    {subject.is_active
                      ? "ACTIVE"
                      : "INACTIVE"}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "7px",
                  flexWrap: "wrap",
                  marginTop: "10px",
                }}
              >
                <button
                  onClick={() => editSubject(subject)}
                  style={buttonStyle("#f59e0b")}
                >
                  Edit
                </button>

                <button
                  onClick={() => toggleActive(subject)}
                  style={buttonStyle("#3b82f6")}
                >
                  {subject.is_active
                    ? "Deactivate"
                    : "Activate"}
                </button>

                <button
                  onClick={() => deleteSubject(subject)}
                  style={buttonStyle("#ef4444")}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #334155",
  background: "#0f172a",
  color: "white",
};

function buttonStyle(background) {
  return {
    background,
    color: "white",
    border: "none",
    padding: "7px 12px",
    borderRadius: "7px",
    fontWeight: "bold",
    cursor: "pointer",
  };
}