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
    subjectsCreated: 0,
    chaptersCreated: 0,
    topicsCreated: 0,
    notesImported: 0,
    questionsImported: 0,
    skippedDuplicates: 0,
    failed: 0,
  });

  // Auto-link subject to all active exams
  async function autoMapSubjectToExams(subjectId) {
    if (!subjectId) return;
    try {
      const { data: exams } = await supabase.from("exams").select("id").eq("is_active", true);
      if (exams && exams.length > 0) {
        const mappings = exams.map((ex) => ({
          exam_id: ex.id,
          subject_id: subjectId,
        }));
        await supabase.from("exam_subjects").upsert(mappings, { onConflict: "exam_id,subject_id", ignoreDuplicates: true });
      }
    } catch (e) {
      console.error("Auto exam mapping error:", e);
    }
  }

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

  async function processHierarchyItem(item) {
    let sCreated = 0, cCreated = 0, tCreated = 0;
    let subjectId = item.subject_id;

    if (!subjectId && item.subject_name) {
      const slug = item.subject_slug || item.subject_name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
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
          .insert({ name: item.subject_name.trim(), slug: slug || undefined, is_active: true })
          .select("id")
          .single();
        if (!sErr && newSub) {
          subjectId = newSub.id;
          sCreated++;
        }
      }

      // Automatically map subject to all exams
      if (subjectId) {
        await autoMapSubjectToExams(subjectId);
      }
    }

    let chapterId = item.chapter_id;
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

    let topicId = item.topic_id;
    if (!topicId && item.topic_name && chapterId) {
      const { data: existingTop } = await supabase
        .from("topics")
        .select("id")
        .eq("chapter_id", chapterId)
        .ilike("name", item.topic_name.trim())
        .maybeSingle();

      if (existingTop) {
        topicId = existingTop.id;
      } else {
        const { data: newTop, error: tErr } = await supabase
          .from("topics")
          .insert({
            chapter_id: chapterId,
            name: item.topic_name.trim(),
            description: item.topic_description || null,
            is_active: true,
          })
          .select("id")
          .single();
        if (!tErr && newTop) {
          topicId = newTop.id;
          tCreated++;
        }
      }
    }

    return { subjectId, chapterId, topicId, sCreated, cCreated, tCreated };
  }

  async function processMasterTopic(data) {
    let nImported = 0, qImported = 0, dupCount = 0, failCount = 0;
    const { topicId, sCreated, cCreated, tCreated } = await processHierarchyItem(data);

    let targetTopicId = topicId;
    if (!targetTopicId) {
      const { data: fallbackTopic } = await supabase.from("topics").select("id").limit(1).single();
      targetTopicId = fallbackTopic?.id;
    }

    if (Array.isArray(data.notes) && data.notes.length > 0 && targetTopicId) {
      const { data: existingNotes } = await supabase
        .from("notes")
        .select("title")
        .eq("topic_id", targetTopicId);

      const existingTitles = new Set((existingNotes || []).map((n) => n.title?.trim().toLowerCase()));
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
        if (!noteErr) nImported += notesToInsert.length;
        else failCount += notesToInsert.length;
      }
    }

    const rawQuestions = [
      ...(Array.isArray(data.questions) ? data.questions : []),
      ...(Array.isArray(data.mcqs) ? data.mcqs.map((q) => ({ ...q, is_pyq: false })) : []),
      ...(Array.isArray(data.pyqs) ? data.pyqs.map((q) => ({ ...q, is_pyq: true })) : []),
    ];

    if (rawQuestions.length > 0 && targetTopicId) {
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

    return { sCreated, cCreated, tCreated, nImported, qImported, dupCount, failCount };
  }

  async function processBatchChapters(batchData) {
    const subjectName = batchData.subject_name;
    const chapters = batchData.chapters_batch || [];

    let totalS = 0, totalC = 0, totalT = 0, totalN = 0, totalQ = 0, totalDup = 0, totalFail = 0;

    for (let i = 0; i < chapters.length; i++) {
      const chap = chapters[i];
      const payload = {
        subject_name: subjectName,
        chapter_name: chap.chapter_name,
        chapter_description: chap.chapter_description,
        topic_name: chap.topic_name || chap.chapter_name,
        topic_description: chap.topic_description,
        notes: chap.notes || [],
        mcqs: chap.mcqs || [],
        pyqs: chap.pyqs || [],
        questions: chap.questions || [],
      };

      const res = await processMasterTopic(payload);
      totalS += res.sCreated;
      totalC += res.cCreated;
      totalT += res.tCreated;
      totalN += res.nImported;
      totalQ += res.qImported;
      totalDup += res.dupCount;
      totalFail += res.failCount;

      setProgress(Math.round(((i + 1) / chapters.length) * 100));
    }

    setStats({
      subjectsCreated: totalS,
      chaptersCreated: totalC,
      topicsCreated: totalT,
      notesImported: totalN,
      questionsImported: totalQ,
      skippedDuplicates: totalDup,
      failed: totalFail,
    });

    setMessage(`✅ ${chapters.length} अध्याय, ${totalN} नोट्स एवं ${totalQ} प्रश्न सिंक हो गए (सभी परीक्षाओं से ऑटो-मैप हो गए)!`);
  }

  async function processArrayInput(arr) {
    let sCreated = 0, cCreated = 0, tCreated = 0;
    let qImported = 0, failCount = 0, dupCount = 0;

    const isHierarchyList = arr.some((item) => item.subject_name || item.chapter_name);

    if (isHierarchyList) {
      for (let i = 0; i < arr.length; i++) {
        const res = await processHierarchyItem(arr[i]);
        sCreated += res.sCreated;
        cCreated += res.cCreated;
        tCreated += res.tCreated;
        setProgress(Math.round(((i + 1) / arr.length) * 100));
      }

      setStats({
        subjectsCreated: sCreated,
        chaptersCreated: cCreated,
        topicsCreated: tCreated,
        notesImported: 0,
        questionsImported: 0,
        skippedDuplicates: 0,
        failed: 0,
      });
      setMessage(`✅ ${sCreated} विषय, ${cCreated} अध्याय और ${tCreated} टॉपिक्स बन गए!`);
      return;
    }

    let defaultTopicId = null;
    const { data: firstTopic } = await supabase.from("topics").select("id").limit(1).single();
    defaultTopicId = firstTopic?.id;

    const validQuestions = [];
    for (const q of arr) {
      try {
        const targetId = q.topic_id ? Number(q.topic_id) : defaultTopicId;
        validQuestions.push(normalizeQuestion(q, targetId));
      } catch {
        failCount++;
      }
    }

    for (let i = 0; i < validQuestions.length; i += BATCH_SIZE) {
      const batch = validQuestions.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from("questions").insert(batch);
      if (!error) qImported += batch.length;
      else failCount += batch.length;
      setProgress(Math.round(((i + batch.length) / validQuestions.length) * 100));
    }

    setStats({
      subjectsCreated: 0,
      chaptersCreated: 0,
      topicsCreated: 0,
      notesImported: 0,
      questionsImported: qImported,
      skippedDuplicates: dupCount,
      failed: failCount,
    });
    setMessage(`✅ ${qImported} प्रश्न इम्पोर्ट हो गए!`);
  }

  async function runImport(parsedJson) {
    setLoading(true);
    setMessage("");
    setProgress(0);
    setStats({ subjectsCreated: 0, chaptersCreated: 0, topicsCreated: 0, notesImported: 0, questionsImported: 0, skippedDuplicates: 0, failed: 0 });

    try {
      if (Array.isArray(parsedJson)) {
        await processArrayInput(parsedJson);
      } else if (typeof parsedJson === "object" && parsedJson !== null) {
        if (Array.isArray(parsedJson.chapters_batch)) {
          await processBatchChapters(parsedJson);
        } else {
          const res = await processMasterTopic(parsedJson);
          setStats({
            subjectsCreated: res.sCreated,
            chaptersCreated: res.cCreated,
            topicsCreated: res.tCreated,
            notesImported: res.nImported,
            questionsImported: res.qImported,
            skippedDuplicates: res.dupCount,
            failed: res.failCount,
          });
          setMessage("✅ टॉपिक और सारा कंटेंट सिंक हो गया (ऑटो-मैप सहित)!");
        }
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
    <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-4 text-slate-100 shadow-2xl backdrop-blur-xl">
      <div className="space-y-1">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <span>📦</span> Universal JSON Importer
        </h2>
        <p className="text-xs text-slate-400">
          विषय (Subjects), अध्याय (Chapters), टॉपिक्स, नोट्स या 100+ MCQs/PYQs सीधे JSON से सिंक करें (Auto Exam Mapping Enabled)।
        </p>
      </div>

      <div className="pt-1">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
              try { runImport(JSON.parse(evt.target?.result)); }
              catch { setMessage("❌ JSON अमान्य है"); }
            };
            reader.readAsText(file);
          }}
          disabled={loading}
          className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white cursor-pointer"
        />
      </div>

      <textarea
        rows={8}
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        disabled={loading}
        placeholder="यहाँ JSON पेस्ट करें..."
        className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-3.5 text-xs text-indigo-200 font-mono focus:border-indigo-500 outline-none leading-relaxed"
      />

      <button
        type="button"
        onClick={() => {
          if (!jsonText.trim()) return setMessage("❌ पहले JSON पेस्ट करें");
          try { runImport(JSON.parse(jsonText)); }
          catch { setMessage("❌ JSON सिंटैक्स गलत है"); }
        }}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 disabled:opacity-40 text-white text-xs font-bold shadow-lg transition cursor-pointer"
      >
        {loading ? `सिंक हो रहा है... (${progress}%)` : "Upload JSON"}
      </button>

      {message && (
        <div className="p-3.5 rounded-xl bg-[#020617] border border-slate-800 text-xs font-semibold text-emerald-300">
          {message}
        </div>
      )}
    </section>
  );
}