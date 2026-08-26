"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { FileJson, Upload, CheckCircle2, AlertCircle, Layers } from "lucide-react";

const BATCH_SIZE = 100;

export default function JsonImport() {
  const supabase = createClient();
  const fileInputRef = useRef(null);

  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    subjectsCreated: 0,
    chaptersCreated: 0,
    notesImported: 0,
    questionsImported: 0,
    skippedDuplicates: 0,
    failed: 0,
  });

  // Load Subjects on mount
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
  }, []);

  // Load Chapters when Subject changes
  useEffect(() => {
    async function loadChapters() {
      if (!selectedSubject) {
        setChapters([]);
        setSelectedChapter("");
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
  }, [selectedSubject]);

  function normalizeQuestion(q, targetChapterId) {
    if (!q || typeof q !== "object") throw new Error("Invalid question object");
    if (!q.question?.toString().trim()) throw new Error("Question text missing");

    const answer = String(q.answer || "A").toUpperCase().trim();
    if (!["A", "B", "C", "D"].includes(answer)) {
      throw new Error(`Invalid answer choice: ${answer}`);
    }

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

  async function processHierarchy(item) {
    let sCreated = 0, cCreated = 0;
    let subjectId = item.subject_id || selectedSubject;

    if (!subjectId && item.subject_name) {
      const { data: existingSub } = await supabase
        .from("subjects")
        .select("id")
        .ilike("name", item.subject_name.trim())
        .maybeSingle();

      if (existingSub) {
        subjectId = existingSub.id;
      } else {
        const { data: newSub, error: sErr } = await supabase
          .from("subjects")
          .insert({ name: item.subject_name.trim(), is_active: true })
          .select("id")
          .single();
        if (!sErr && newSub) {
          subjectId = newSub.id;
          sCreated++;
        }
      }
    }

    let chapterId = item.chapter_id || selectedChapter;
    if (!chapterId && item.chapter_name && subjectId) {
      const { data: existingChap } = await supabase
        .from("chapters")
        .select("id")
        .eq("subject_id", subjectId)
        .ilike("name", item.chapter_name.trim())
        .maybeSingle();

      if (existingChap) {
        chapterId = existingChap.id;
      } else {
        const { data: newChap, error: cErr } = await supabase
          .from("chapters")
          .insert({
            subject_id: subjectId,
            name: item.chapter_name.trim(),
            description: item.chapter_description || null,
            is_active: true,
          })
          .select("id")
          .single();
        if (!cErr && newChap) {
          chapterId = newChap.id;
          cCreated++;
        }
      }
    }

    return { subjectId, chapterId, sCreated, cCreated };
  }

  async function processMasterChapter(data) {
    let nImported = 0, qImported = 0, dupCount = 0, failCount = 0;
    const { chapterId, sCreated, cCreated } = await processHierarchy(data);

    const targetChapterId = chapterId || selectedChapter;
    if (!targetChapterId) {
      throw new Error("कृपया पहले Subject और Chapter चुनें या JSON में subject_name / chapter_name दें।");
    }

    // 1. Process Notes
    if (data.notes || data.content) {
      const noteItems = Array.isArray(data.notes) ? data.notes : [data];
      const notesToInsert = [];

      for (const n of noteItems) {
        if (!n.content) continue;
        notesToInsert.push({
          chapter_id: targetChapterId,
          title: n.title ? String(n.title).trim() : "स्मार्ट नोट्स शीट",
          content: String(n.content).trim(),
          note_type: n.note_type || "study",
          sort_order: n.sort_order || 1,
          is_published: true,
        });
      }

      if (notesToInsert.length > 0) {
        const { error: noteErr } = await supabase.from("notes").insert(notesToInsert);
        if (!noteErr) nImported += notesToInsert.length;
        else failCount += notesToInsert.length;
      }
    }

    // 2. Process Questions (mcqs, pyqs or questions)
    const rawQuestions = [
      ...(Array.isArray(data.questions) ? data.questions : []),
      ...(Array.isArray(data.mcqs) ? data.mcqs.map((q) => ({ ...q, is_pyq: false })) : []),
      ...(Array.isArray(data.pyqs) ? data.pyqs.map((q) => ({ ...q, is_pyq: true })) : []),
    ];

    if (rawQuestions.length > 0) {
      const { data: existingQs } = await supabase
        .from("questions")
        .select("question")
        .eq("chapter_id", targetChapterId);

      const existingTextSet = new Set((existingQs || []).map((q) => q.question.trim().toLowerCase()));
      const validQuestions = [];

      for (const q of rawQuestions) {
        try {
          const formatted = normalizeQuestion(q, targetChapterId);
          if (existingTextSet.has(formatted.question.toLowerCase())) {
            dupCount++;
            continue;
          }
          validQuestions.push(formatted);
        } catch {
          failCount++;
        }
      }

      for (let i = 0; i < validQuestions.length; i += BATCH_SIZE) {
        const batch = validQuestions.slice(i, i + BATCH_SIZE);
        const { error: qErr } = await supabase.from("questions").insert(batch);
        if (!qErr) qImported += batch.length;
        else failCount += batch.length;
      }
    }

    return { sCreated, cCreated, nImported, qImported, dupCount, failCount };
  }

  async function processArrayInput(arr) {
    let sCreated = 0, cCreated = 0, qImported = 0, nImported = 0, failCount = 0, dupCount = 0;

    // Check if array of chapters / master data
    if (arr.length > 0 && (arr[0].chapter_name || arr[0].subject_name || arr[0].chapters_batch)) {
      for (let i = 0; i < arr.length; i++) {
        const res = await processMasterChapter(arr[i]);
        sCreated += res.sCreated;
        cCreated += res.cCreated;
        nImported += res.nImported;
        qImported += res.qImported;
        dupCount += res.dupCount;
        failCount += res.failCount;
        setProgress(Math.round(((i + 1) / arr.length) * 100));
      }
    } else {
      // Array of Questions only (linked to selected chapter)
      if (!selectedChapter) {
        throw new Error("प्रश्नों की लिस्ट इम्पोर्ट करने के लिए कृपया ऊपर से Subject और Chapter चुनें!");
      }

      const { data: existingQs } = await supabase
        .from("questions")
        .select("question")
        .eq("chapter_id", selectedChapter);

      const existingTextSet = new Set((existingQs || []).map((q) => q.question.trim().toLowerCase()));
      const validQuestions = [];

      for (const q of arr) {
        try {
          const formatted = normalizeQuestion(q, selectedChapter);
          if (existingTextSet.has(formatted.question.toLowerCase())) {
            dupCount++;
            continue;
          }
          validQuestions.push(formatted);
        } catch {
          failCount++;
        }
      }

      for (let i = 0; i < validQuestions.length; i += BATCH_SIZE) {
        const batch = validQuestions.slice(i, i + BATCH_SIZE);
        const { error: qErr } = await supabase.from("questions").insert(batch);
        if (!qErr) qImported += batch.length;
        else failCount += batch.length;
        setProgress(Math.round(((i + batch.length) / validQuestions.length) * 100));
      }
    }

    setStats({
      subjectsCreated: sCreated,
      chaptersCreated: cCreated,
      notesImported: nImported,
      questionsImported: qImported,
      skippedDuplicates: dupCount,
      failed: failCount,
    });
    setMessage(`✅ इम्पोर्ट पूर्ण: ${qImported} प्रश्न, ${nImported} नोट्स शीट सेव हुई!`);
  }

  async function runImport(parsedJson) {
    setLoading(true);
    setMessage("");
    setProgress(0);
    setStats({ subjectsCreated: 0, chaptersCreated: 0, notesImported: 0, questionsImported: 0, skippedDuplicates: 0, failed: 0 });

    try {
      if (Array.isArray(parsedJson)) {
        await processArrayInput(parsedJson);
      } else if (typeof parsedJson === "object" && parsedJson !== null) {
        const res = await processMasterChapter(parsedJson);
        setStats({
          subjectsCreated: res.sCreated,
          chaptersCreated: res.cCreated,
          notesImported: res.nImported,
          questionsImported: res.qImported,
          skippedDuplicates: res.dupCount,
          failed: res.failCount,
        });
        setMessage(`✅ चैप्टर डेटा सिंक हो गया (${res.qImported} प्रश्न, ${res.nImported} नोट्स)!`);
      }
      setJsonText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setMessage(`❌ Error: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 text-slate-100 shadow-2xl">

      {/* 🏷️ Title */}
      <div className="space-y-1 pb-2 border-b border-slate-800">
        <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <FileJson className="w-5 h-5 text-indigo-400" /> 1-Click JSON Importer
        </h2>
        <p className="text-xs text-slate-400">
          सीधे Subject ➔ Chapter चुनकर नोट्स या 100+ MCQs/PYQs का JSON 1 सेकंड में अपलोड करें
        </p>
      </div>

      {/* 🎯 Quick Target Selection (Optional if specified in JSON) */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
        <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> टारगेट Chapter चुनें (यदि JSON में नहीं दिया है):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">-- Subject चुनें --</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedChapter}
            disabled={!selectedSubject}
            onChange={(e) => setSelectedChapter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-40"
          >
            <option value="">
              {!selectedSubject ? "-- पहले Subject चुनें --" : "-- Chapter चुनें --"}
            </option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 📁 File Upload */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
              try {
                runImport(JSON.parse(evt.target?.result));
              } catch {
                setMessage("❌ JSON फाइल अमान्य है!");
              }
            };
            reader.readAsText(file);
          }}
          disabled={loading}
          className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white cursor-pointer"
        />
      </div>

      {/* 📝 Raw Textarea */}
      <textarea
        rows={7}
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        disabled={loading}
        placeholder='यहाँ JSON पेस्ट करें... (उदा. [{"question": "...", "option_a": "...", "answer": "A"}])'
        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-indigo-200 font-mono focus:border-indigo-500 outline-none leading-relaxed"
      />

      {/* 🚀 Upload Button */}
      <button
        type="button"
        onClick={() => {
          if (!jsonText.trim()) return setMessage("❌ पहले JSON पेस्ट करें");
          try {
            runImport(JSON.parse(jsonText));
          } catch {
            setMessage("❌ JSON सिंटैक्स गलत है!");
          }
        }}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-40 text-white text-xs font-bold shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
      >
        <Upload className="w-4 h-4" />
        {loading ? `इम्पोर्ट हो रहा है... (${progress}%)` : "Upload & Sync JSON"}
      </button>

      {/* 📊 Status & Message */}
      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            message.startsWith("✅")
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
              : "bg-rose-950/40 border-rose-500/30 text-rose-300"
          }`}
        >
          {message.startsWith("✅") ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {message}
        </div>
      )}
    </section>
  );
}