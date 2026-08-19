"use client";

import { useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";

const BATCH_SIZE = 500;

export default function JsonImport() {
  const fileInputRef = useRef(null);

  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [imported, setImported] = useState(0);
  const [failed, setFailed] = useState(0);

  function normalizeQuestion(q) {
    if (!q || typeof q !== "object") {
      throw new Error("Invalid question object");
    }

    if (!q.question?.toString().trim()) {
      throw new Error("Question text missing");
    }

    if (
      q.topic_id !== null &&
      q.topic_id !== undefined &&
      q.topic_id !== "" &&
      !Number.isFinite(Number(q.topic_id))
    ) {
      throw new Error(
        `Invalid topic_id: ${q.topic_id}`
      );
    }

    const answer = String(
      q.answer || "A"
    ).toUpperCase();

    if (!["A", "B", "C", "D"].includes(answer)) {
      throw new Error(
        `Invalid answer: ${answer}`
      );
    }

    return {
      topic_id:
        q.topic_id !== null &&
        q.topic_id !== undefined &&
        q.topic_id !== ""
          ? Number(q.topic_id)
          : null,

      question: String(q.question).trim(),

      option_a: String(q.option_a || "").trim(),
      option_b: String(q.option_b || "").trim(),
      option_c: String(q.option_c || "").trim(),
      option_d: String(q.option_d || "").trim(),

      answer,

      explanation:
        q.explanation !== undefined &&
        q.explanation !== null
          ? String(q.explanation)
          : "",

      type: ["mcq", "true_false", "multiple"].includes(
        q.type
      )
        ? q.type
        : "mcq",

      year:
        q.year !== null &&
        q.year !== undefined &&
        q.year !== ""
          ? Number(q.year)
          : null,

      difficulty: [
        "easy",
        "medium",
        "hard",
      ].includes(q.difficulty)
        ? q.difficulty
        : "medium",

      source:
        q.source !== undefined &&
        q.source !== null
          ? String(q.source)
          : "",

      is_pyq: Boolean(q.is_pyq),

      tags: Array.isArray(q.tags)
        ? q.tags.map(String)
        : [],
    };
  }

  async function importQuestions(data) {
    setMessage("");
    setImported(0);
    setFailed(0);
    setProgress(0);

    if (!Array.isArray(data)) {
      setMessage(
        "❌ JSON का root एक Array होना चाहिए।"
      );
      return;
    }

    if (data.length === 0) {
      setMessage(
        "❌ JSON में कोई question नहीं है।"
      );
      return;
    }

    setLoading(true);

    let successCount = 0;
    let failedCount = 0;

    try {
      const formatted = [];

      /*
       * पहले पूरा JSON validate/normalize करेंगे।
       * इससे बीच import में गलत structure मिलने की
       * संभावना कम होगी।
       */
      for (let i = 0; i < data.length; i++) {
        try {
          formatted.push(
            normalizeQuestion(data[i])
          );
        } catch (error) {
          failedCount++;

          console.error(
            `Question ${i + 1} error:`,
            error
          );
        }
      }

      if (formatted.length === 0) {
        throw new Error(
          "कोई valid question नहीं मिला।"
        );
      }

      setFailed(failedCount);

      const totalBatches = Math.ceil(
        formatted.length / BATCH_SIZE
      );

      /*
       * Large import को छोटे batches में insert करते हैं।
       * इससे एक बहुत बड़ा request भेजने से बचते हैं।
       */
      for (
        let i = 0;
        i < formatted.length;
        i += BATCH_SIZE
      ) {
        const batch = formatted.slice(
          i,
          i + BATCH_SIZE
        );

        const { error } = await supabase
          .from("questions")
          .insert(batch);

        if (error) {
          console.error(
            "Batch insert error:",
            error
          );

          /*
           * पूरा import silently fail नहीं होगा।
           * User को पता चलेगा कि कौन सा batch समस्या वाला था।
           */
          failedCount += batch.length;
        } else {
          successCount += batch.length;
        }

        const completedBatches =
          Math.floor(i / BATCH_SIZE) + 1;

        const percent = Math.min(
          100,
          Math.round(
            (completedBatches / totalBatches) *
              100
          )
        );

        setImported(successCount);
        setFailed(failedCount);
        setProgress(percent);

        /*
         * Browser को बड़े imports में UI update
         * करने का मौका।
         */
        await new Promise((resolve) =>
          setTimeout(resolve, 0)
        );
      }

      if (failedCount === 0) {
        setMessage(
          `✅ ${successCount.toLocaleString()} Questions successfully imported`
        );
      } else {
        setMessage(
          `⚠️ Import complete: ${successCount.toLocaleString()} successful, ${failedCount.toLocaleString()} failed`
        );
      }

      setJsonText("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("JSON import error:", error);

      setMessage(
        "❌ Import Error: " +
          (error?.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  }

  function handleJsonTextImport() {
    if (!jsonText.trim()) {
      setMessage(
        "❌ पहले JSON paste करें।"
      );
      return;
    }

    try {
      const data = JSON.parse(jsonText);

      importQuestions(data);
    } catch (error) {
      setMessage(
        "❌ JSON format गलत है।"
      );
    }
  }

  function handleFile(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".json")) {
      setMessage(
        "❌ केवल .json file upload करें।"
      );
      return;
    }

    setMessage("");
    setProgress(0);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text =
          event.target?.result;

        const data = JSON.parse(text);

        importQuestions(data);
      } catch (error) {
        console.error(error);

        setMessage(
          "❌ JSON file valid नहीं है।"
        );
      }
    };

    reader.onerror = () => {
      setMessage(
        "❌ File पढ़ने में समस्या हुई।"
      );
    };

    reader.readAsText(file);
  }

  return (
    <section
      style={{
        background: "#111827",
        color: "#fff",
        padding: "20px",
        borderRadius: "16px",
        marginTop: "20px",
      }}
    >
      <h2>
        📦 JSON Question Import
      </h2>

      <p
        style={{
          color: "#94a3b8",
          fontSize: "13px",
          lineHeight: "1.6",
        }}
      >
        Bulk MCQ/PYQ questions को JSON से
        questions table में import करें।
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFile}
        disabled={loading}
        style={{
          width: "100%",
          marginTop: "10px",
        }}
      />

      <p
        style={{
          color: "#94a3b8",
          marginTop: "18px",
        }}
      >
        या JSON नीचे paste करें
      </p>

      <textarea
        rows={12}
        value={jsonText}
        onChange={(e) =>
          setJsonText(e.target.value)
        }
        disabled={loading}
        placeholder={`[
  {
    "topic_id": 1,
    "question": "भारत की राजधानी क्या है?",
    "option_a": "जयपुर",
    "option_b": "नई दिल्ली",
    "option_c": "मुंबई",
    "option_d": "भोपाल",
    "answer": "B",
    "explanation": "भारत की राजधानी नई दिल्ली है।",
    "type": "mcq",
    "difficulty": "easy",
    "year": 2025,
    "source": "PYQ",
    "is_pyq": true,
    "tags": ["India GK", "Polity"]
  }
]`}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "12px",
          marginTop: "5px",
          background: "#020617",
          color: "#fff",
          border: "1px solid #334155",
          borderRadius: "10px",
          fontFamily: "monospace",
          resize: "vertical",
        }}
      />

      <button
        type="button"
        onClick={handleJsonTextImport}
        disabled={loading}
        style={{
          marginTop: "12px",
          background: loading
            ? "#64748b"
            : "#3b82f6",
          color: "#fff",
          padding: "12px 20px",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: loading
            ? "not-allowed"
            : "pointer",
        }}
      >
        {loading
          ? "Uploading..."
          : "Upload JSON"}
      </button>

      {loading && (
        <div
          style={{
            marginTop: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              fontSize: "12px",
              color: "#cbd5e1",
              marginBottom: "7px",
            }}
          >
            <span>
              Import Progress
            </span>

            <span>
              {progress}%
            </span>
          </div>

          <div
            style={{
              width: "100%",
              height: "10px",
              background: "#1e293b",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#3b82f6",
                transition:
                  "width 0.2s ease",
              }}
            />
          </div>
        </div>
      )}

      {(imported > 0 || failed > 0) && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "15px",
          }}
        >
          <div
            style={{
              background: "#064e3b",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          >
            ✅ Imported:{" "}
            {imported.toLocaleString()}
          </div>

          {failed > 0 && (
            <div
              style={{
                background: "#7f1d1d",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            >
              ❌ Failed:{" "}
              {failed.toLocaleString()}
            </div>
          )}
        </div>
      )}

      {message && (
        <div
          role="status"
          style={{
            marginTop: "15px",
            padding: "10px",
            background: "#1e293b",
            borderRadius: "8px",
            color: "#e2e8f0",
            fontSize: "13px",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          marginTop: "18px",
          padding: "12px",
          background: "#020617",
          border: "1px solid #1e293b",
          borderRadius: "10px",
          color: "#94a3b8",
          fontSize: "12px",
          lineHeight: "1.6",
        }}
      >
        <b style={{ color: "#cbd5e1" }}>
          Import format:
        </b>
        <br />
        JSON root array होना चाहिए।
        <br />
        हर question में कम से कम
        <b style={{ color: "#fff" }}>
          {" "}
          question + options A/B/C/D + answer
        </b>{" "}
        होना चाहिए।
        <br />
        Large imports छोटे batches में process
        होंगे।
      </div>
    </section>
  );
}