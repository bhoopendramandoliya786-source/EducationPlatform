"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../lib/supabase";
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, BookOpen, Layers } from "lucide-react";

export default function ChapterManager() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  // Form States
  const [selectedSubject, setSelectedSubject] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Filter & Search States
  const [filterSubject, setFilterSubject] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoadingData(true);
    await Promise.all([fetchSubjects(), fetchChapters()]);
    setLoadingData(false);
  }

  async function fetchSubjects() {
    const { data, error } = await supabase
      .from("subjects")
      .select("id, name")
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
      subject_id: selectedSubject,
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
    const ok = confirm("⚠️ क्या आप इस Chapter को हटाना चाहते हैं?");
    if (!ok) return;

    const { error } = await supabase
      .from("chapters")
      .delete()
      .eq("id", id);

    if (error) {
      alert("❌ Delete नहीं हुआ:\n\n" + error.message);
      return;
    }

    await fetchChapters();
  }

  // Filter & Search Logic
  const filteredChapters = useMemo(() => {
    return chapters.filter((c) => {
      const matchesSubject =
        filterSubject === "ALL" || String(c.subject_id) === String(filterSubject);
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.subjects?.name && c.subjects.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSubject && matchesSearch;
    });
  }, [chapters, filterSubject, searchQuery]);

  if (loadingData) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs animate-pulse">
        📚 Chapters लोड हो रहे हैं...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-200">

      {/* 🏷️ Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" /> Chapter Manager
          </h2>
          <p className="text-xs text-slate-400">सीधे Subject के अंदर Chapters बनाएँ और प्रबंधित करें</p>
        </div>
        <span className="text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-lg self-start sm:self-auto">
          कुल Chapters: {chapters.length}
        </span>
      </div>

      {/* 📝 Add / Edit Form */}
      <form onSubmit={saveChapter} className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
          {editId ? <Edit2 className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-3.5 h-3.5 text-emerald-400" />}
          {editId ? "Chapter एडिट करें" : "नया Chapter जोड़ें"}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Subject Dropdown */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Subject चुनें *</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
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

          {/* Chapter Name */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Chapter का नाम *</label>
            <input
              type="text"
              placeholder="जैसे: 1. वन्यजीव अभयारण्य"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">विवरण (Description)</label>
          <input
            type="text"
            placeholder="जैसे: थ्योरी नोट्स, अभ्यास MCQs एवं विगत वर्ष PYQs"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 items-center">
          {/* Sort Order */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">क्रम संख्या (Sort Order)</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Active Checkbox */}
          <div className="pt-4">
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
        </div>

        {/* Form Buttons */}
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
            {loading ? "सेव हो रहा है..." : editId ? "अपडेट करें" : "Chapter जोड़ें"}
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

      {/* 🔍 Search & Filter Bar */}
      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-2.5 items-center justify-between">

        {/* Subject Filter */}
        <div className="w-full sm:w-1/3 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">सभी Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-2/3 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Chapter नाम से खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* 📋 Compact Chapter List Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-indigo-300 font-bold text-[11px]">
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Chapter का नाम</th>
              <th className="py-2.5 px-3">Subject</th>
              <th className="py-2.5 px-3">स्थिति</th>
              <th className="py-2.5 px-3 text-right">एक्शन</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredChapters.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500 text-xs">
                  कोई Chapter नहीं मिला।
                </td>
              </tr>
            ) : (
              filteredChapters.map((chapter, index) => (
                <tr key={chapter.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-2 px-3 text-slate-500 font-bold">{index + 1}</td>
                  <td className="py-2 px-3">
                    <div className="font-semibold text-slate-200">{chapter.name}</div>
                    {chapter.description && (
                      <div className="text-[10px] text-slate-400 line-clamp-1">{chapter.description}</div>
                    )}
                  </td>
                  <td className="py-2 px-3 text-amber-400 font-medium">
                    {chapter.subjects?.name || "—"}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        chapter.is_active
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                      }`}
                    >
                      {chapter.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => editChapter(chapter)}
                        className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleActive(chapter)}
                        className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition"
                        title={chapter.is_active ? "Hide" : "Show"}
                      >
                        {chapter.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => deleteChapter(chapter.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}