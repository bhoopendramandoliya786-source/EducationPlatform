"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { Sparkles, PlusCircle, ArrowLeft } from "lucide-react";

const DEFAULT_BANK = [
  {
    topic: "राजस्थान के प्रतीक चिन्ह",
    exam: "CET / REET 2026 Special",
    question: "राजस्थान का राज्य वृक्ष 'खेजड़ी' को किस वर्ष राज्य वृक्ष घोषित किया गया था?",
    options: ["(A) 1981", "(B) 1983", "(C) 1985", "(D) 1989"],
    correctIndex: 1,
    explanation: "खेजड़ी (Prosopis cineraria) को 31 अक्टूबर 1983 को राज्य वृक्ष घोषित किया गया था।"
  },
  {
    topic: "राजस्थान के प्रमुख लोक देवता",
    exam: "CET / REET 2026 Special",
    question: "पाबूजी की फड़ का वाचन करते समय किस वाद्ययंत्र का प्रयोग मुख्य रूप से किया जाता है?",
    options: ["(A) जंतर", "(B) रावणहत्था", "(C) सारंगी", "(D) कमायचा"],
    correctIndex: 1,
    explanation: "पाबूजी की फड़ का वाचन नायक/भील भोपों द्वारा रावणहत्था वाद्ययंत्र से किया जाता है।"
  },
  {
    topic: "राजस्थान का नया भूगोल",
    exam: "CET / REET 2026 Special",
    question: "राजस्थान का नवगठित 'डीडवाना-कुचामन' जिला किस संभाग के अंतर्गत आता है?",
    options: ["(A) जयपुर", "(B) अजमेर", "(C) बीकानेर", "(D) जोधपुर"],
    correctIndex: 1,
    explanation: "डीडवाना-कुचामन जिला अजमेर संभाग के अंतर्गत आता है।"
  },
  {
    topic: "1857 की क्रांति (राजस्थान)",
    exam: "CET / REET 2026 Special",
    question: "1857 की क्रांति के समय राजस्थान में छावनियों की कुल संख्या कितनी थी?",
    options: ["(A) 4", "(B) 6", "(C) 8", "(D) 10"],
    correctIndex: 1,
    explanation: "राजस्थान में 6 सैनिक छावनियां थीं: नसीराबाद, नीमच, देवली, ब्यावर, एरिनपुरा और खेरवाड़ा।"
  },
  {
    topic: "राजस्थान के प्रमुख दुर्ग",
    exam: "CET / REET 2026 Special",
    question: "यूनेस्को की विश्व धरोहर सूची में राजस्थान के कितने पहाड़ी दुर्ग शामिल हैं?",
    options: ["(A) 4", "(B) 6", "(C) 7", "(D) 8"],
    correctIndex: 1,
    explanation: "2013 में 6 दुर्ग (चीकू गाजर आम: चित्तौड़गढ़, कुंभलगढ़, गागरोन, जैसलमेर, रणथंभौर, आमेर) शामिल किए गए।"
  },
  {
    topic: "राजस्थान की नदियाँ",
    exam: "CET / REET 2026 Special",
    question: "राजस्थान में पूर्णतः बहने वाली सबसे लंबी नदी कौन सी है?",
    options: ["(A) चंबल", "(B) बनास", "(C) माही", "(D) लूनी"],
    correctIndex: 1,
    explanation: "पूर्णतः राजस्थान में बहने वाली सबसे लंबी नदी बनास (480 किमी) है। इसे 'वन की आशा' कहते हैं।"
  }
];

