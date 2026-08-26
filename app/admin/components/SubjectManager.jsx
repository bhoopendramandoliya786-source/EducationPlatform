"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../lib/supabase";
import { Layers, Plus, Edit2, Trash2, Eye, EyeOff, Search } from "lucide-react";

export default function SubjectsManager() {
  const [subjects, setSubjects] = useState([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
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
      .select("id, name, slug, description, icon, sort_order, is_active, created_at, updated_at")
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
      result = await supabase.from("subjects").update(payload).eq("id", editId);
    } else {
      result = await supabase.from("subjects").insert([payload]);
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

    window.scrollTo({ top: 0, behavior: "smooth" });
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
      .update({ is_active: !subject.is_active })
      .eq("id", subject.id);

    if (error) {
      setError(error.message);
      return;
    }
    await fetchSubjects();
  }

  async function deleteSubject(subject) {
    const confirmed = window.confirm(`क्या "${subject.name}" subject delete करना है?`);
    if (!confirmed) return;

    setError("");
    const { error } = await supabase.from("subjects").delete().eq("id", subject.id);

    if (error) {
      setError("Subject delete नहीं हुआ। यदि इसमें Chapters जुड़े हैं, तो पहले उन्हें हटाएँ या Subject को Hide करें।");
      return;
    }
    await fetchSubjects();
  }

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.slug && s.slug.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [subjects, searchQuery]);

  return (
    <div className="space-y-5 text-slate-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" /> Subject Manager
          </h2>
          <p className="text-xs text-slate-400">मुख्य विषय बनाएँ एवं प्रबंधित करें</p>
        </div>
        <span className="text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-lg self-start sm:self-auto">
          कुल Subjects: {subjects.length}
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
          ❌ {error}
        </div>
      )}

      {/* Add / Edit Form */}
      <form onSubmit={saveSubject} className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
          {editId ? <Edit2 className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-3.5 h-3.5 text-emerald-400" />}
          {editId ? "Subject एडिट करें" : "नया Subject जोड़ें"}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Subject का नाम *</label>
            <input
              type="text"
              placeholder="जैसे: राजस्थान का भूगोल"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Slug (URL) *</label>
            <input
              type="text"
              placeholder="जैसे: rajasthan-geography"
              value={slug}
              onChange={(e) => setSlug(createSlug(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Icon / Emoji</label>
            <input
              type="text"
              placeholder="जैसे: 🗺️ या BookOpen"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">क्रम संख्या (Sort Order)</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">विवरण (Description)</label>
          <input
            type="text"
            placeholder="जैसे: REET Mains एवं RPSC परीक्षाओं हेतु सम्पूर्ण भूगोल"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              editId
                ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
          >
            {loading ? "सेव हो रहा है..." : editId ? "अपडेट करें" : "Subject जोड़ें"}
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

      {/* Search & Subject Table */}
      <div className="space-y-3">
        <div className="flex justify-between items-center gap-2">
          <h3 className="text-xs font-bold text-slate-300">मौजूदा Subjects ({subjects.length})</h3>
          <div className="w-full sm:w-64 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
            <input
              type="text"
              placeholder="Subject खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-indigo-300 font-bold text-[11px]">
                <th className="py-2.5 px-3">क्रम</th>
                <th className="py-2.5 px-3">Subject Name</th>
                <th className="py-2.5 px-3">Slug</th>
                <th className="py-2.5 px-3">स्थिति</th>
                <th className="py-2.5 px-3 text-right">एक्शन</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {fetching ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 text-xs">
                    Subjects लोड हो रहे हैं...
                  </td>
                </tr>
              ) : filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 text-xs">
                    कोई Subject नहीं मिला।
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subject, index) => (
                  <tr key={subject.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-2 px-3 text-slate-500 font-bold">{subject.sort_order || index + 1}</td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <span>{subject.icon || "📚"}</span>
                        <span>{subject.name}</span>
                      </div>
                      {subject.description && (
                        <div className="text-[10px] text-slate-400 line-clamp-1">{subject.description}</div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{subject.slug}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          subject.is_active
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                        }`}
                      >
                        {subject.is_active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => editSubject(subject)}
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleActive(subject)}
                          className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition"
                          title={subject.is_active ? "Deactivate" : "Activate"}
                        >
                          {subject.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => deleteSubject(subject)}
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

    </div>
  );
}