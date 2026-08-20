"use client";

import { useRef, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

const BATCH_SIZE = 100;

export default function JsonImport() {
  const supabase = createClient();
  const fileInputRef = useRef(null);

  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    topicsCreated: 0,
    notesImported: 0,
    questionsImported: 0,
    skippedDuplicates: 0,
    failed: 0,
  });

  function normalizeQuestion(q, targetTopicId) {
    if (!q || typeof q !== "object") throw new Error("Invalid question object");
    if (!q.question?.toString().trim()) throw new Error("Question text missing");

    const answer = String(q.answer || "A").toUpperCase().trim();
    if (!["A", "B", "C", "D"].includes(answer)) {
      throw new Error(`Invalid answer choice: ${answer}`);
    }

    return {
      topic_id: targetTopicId || (q.topic_id ? Number(q.topic_id) : null),
      question: String(q.question).trim(),
      option_a: String(q.option_a || "").trim(),
      option_b: String(q.option_b || "").trim(),
      option_c: String(q.option_c || "").trim(),
      option_d: String(q.option_d || "").trim(),
      answer,
      explanation: q.explanation ? String(q.explanation).trim() : "",
      type: ["mcq", "true_false", "multiple"].includes(q.type) ? q.type : "mcq",
      year: q.year ? Number(q.year) : null,
      difficulty: ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : "medium",
      source: q.source ? String(q.source).trim() : (q.is_pyq ? "PYQ" : null),
      is_pyq: Boolean(q.is_pyq),
      tags: Array.isArray(q.tags) ? q.tags.map(String) : [],
      is_active: true,
    };
  }

  async function processMasterTopic(data) {
    let tCreated = 0;
    let nImported = 0;
    let qImported = 0;
    let dupCount = 0;
    let failCount = 0;

    let subjectId = data.subject_id;
    if (!subjectId && data.subject_name) {
      const { data: existingSub } = await supabase
        .from("subjects")
        .select("id")
        .ilike("name", data.subject_name.trim())
        .maybeSingle();

      if (existingSub) {
        subjectId = existingSub.id;
      } else {
        const { data: newSub, error: subErr } = await supabase
          .from("subjects")
          .insert({ name: data.subject_name.trim(), is_active: true })
          .select("id")
          .single();
        if (subErr) throw new Error("Subject Error: " + subErr.message);
        subjectId = newSub.id;
      }
    }

    let chapterId = data.chapter_id;
    if (!chapterId && data.chapter_name && subjectId) {
      const { data: existingChap } = await supabase
        .from("chapters")
        .select("id")
        .eq("subject_id", subjectId)
        .ilike("name", data.chapter_name.trim())
        .maybeSingle();

      if (existingChap) {
        chapterId = existingChap.id;
      } else {
        const { data: newChap, error: chapErr } = await supabase
          .from("chapters")
          .insert({
            subject_id: subjectId,
            name: data.chapter_name.trim(),
            description: data.chapter_description || null,
            is_active: true,
          })
          .select("id")
          .single();
        if (chapErr) throw new Error("Chapter Error: " + chapErr.message);
        chapterId = newChap.id;
      }
    }

    let targetTopicId = data.topic_id;
    if (!targetTopicId && data.topic_name) {
      let query = supabase.from("topics").select("id").ilike("name", data.topic_name.trim());
      if (chapterId) query = query.eq("chapter_id", chapterId);
      const { data: existingTopic } = await query.maybeSingle();

      if (existingTopic) {
        targetTopicId = existingTopic.id;
      } else if (chapterId) {
        const { data: newTopic, error: topErr } = await supabase
          .from("topics")
          .insert({
            chapter_id: chapterId,
            name: data.topic_name.trim(),
            description: data.topic_description || null,
            is_active: true,
          })
          .select("id")
          .single();
        if (topErr) throw new Error("Topic Error: " + topErr.message);
        targetTopicId = newTopic.id;
        tCreated++;
      }
    }

    if (!targetTopicId) {
      const { data: fallbackTopic } = await supabase.from("topics").select("id").limit(1).single();
      targetTopicId = fallbackTopic?.id;
    }

    if (!targetTopicId) {
      throw new Error("कोई मान्य Topic नहीं मिला। कृपया पहले एक टॉपिक बनाएँ।");
    }

    if (Array.isArray(data.notes) && data.notes.length > 0) {
      const { data: existingNotes } = await supabase
        .from("notes")
        .select("title")
        .eq("topic_id", targetTopicId);

      const existingTitles = new Set((existingNotes || []).map((n) => n.title.trim().toLowerCase()));

      const notesToInsert = [];
      for (const n of data.notes) {
        if (!n.title || !n.content) continue;
        if (existingTitles.has(n.title.trim().toLowerCase())) {
          dupCount++;
          continue;
        }
        notesToInsert.push({
          topic_id: targetTopicId,
          title: String(n.title).trim(),
          content: String(n.content).trim(),
          note_type: ["study", "short", "revision"].includes(n.note_type) ? n.note_type : "study",
          sort_order: n.sort_order || 0,
          is_published: true,
        });
      }

      if (notesToInsert.length > 0) {
        const { error: noteErr } = await supabase.from("notes").insert(notesToInsert);
        if (noteErr) {
          setMessage("Notes Insert Error: " + noteErr.message);
          failCount += notesToInsert.length;
        } else {
          nImported += notesToInsert.length;
        }
      }
    }

    const rawQuestions = [
      ...(Array.isArray(data.questions) ? data.questions : []),
      ...(Array.isArray(data.mcqs) ? data.mcqs.map((q) => ({ ...q, is_pyq: false })) : []),
      ...(Array.isArray(data.pyqs) ? data.pyqs.map((q) => ({ ...q, is_pyq: true })) : []),
    ];

    if (rawQuestions.length > 0) {
      const { data: existingQs } = await supabase
        .from("questions")
        .select("question")
        .eq("topic_id", targetTopicId);

      const existingTextSet = new Set((existingQs || []).map((q) => q.question.trim().toLowerCase()));

      const validQuestions = [];
      for (const q of rawQuestions) {
        try {
          const formatted = normalizeQuestion(q, targetTopicId);
          if (existingTextSet.has(formatted.question.toLowerCase())) {
            dupCount++;
            continue;
          }
          validQuestions.push(formatted);
        } catch (e) {
          failCount++;
        }
      }

      for (let i = 0; i < validQuestions.length; i += BATCH_SIZE) {
        const batch = validQuestions.slice(i, i + BATCH_SIZE);
        const { error: qErr } = await supabase.from("questions").insert(batch);
        if (qErr) {
          setMessage("Questions Batch Error: " + qErr.message);
          failCount += batch.length;
        } else {
          qImported += batch.length;
        }
        setProgress(Math.round(((i + batch.length) / validQuestions.length) * 100));
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    setStats({
      topicsCreated: tCreated,
      notesImported: nImported,
      questionsImported: qImported,
      skippedDuplicates: dupCount,
      failed: failCount,
    });

    if (failCount === 0) {
      setMessage("✅ सारा डेटा सफलतापूर्वक डेटाबेस में सिंक हो गया!");
    }
  }

  async function processQuestionsArray(data) {
    let qImported = 0;
    let failCount = 0;
    let dupCount = 0;
    const validQuestions = [];

    let defaultTopicId = null;
    const { data: firstTopic } = await supabase.from("topics").select("id").limit(1).single();
    defaultTopicId = firstTopic?.id;

    for (let i = 0; i < data.length; i++) {
      try {
        const targetId = data[i].topic_id ? Number(data[i].topic_id) : defaultTopicId;
        validQuestions.push(normalizeQuestion(data[i], targetId));
      } catch (e) {
        failCount++;
      }
    }

    for (let i = 0; i < validQuestions.length; i += BATCH_SIZE) {
      const batch = validQuestions.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from("questions").insert(batch);
      if (error) {
        setMessage("Array Batch Error: " + error.message);
        failCount += batch.length;
      } else {
        qImported += batch.length;
      }
      setProgress(Math.round(((i + batch.length) / validQuestions.length) * 100));
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    setStats({
      topicsCreated: 0,
      notesImported: 0,
      questionsImported: qImported,
      skippedDuplicates: dupCount,
      failed: failCount,
    });

    if (failCount === 0) {
      setMessage(`✅ ${qImported} प्रश्न सफलतापूर्वक इम्पोर्ट हो गए!`);
    }
  }

  async function runImport(parsedJson) {
    setLoading(true);
    setMessage("");
    setProgress(0);
    setStats({ topicsCreated: 0, notesImported: 0, questionsImported: 0, skippedDuplicates: 0, failed: 0 });

    try {
      if (Array.isArray(parsedJson)) {
        await processQuestionsArray(parsedJson);
      } else if (typeof parsedJson === "object" && parsedJson !== null) {
        await processMasterTopic(parsedJson);
      } else {
        throw new Error("JSON structure अमान्य है। रूट Array या Object होना चाहिए।");
      }
      setJsonText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Import error:", err);
      setMessage(`❌ Import Error: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  function handlePasteImport() {
    if (!jsonText.trim()) {
      setMessage("❌ पहले JSON टेक्स्ट पेस्ट करें।");
      return;
    }
    try {
      const parsed = JSON.parse(jsonText);
      runImport(parsed);
    } catch (e) {
      setMessage("❌ JSON Syntax गलत है। कृपया कोट्स और ब्रैकेट्स चेक करें।");
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".json")) {
      setMessage("❌ केवल .json फ़ाइल ही अपलोड करें।");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result);
        runImport(parsed);
      } catch (err) {
        setMessage("❌ फ़ाइल में मौजूद JSON डेटा मान्य नहीं है।");
      }
    };
    reader.onerror = () => setMessage("❌ फ़ाइल पढ़ने में समस्या हुई।");
    reader.readAsText(file);
  }

  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-4 text-slate-100 shadow-2xl backdrop-blur-xl">
      <div className="space-y-1">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <span>📦</span> JSON Question & Notes Import
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          एक ही JSON फ़ाइल से पूरे टॉपिक के थ्योरी नोट्स, 50 MCQs और 100 PYQs बिना डुप्लीकेट के डेटाबेस में सिंक करें।
        </p>
      </div>

      <div className="pt-1">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileUpload}
          disabled={loading}
          className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
        />
      </div>

      <p className="text-xs text-slate-400 font-semibold pt-1">
        या JSON नीचे पेस्ट करें:
      </p>

      <textarea
        rows={10}
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        disabled={loading}
        placeholder="यहाँ पूरा valid JSON पेस्ट करें..."
        className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-3.5 text-xs text-indigo-200 font-mono focus:border-indigo-500 outline-none leading-relaxed resize-y"
      />

      <button
        type="button"
        onClick={handlePasteImport}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition cursor-pointer"
      >
        {loading ? `डेटा सिंक हो रहा है... (${progress}%)` : "Upload JSON"}
      </button>

      {loading && (
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Import Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {(stats.questionsImported > 0 || stats.notesImported > 0 || stats.skippedDuplicates > 0 || stats.failed > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-center">
            <span className="text-[10px] text-slate-400 font-bold block">Notes</span>
            <span className="text-sm font-black text-indigo-300">+{stats.notesImported}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-center">
            <span className="text-[10px] text-slate-400 font-bold block">Questions</span>
            <span className="text-sm font-black text-emerald-300">+{stats.questionsImported}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/30 text-center">
            <span className="text-[10px] text-slate-400 font-bold block">Duplicates</span>
            <span className="text-sm font-black text-amber-300">{stats.skippedDuplicates} Skipped</span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-center">
            <span className="text-[10px] text-slate-400 font-bold block">Failed</span>
            <span className="text-sm font-black text-rose-300">{stats.failed}</span>
          </div>
        </div>
      )}

      {message && (
        <div className="p-3.5 rounded-xl bg-[#020617] border border-slate-800 text-xs font-semibold text-slate-200">
          {message}
        </div>
      )}
    </section>
  );
}