export default function CreatorStudio() {
  const [bank, setBank] = useState(DEFAULT_BANK);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  const [customTopic, setCustomTopic] = useState("राजस्थान GK स्पेशल");
  const [customQ, setCustomQ] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctOpt, setCorrectOpt] = useState(0);
  const [customExp, setCustomExp] = useState("");

  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    async function loadDbQuestions() {
      try {
        const { data } = await supabase
          .from("questions")
          .select("question, option_a, option_b, option_c, option_d, answer, explanation")
          .limit(40);

        if (isMounted && data && data.length > 0) {
          const dbMapped = data.map((q) => {
            const options = [
              `(A) ${q.option_a || ""}`,
              `(B) ${q.option_b || ""}`,
              `(C) ${q.option_c || ""}`,
              `(D) ${q.option_d || ""}`
            ];
            const answerMap = { A: 0, B: 1, C: 2, D: 3 };
            const correctIndex = answerMap[q.answer] ?? 0;

            return {
              topic: "राजस्थान GK स्पेशल",
              exam: "CET / REET 2026 Special",
              question: q.question,
              options,
              correctIndex,
              explanation: q.explanation || "विस्तृत व्याख्या व मॉक टेस्ट पोर्टल पर उपलब्ध है।"
            };
          });
          setBank([...DEFAULT_BANK, ...dbMapped]);
        }
      } catch (err) {
        console.log("Using default bank questions");
      }
    }
    loadDbQuestions();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const currentItem = isCustom
    ? {
        topic: customTopic || "राजस्थान GK स्पेशल",
        exam: "CET / REET 2026 Special",
        question: customQ || "यहाँ आपका प्रश्न दिखेगा?",
        options: [optA || "(A) विकल्प A", optB || "(B) विकल्प B", optC || "(C) विकल्प C", optD || "(D) विकल्प D"],
        correctIndex: correctOpt,
        explanation: customExp || "सही उत्तर की व्याख्या यहाँ दिखाई देगी।"
      }
    : bank[selectedIdx] || bank[0];

  const generateReelImage = (withAnswer = false) => {
    setIsProcessing(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");

      // BG Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
      bgGrad.addColorStop(0, "#090D16");
      bgGrad.addColorStop(0.5, "#0F172A");
      bgGrad.addColorStop(1, "#030712");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Top Alert Badge
      ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
      ctx.beginPath();
      ctx.roundRect(140, 120, 800, 80, 40);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#F59E0B";
      ctx.stroke();

      ctx.font = "bold 38px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#FDE68A";
      ctx.textAlign = "center";
      ctx.fillText("⚠️ 90% छात्र यहाँ गलती करते हैं!", 540, 175);

      ctx.font = "600 28px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#94A3B8";
      ctx.fillText(`${currentItem.topic} • ${currentItem.exam}`, 540, 260);

      // Question Box
      ctx.fillStyle = "#1E293B";
      ctx.beginPath();
      ctx.roundRect(80, 340, 920, 340, 32);
      ctx.fill();
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = "bold 42px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";

      const wrapText = (text, x, y, maxWidth, lineHeight) => {
        const words = String(text || "").split(" ");
        let line = "";
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + " ";
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, y);
      };
      wrapText(currentItem.question, 540, 460, 820, 58);

      // Options
      const startY = 730;
      currentItem.options.forEach((opt, idx) => {
        const y = startY + idx * 160;
        const isCorrect = withAnswer && idx === currentItem.correctIndex;

        ctx.fillStyle = isCorrect ? "rgba(16, 185, 129, 0.2)" : "#1E293B";
        ctx.beginPath();
        ctx.roundRect(80, y, 920, 120, 24);
        ctx.fill();
        ctx.strokeStyle = isCorrect ? "#10B981" : "#334155";
        ctx.lineWidth = isCorrect ? 5 : 2;
        ctx.stroke();

        ctx.font = isCorrect ? "bold 40px system-ui, sans-serif" : "600 38px system-ui, sans-serif";
        ctx.fillStyle = isCorrect ? "#6EE7B7" : "#F1F5F9";
        ctx.textAlign = "left";
        ctx.fillText(String(opt || ""), 140, y + 74);

        if (isCorrect) {
          ctx.textAlign = "right";
          ctx.fillText("✓ सही उत्तर", 940, y + 74);
        }
      });

      // Explanation (Answer Frame Only)
      if (withAnswer) {
        ctx.fillStyle = "rgba(99, 102, 241, 0.15)";
        ctx.beginPath();
        ctx.roundRect(80, 1400, 920, 180, 24);
        ctx.fill();
        ctx.strokeStyle = "#6366F1";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = "bold 32px system-ui, sans-serif";
        ctx.fillStyle = "#A5B4FC";
        ctx.textAlign = "left";
        ctx.fillText("💡 व्याख्या:", 120, 1460);
        ctx.font = "normal 30px system-ui, sans-serif";
        ctx.fillStyle = "#E2E8F0";
        wrapText(currentItem.explanation, 120, 1515, 840, 42);
      }

      // Bottom CTA
      ctx.textAlign = "center";
      ctx.font = "bold 36px system-ui, sans-serif";
      ctx.fillStyle = "#F59E0B";
      ctx.fillText("👉 पूरे 100 PYQ टेस्ट देने के लिए बायो लिंक खोलें! 🚀", 540, 1720);

      ctx.font = "500 28px system-ui, sans-serif";
      ctx.fillStyle = "#64748B";
      ctx.fillText("EduAI Pro • t.me/EduAI_RajasthanExam", 540, 1790);

      // Instant Download
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `EduAI_${currentItem.topic.replace(/\s+/g, "_")}_${withAnswer ? "Ans" : "Q"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 pb-28 pt-2 space-y-4 font-sans select-none">

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link 
          href="/" 
          aria-label="होमपेज पर वापस जाएँ"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> वापस होम
        </Link>
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Reel Creator Studio
        </span>
      </div>

      {/* Header Banner */}
      <section aria-label="क्रिएटर स्टूडियो हेडर" className="text-center space-y-1">
        <h1 className="text-lg font-black text-white">Reel & Story Card Generator</h1>
        <p className="text-xs text-slate-400">1080x1920 HD क्विज़ रील्स कार्ड्स 1-क्लिक में बनाएँ</p>
      </section>

      {/* Switcher */}
      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setIsCustom(false)}
          aria-pressed={!isCustom}
          className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            !isCustom ? "bg-slate-800 text-indigo-400 shadow" : "text-slate-400"
          }`}
        >
          📚 बैंक से चुनें ({bank.length} प्रश्न)
        </button>
        <button
          type="button"
          onClick={() => setIsCustom(true)}
          aria-pressed={isCustom}
          className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            isCustom ? "bg-slate-800 text-indigo-400 shadow" : "text-slate-400"
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" /> नया सवाल लिखें
        </button>
      </div>

      {!isCustom ? (
        <section aria-label="उपलब्ध प्रश्न सूची" className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-1.5">
          <label htmlFor="select-question" className="text-xs font-semibold text-slate-400 block">
            उपलब्ध टॉपिक व प्रश्न:
          </label>
          <select
            id="select-question"
            value={selectedIdx}
            onChange={(e) => setSelectedIdx(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-medium outline-none"
          >
            {bank.map((q, idx) => (
              <option key={idx} value={idx}>
                {idx + 1}. [{q.topic}] {q.question.substring(0, 36)}...
              </option>
            ))}
          </select>
        </section>
      ) : (
        <section aria-label="कस्टम प्रश्न फॉर्म" className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2 text-xs">
          <div>
            <label htmlFor="custom-topic" className="text-slate-400 font-medium block">विषय का नाम:</label>
            <input
              id="custom-topic"
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="उदा. राजस्थान के लोक नृत्य"
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none"
            />
          </div>
          <div>
            <label htmlFor="custom-question" className="text-slate-400 font-medium block">प्रश्न लिखें:</label>
            <textarea
              id="custom-question"
              value={customQ}
              onChange={(e) => setCustomQ(e.target.value)}
              placeholder="यहाँ अपना सवाल टाइप करें..."
              rows={2}
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={optA}
              onChange={(e) => setOptA(e.target.value)}
              placeholder="(A) पहला विकल्प"
              aria-label="विकल्प A"
              className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none"
            />
            <input
              type="text"
              value={optB}
              onChange={(e) => setOptB(e.target.value)}
              placeholder="(B) दूसरा विकल्प"
              aria-label="विकल्प B"
              className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none"
            />
            <input
              type="text"
              value={optC}
              onChange={(e) => setOptC(e.target.value)}
              placeholder="(C) तीसरा विकल्प"
              aria-label="विकल्प C"
              className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none"
            />
            <input
              type="text"
              value={optD}
              onChange={(e) => setOptD(e.target.value)}
              placeholder="(D) चौथा विकल्प"
              aria-label="विकल्प D"
              className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="correct-option-select" className="text-slate-400">सही उत्तर:</label>
            <select
              id="correct-option-select"
              value={correctOpt}
              onChange={(e) => setCorrectOpt(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white"
            >
              <option value={0}>Option A</option>
              <option value={1}>Option B</option>
              <option value={2}>Option C</option>
              <option value={3}>Option D</option>
            </select>
          </div>
          <div>
            <label htmlFor="custom-explanation" className="text-slate-400 font-medium block">व्याख्या:</label>
            <input
              id="custom-explanation"
              type="text"
              value={customExp}
              onChange={(e) => setCustomExp(e.target.value)}
              placeholder="सही उत्तर की 1 लाइन व्याख्या"
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none"
            />
          </div>
        </section>
      )}

      {/* Action Buttons */}
      <section aria-label="इमेज जेनरेशन एक्शन" className="space-y-3 pt-2">
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300">
          <span className="text-indigo-400 font-bold">🎯 {currentItem.topic}:</span> {currentItem.question}
        </div>
        <button
          type="button"
          onClick={() => generateReelImage(false)}
          disabled={isProcessing}
          className="w-full py-3.5 bg-rose-600 active:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 disabled:opacity-50"
        >
          📥 1. सवाल इमेज डाउनलोड करें (HD Reel Frame)
        </button>
        <button
          type="button"
          onClick={() => generateReelImage(true)}
          disabled={isProcessing}
          className="w-full py-3.5 bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 disabled:opacity-50"
        >
          📥 2. उत्तर इमेज डाउनलोड करें (HD Reel Frame)
        </button>
      </section>

    </main>
  );
}