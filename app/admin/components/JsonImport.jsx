"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { FileJson, Upload, CheckCircle2, AlertCircle, Layers, FileText, Loader2 } from "lucide-react";

const BATCH_SIZE = 100;

export default function JsonImport() {
  const supabase = createClient();
  const fileInputRef = useRef(null);

  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  
  // Local/Session Persistence to prevent Android reload wipe
  const [selectedSubject, setSelectedSubject] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("admin_sub") || "";
    return "";
  });
  const [selectedChapter, setSelectedChapter] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("admin_chap") || "";
    return "";
  });

  const [fileName, setFileName] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("admin_sub", selectedSubject);
      sessionStorage.setItem("admin_chap", selectedChapter);
    }
  }, [selectedSubject, selectedChapter]);

  useEffect(() => {
    async function loadSubjects() {
      const { data } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (data) setSubjects(data);
    }
    loadSubjects();
  }, [supabase]);

  useEffect(() => {
    async function loadChapters() {
      if (!selectedSubject) {
        setChapters([]);
        return;
      }
      const { data } = await supabase
        .from("chapters")
        .select("id, name")
        .eq("subject_id", selectedSubject)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (data) setChapters(data);
    }
    loadChapters();
  }, [selectedSubject, supabase]);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedSubject || !selectedChapter) {
      alert("❌ पहले Target Subject और Chapter सेलेक्ट करें!");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setMessage(`⏳ ${file.name} प्रोसेस हो रही है...`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("chapterId", selectedChapter);
      formData.append("title", `${file.name.replace(".pdf", "")} नोट्स`);

      const res = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        setMessage(`✅ ${result.message}`);
        alert(`✅ ${result.message}`);
        setFileName("");
      } else {
        setMessage(`❌ ${result.message}`);
        alert(`❌ ${result.message}`);
      }
    } catch (err) {
      setMessage(`❌ नेटवर्क समस्या: ${err.message}`);
      alert(`❌ नेटवर्क समस्या: ${err.message}`);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function normalizeQuestion(q, targetChapterId) {
    if (!q || typeof q !== "object") throw new Error("Invalid question object");
    if (!q.question?.toString().trim()) throw new Error("Question text missing");
    const answer = String(q.answer || "A").toUpperCase().trim();
    if (!["A", "B", "C", "D"].includes(answer)) throw new Error(`Invalid answer: ${answer}`);

    return {
      chapter_id: targetChapterId || q.chapter_id,
      question: String(q.question).trim(),
      option_a: String(q.option_a || "").trim(),
      option_b: String(q.option_b || "").trim(),
      option_c: String(q.option_c || "").trim(),
      option_d: String(q.option_d || "").trim(),
      answer,
      explanation: q.explanation ? String(q.explanation).trim() : "",
      type: ["mcq", "true_false", "multiple"].includes(q.type) ? q.type : "mcq",
      year: q.year ? String(q.year).trim() : null,
      difficulty: ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : "medium",
      source: q.source ? String(q.source).trim() : (q.is_pyq ? "PYQ" : null),
      is_pyq: Boolean(q.is_pyq),
      is_active: true,
    };
  }

  async function runImport(parsedJson) {
    setLoading(true); setMessage(""); setProgress(0);
    try {
      if (Array.isArray(parsedJson)) {
        if (!selectedChapter) throw new Error("कृपया पहले Subject और Chapter चुनें!");
        const { data: existingQs } = await supabase.from("questions").select("question").eq("chapter_id", selectedChapter);
        const existingTextSet = new Set((existingQs || []).map((q) => q.question.trim().toLowerCase()));
        const validQuestions = [];
        for (const q of parsedJson) {
          try {
            const formatted = normalizeQuestion(q, selectedChapter);
            if (!existingTextSet.has(formatted.question.toLowerCase())) validQuestions.push(formatted);
          } catch {}
        }
        for (let i = 0; i < validQuestions.length; i += BATCH_SIZE) {
          const batch = validQuestions.slice(i, i + BATCH_SIZE);
          await supabase.from("questions").insert(batch);
          setProgress(Math.round(((i + batch.length) / validQuestions.length) * 100));
        }
        setMessage(`✅ ${validQuestions.length} प्रश्न सुरक्षित सेव हुए!`);
      } else if (typeof parsedJson === "object" && parsedJson !== null) {
        let chapId = selectedChapter;
        if (!chapId && parsedJson.chapter_name) {
          const { data: c } = await supabase.from("chapters").select("id").ilike("name", parsedJson.chapter_name.trim()).maybeSingle();
          if (c) chapId = c.id;
        }
        if (!chapId) throw new Error("टारगेट Chapter सेलेक्ट करें!");

        if (parsedJson.notes && Array.isArray(parsedJson.notes)) {
          const notesArr = parsedJson.notes.map((n) => ({
            chapter_id: chapId,
            title: n.title || "अध्ययन नोट्स",
            content: n.content,
            note_type: "study",
            sort_order: 1,
            is_published: true
          }));
          await supabase.from("notes").insert(notesArr);
        }
        setMessage("✅ डेटा सफलतापूर्वक सिंक हो गया!");
      }
      setJsonText("");
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 text-slate-100 shadow-2xl">
      <div className="space-y-1 pb-2 border-b border-slate-800">
        <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <FileJson className="w-5 h-5 text-indigo-400" /> 1-Click Importer (PDF & JSON)
        </h2>
        <p className="text-xs text-slate-400">PDF या JSON द्वारा सीधा डेटाबेस अपडेट</p>
      </div>

      {/* Target Selector */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
        <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> टारगेट Chapter (Auto-Saved):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <select value={selectedSubject} onChange={(e) => { setSelectedSubject(e.target.value); setSelectedChapter(""); }} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none">
            <option value="">-- 1. Subject चुनें --</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={selectedChapter} disabled={!selectedSubject} onChange={(e) => setSelectedChapter(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none disabled:opacity-40">
            <option value="">{!selectedSubject ? "-- पहले Subject चुनें --" : "-- 2. Chapter चुनें --"}</option>
            {chapters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Direct PDF Upload Button */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" /> विकल्प A: PDF अपलोड
          </span>
          {fileName && <span className="text-[10px] text-emerald-400 truncate max-w-[150px]">📎 {fileName}</span>}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={loading || !selectedChapter}
          className="w-full text-xs text-slate-300 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white cursor-pointer disabled:opacity-40"
        />
      </div>

      {/* JSON Paste Option */}
      <div className="space-y-2 pt-2">
        <span className="text-xs font-bold text-slate-400 block">विकल्प B: या JSON पेस्ट करें</span>
        <textarea rows={4} value={jsonText} onChange={(e) => setJsonText(e.target.value)} disabled={loading} placeholder='यहाँ JSON कोड पेस्ट करें...' className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-indigo-200 font-mono outline-none" />
        <button type="button" onClick={() => { if (!jsonText.trim()) return setMessage("❌ पहले JSON पेस्ट करें"); try { runImport(JSON.parse(jsonText)); } catch { setMessage("❌ JSON सिंटैक्स अमान्य है!"); } }} disabled={loading || !jsonText.trim()} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 disabled:opacity-40 text-white text-xs font-bold transition flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload JSON
        </button>
      </div>

      {message && (
        <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${message.startsWith("✅") ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300" : message.startsWith("⏳") ? "bg-amber-950/40 border-amber-500/30 text-amber-300" : "bg-rose-950/40 border-rose-500/30 text-rose-300"}`}>
          {message.startsWith("✅") && <CheckCircle2 className="w-4 h-4 shrink-0" />}
          {message.startsWith("❌") && <AlertCircle className="w-4 h-4 shrink-0" />}
          {message.startsWith("⏳") && <Loader2 className="w-4 h-4 shrink-0 animate-spin" />}
          {message}
        </div>
      )}
    </section>
  );
}
