"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function NotesManager() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState("study");

  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. लोड करें सभी Subjects
  useEffect(() => {
    async function fetchSubjects() {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name")
        .order("name");
      if (!error && data) {
        setSubjects(data);
      }
    }
    fetchSubjects();
  }, []);

  // 2. जब Subject बदला जाए, तो उसके Chapters लोड करें
  useEffect(() => {
    async function fetchChapters() {
      if (!selectedSubject) {
        setChapters([]);
        setSelectedChapter("");
        setNotes([]);
        return;
      }
      const { data, error } = await supabase
        .from("chapters")
        .select("id, name")
        .eq("subject_id", selectedSubject)
        .order("name");
      if (!error && data) {
        setChapters(data);
      }
    }
    fetchChapters();
  }, [selectedSubject]);

  // 3. जब Chapter चुना जाए, तो सिर्फ उसी Chapter के Notes लोड करें
  useEffect(() => {
    async function fetchNotes() {
      if (!selectedChapter) {
        setNotes([]);
        return;
      }
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("chapter_id", selectedChapter)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setNotes(data);
      }
    }
    fetchNotes();
  }, [selectedChapter]);

  // 4. Note सेव या अपडेट करें
  async function saveNote(e) {
    e.preventDefault();

    if (!selectedChapter || !title.trim() || !content.trim()) {
      alert("कृपया Subject, Chapter, Title और Content सभी भरें!");
      return;
    }

    setLoading(true);

    const payload = {
      chapter_id: Number(selectedChapter),
      title: title.trim(),
      content: content.trim(),
      note_type: noteType,
      is_published: true,
    };

    let error;

    if (editId) {
      const result = await supabase
        .from("notes")
        .update(payload)
        .eq("id", editId);
      error = result.error;
    } else {
      const result = await supabase.from("notes").insert([payload]);
      error = result.error;
    }

    setLoading(false);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setTitle("");
      setContent("");
      setEditId(null);
      // Re-fetch notes
      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("chapter_id", selectedChapter)
        .order("created_at", { ascending: true });
      if (data) setNotes(data);
    }
  }

  // 5. Edit Note
  function editNote(note) {
    setEditId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setNoteType(note.note_type || "study");
  }

  // 6. Delete Note
  async function deleteNote(id) {
    if (!confirm("क्या आप वाकई इस Note को Delete करना चाहते हैं?")) return;

    const { error } = await supabase.from("notes").delete().eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  }

  // 7. Toggle Publish
  async function togglePublish(note) {
    const { error } = await supabase
      .from("notes")
      .update({
        is_published: !note.is_published,
      })
      .eq("id", note.id);

    if (!error) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === note.id ? { ...n, is_published: !n.is_published } : n
        )
      );
    }
  }

  return (
    <div
      style={{
        background: "#0f172a",
        color: "white",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid #1e293b",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          borderBottom: "1px solid #1e293b",
          paddingBottom: "12px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "16px", color: "#34d399" }}>
          📝 Notes Manager (Subject ➔ Chapter Mapping)
        </h2>
        <span
          style={{
            fontSize: "11px",
            background: "rgba(16, 185, 129, 0.1)",
            color: "#10b981",
            padding: "3px 8px",
            borderRadius: "12px",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            fontWeight: "bold",
          }}
        >
          No Topic Clutter
        </span>
      </div>

      <form onSubmit={saveNote}>
        {/* Dropdown 1: Select Subject */}
        <div style={{ marginBottom: "10px" }}>
          <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
            1. विषय चुनें (Select Subject):
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              background: "#020617",
              color: "white",
              border: "1px solid #334155",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          >
            <option value="">-- Select Subject --</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 2: Select Chapter */}
        <div style={{ marginBottom: "10px" }}>
          <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
            2. अध्याय चुनें (Select Chapter):
          </label>
          <select
            value={selectedChapter}
            disabled={!selectedSubject}
            onChange={(e) => setSelectedChapter(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              background: "#020617",
              color: "white",
              border: "1px solid #334155",
              borderRadius: "8px",
              fontSize: "13px",
              opacity: !selectedSubject ? 0.4 : 1,
            }}
          >
            <option value="">-- {!selectedSubject ? "पहले विषय चुनें" : "Select Chapter"} --</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Note Title */}
        <div style={{ marginBottom: "10px" }}>
          <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
            नोट का शीर्षक (Note Title):
          </label>
          <input
            placeholder="उदा. भाग 1: राजस्थान के वन्यजीव प्रतीक एवं सामान्य तथ्य"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              boxSizing: "border-box",
              background: "#020617",
              color: "white",
              border: "1px solid #334155",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          />
        </div>

        {/* Note Type */}
        <div style={{ marginBottom: "10px" }}>
          <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
            प्रकार (Type):
          </label>
          <select
            value={noteType}
            onChange={(e) => setNoteType(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              background: "#020617",
              color: "white",
              border: "1px solid #334155",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          >
            <option value="study">Study Theory Note</option>
            <option value="short">Short Revision</option>
            <option value="revision">Revision Capsule</option>
          </select>
        </div>

        {/* Note Content */}
        <div style={{ marginBottom: "12px" }}>
          <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
            नोट्स कंटेंट (One-Liners):
          </label>
          <textarea
            rows="8"
            placeholder={`1. प्रश्न? - उत्तर\n2. प्रश्न? - उत्तर`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              boxSizing: "border-box",
              background: "#020617",
              color: "white",
              border: "1px solid #334155",
              borderRadius: "8px",
              fontSize: "13px",
              lineHeight: "1.5",
              fontFamily: "monospace",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#10b981",
              color: "#020617",
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "13px",
              cursor: "pointer",
              flex: 1,
            }}
          >
            {loading ? "सेव हो रहा है..." : editId ? "Update Note (अपडेट करें)" : "Save Note (नोट सेव करें)"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setTitle("");
                setContent("");
              }}
              style={{
                background: "#334155",
                color: "white",
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              रद्द करें
            </button>
          )}
        </div>
      </form>

      {/* Selected Chapter Existing Notes */}
      <div style={{ marginTop: "24px", borderTop: "1px solid #1e293b", paddingTop: "16px" }}>
        <h3 style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "12px" }}>
          चयनित अध्याय के मौजूदा नोट्स ({notes.length}):
        </h3>

        {!selectedChapter ? (
          <p style={{ color: "#64748b", fontSize: "12px", fontStyle: "italic" }}>
            कृपया ऊपर से पहले Subject और Chapter चुनें।
          </p>
        ) : notes.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "12px", fontStyle: "italic" }}>
            इस अध्याय में अभी कोई नोट्स नहीं हैं।
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              style={{
                background: "#020617",
                border: "1px solid #1e293b",
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: "13px", color: "#f8fafc" }}>{note.title}</b>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    margin: "2px 0 0 0",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {note.content}
                </p>
              </div>

              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <button
                  onClick={() => editNote(note)}
                  style={{
                    background: "rgba(245, 158, 11, 0.2)",
                    color: "#f59e0b",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() => togglePublish(note)}
                  style={{
                    background: note.is_published ? "rgba(59, 130, 246, 0.2)" : "rgba(100, 116, 139, 0.2)",
                    color: note.is_published ? "#60a5fa" : "#94a3b8",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {note.is_published ? "Hide" : "Publish"}
                </button>

                <button
                  onClick={() => deleteNote(note.id)}
                  style={{
                    background: "rgba(239, 68, 68, 0.2)",
                    color: "#f87171",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
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