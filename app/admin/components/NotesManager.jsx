"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../lib/supabase";
import { BookOpen, Plus, Edit2, Trash2, Eye, EyeOff, Search, FileText, CheckCircle2 } from "lucide-react";

export default function NotesManager() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState("study");
  const [sortOrder, setSortOrder] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);

  // 1. लोड करें सभी Subjects
  useEffect(() => {
    async function fetchSubjects() {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
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
      setLoadingChapters(true);
      const { data, error } = await supabase
        .from("chapters")
        .select("id, name")
        .eq("subject_id", selectedSubject)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      setLoadingChapters(false);
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
        .order("sort_order", { ascending: true })
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

    if (!selectedChapter) {
      alert("कृपया पहले Subject और Chapter चुनें!");
      return;
    }
    if (!title.trim() || !content.trim()) {
      alert("कृपया Note Title और Content दोनों भरें!");
      return;
    }

    setLoading(true);

    const payload = {
      chapter_id: selectedChapter,
      title: title.trim(),
      content: content.trim(),
      note_type: noteType,
      sort_order: Number(sortOrder) || 1,
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
      resetForm();
      // Re-fetch notes
      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("chapter_id", selectedChapter)
        .order("sort_order", { ascending: true })
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
    setSortOrder(note.sort_order || 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function resetForm() {
    setTitle("");
    setContent("");
    setSortOrder(1);
    setEditId(null);
  }

  // 6. Delete Note
  async function deleteNote(id) {
    if (!confirm("क्या आप वाकई इस Note Sheet को हटाना चाहते हैं?")) return;

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

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notes, searchQuery]);

  return (
    <div className="space-y-6 text-slate-200">

      {/* 🏷️ Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" /> Notes Manager
          </h2>
          <p className="text-xs text-slate-400">अध्याय-वार स्मार्ट वन-लाइनर्स और सारणी शीट्स जोड़ें</p>
        </div>
        <span className="text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-lg self-start sm:self-auto">
          अध्याय नोट्स: {notes.length}
        </span>
      </div>

      {/* 📝 Add / Edit Form */}
      <form onSubmit={saveNote} className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
          {editId ? <Edit2 className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-3.5 h-3.5 text-emerald-400" />}
          {editId ? "Note Sheet एडिट करें" : "नई Note Sheet जोड़ें"}
        </div>

        {/* Cascading Subject & Chapter Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">1. Subject चुनें *</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
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
              value={selectedChapter}
              disabled={!selectedSubject || loadingChapters}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-40"
            >
              <option value="">
                {!selectedSubject ? "-- पहले Subject चुनें --" : loadingChapters ? "Chapters लोड हो रहे हैं..." : "-- Chapter चुनें --"}
              </option>
              {chapters.map((chap) => (
                <option key={chap.id} value={chap.id}>
                  {chap.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Title & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">नोट शीट का शीर्षक (Title) *</label>
            <input
              type="text"
              placeholder="जैसे: भाग 1: वन्यजीव प्रतीक एवं सामान्य तथ्य"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">क्रम (Sort Order)</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Content Box */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[11px] font-semibold text-slate-400">नोट्स कंटेंट (One-Liners & Tables) *</label>
            <span className="text-[10px] text-slate-500">Auto-formatted for continuous booklet</span>
          </div>
          <textarea
            rows={8}
            placeholder={`1. राजस्थान का राज्य पशु कौन सा है? - चिंकारा\n2. चिंकारा को दर्जा कब दिया गया? - 1981 में\n\nसारणी 1: सम्प्रदाय एवं प्रवर्तक\n| सम्प्रदाय | प्रवर्तक |\n| संरचनावाद | विलियम वुंट |`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              editId
                ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                : "bg-emerald-600 text-white hover:bg-emerald-500"
            }`}
          >
            {loading ? "सेव हो रहा है..." : editId ? "अपडेट करें" : "Note Sheet सेव करें"}
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

      {/* 📋 Existing Notes List */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300">
            चयनित Chapter के नोट्स ({notes.length})
          </h3>
          {notes.length > 0 && (
            <div className="w-full sm:w-64 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
              <input
                type="text"
                placeholder="नोट्स में खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}
        </div>

        {!selectedChapter ? (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-500">
            👆 कृपया ऊपर से पहले Subject और Chapter चुनें।
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-500">
            इस अध्याय में अभी कोई नोट्स नहीं हैं।
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotes.map((note, index) => (
              <div
                key={note.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500">#{index + 1}</span>
                    <h4 className="text-xs font-bold text-white truncate">{note.title}</h4>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.2 rounded-full border ${
                        note.is_published
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                      }`}
                    >
                      {note.is_published ? "Published" : "Hidden"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 font-mono leading-relaxed">
                    {note.content}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  <button
                    onClick={() => editNote(note)}
                    className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => togglePublish(note)}
                    className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition"
                    title={note.is_published ? "Hide" : "Publish"}
                  >
                    {note.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
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