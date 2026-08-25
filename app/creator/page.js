"use client";

import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Video, FileText, Sparkles, ChevronDown, CheckCircle2 } from "lucide-react";

const QUESTION_BANK = [
  {
    topic: "राजस्थान के प्रतीक चिन्ह",
    exam: "CET / REET 2026 Special",
    question: "राजस्थान का राज्य वृक्ष 'खेजड़ी' को किस वर्ष राज्य वृक्ष घोषित किया गया था?",
    options: ["(A) 1981", "(B) 1983", "(C) 1985", "(D) 1989"],
    correctIndex: 1,
    explanation: "खेजड़ी (Prosopis cineraria) को 31 अक्टूबर 1983 को राज्य वृक्ष घोषित किया गया था।",
    points: [
      { title: "राज्य वृक्ष (खेजड़ी)", desc: "31 अक्टूबर 1983 को घोषित। वैज्ञानिक नाम Prosopis cineraria है। थार का कल्पवृक्ष व जांटी कहलाता है।" },
      { title: "राज्य पुष्प (रोहिड़ा)", desc: "31 अक्टूबर 1983 को घोषित। वैज्ञानिक नाम Tecomella undulata है। मारवाड़ टीक कहलाता है।" },
      { title: "राज्य पशु (चिंकारा व ऊंट)", desc: "चिंकारा (वन्यजीव) 1981 में, ऊंट (पशुधन) 30 जून 2014 को राज्य पशु घोषित हुआ।" }
    ]
  },
  {
    topic: "राजस्थान के प्रमुख लोक देवता",
    exam: "CET / REET 2026 Special",
    question: "पाबूजी की फड़ का वाचन करते समय किस वाद्ययंत्र का प्रयोग मुख्य रूप से किया जाता है?",
    options: ["(A) जंतर", "(B) रावणहत्था", "(C) सारंगी", "(D) कमायचा"],
    correctIndex: 1,
    explanation: "पाबूजी की फड़ का वाचन नायक/भील भोपों द्वारा रावणहत्था वाद्ययंत्र से किया जाता है।",
    points: [
      { title: "पाबूजी (ऊंटों के देवता)", desc: "मारवाड़ में सर्वप्रथम ऊंट लाने का श्रेय। मुख्य मंदिर: कोलू मण्ड (फलौदी)। फड़ वाचन में रावणहत्था प्रयोग।" },
      { title: "गोगाजी (साँपों के देवता)", desc: "थान खेजड़ी वृक्ष के नीचे। शीर्षमेड़ी ददरेवा (चूरू) तथा धुरमेड़ी गोगामेड़ी (हनुमानगढ़) में है।" },
      { title: "देवनारायण जी (गुर्जर समाज)", desc: "फड़ वाचन में 'जंतर' वाद्ययंत्र का प्रयोग। इनकी फड़ सबसे लंबी और प्राचीन है।" }
    ]
  },
  {
    topic: "राजस्थान का नया भूगोल (संभाग व जिले)",
    exam: "CET / REET 2026 Special",
    question: "राजस्थान का नवगठित 'डीडवाना-कुचामन' जिला किस संभाग के अंतर्गत आता है?",
    options: ["(A) जयपुर", "(B) अजमेर", "(C) बीकानेर", "(D) जोधपुर"],
    correctIndex: 1,
    explanation: "डीडवाना-कुचामन जिला अजमेर संभाग के अंतर्गत आता है।",
    points: [
      { title: "अजमेर संभाग", desc: "वर्तमान में 7 जिले: अजमेर, ब्यावर, केकड़ी, टोंक, नागौर, डीडवाना-कुचामन, शाहपुरा।" },
      { title: "नवीनतम 3 संभाग", desc: "बांसवाड़ा, पाली और सीकर नवीन संभाग बनाए गए हैं।" },
      { title: "खारे पानी की झीलें", desc: "डीडवाना व कुचामन झीलें अब नवगठित डीडवाना-कुचामन जिले में स्थित हैं।" }
    ]
  }
];

export default function CreatorStudio() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("reel");
  const [isProcessing, setIsProcessing] = useState(false);
  const pdfTemplateRef = useRef(null);

  const currentItem = QUESTION_BANK[selectedIdx];

  // 1. Native High-Res Reel Canvas Drawing
  const generateReelImage = (withAnswer = false) => {
    setIsProcessing(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");

      // BG
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
      bgGrad.addColorStop(0, "#090D16");
      bgGrad.addColorStop(0.5, "#0F172A");
      bgGrad.addColorStop(1, "#030712");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Top Badge
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

      // Question Card
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
        const words = text.split(" ");
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
        const y = startY + (idx * 160);
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
        ctx.fillText(opt, 140, y + 74);

        if (isCorrect) {
          ctx.textAlign = "right";
          ctx.fillText("✓ सही उत्तर", 940, y + 74);
        }
      });

      // Explanation (On Answer Frame)
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

      // Footer CTA
      ctx.textAlign = "center";
      ctx.font = "bold 36px system-ui, sans-serif";
      ctx.fillStyle = "#F59E0B";
      ctx.fillText("👉 पूरे 100 PYQ टेस्ट देने के लिए बायो लिंक खोलें! 🚀", 540, 1720);

      ctx.font = "500 28px system-ui, sans-serif";
      ctx.fillStyle = "#64748B";
      ctx.fillText("EduAI Pro • t.me/EduAI_RajasthanExam", 540, 1790);

      // Download
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `EduAI_${currentItem.topic}_${withAnswer ? "Ans" : "Q"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. High-Quality Hindi Unicode PDF Generator
  const generateHindiPDF = async () => {
    setIsProcessing(true);
    try {
      if (pdfTemplateRef.current) {
        const canvas = await html2canvas(pdfTemplateRef.current, {
          scale: 3,
          useCORS: true,
          backgroundColor: "#ffffff"
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`EduAI_${currentItem.topic.replace(/\s+/g, "_")}_Capsule.pdf`);
      }
    } catch (err) {
      alert("PDF Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-28 font-sans">
      <div className="max-w-md mx-auto space-y-5">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> EduAI Creator Studio
          </div>
          <h1 className="text-xl font-bold text-white">Reel & 1-Page PDF Generator</h1>
        </div>

        {/* Question Selector Dropdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
          <label className="text-xs font-semibold text-slate-400">अभ्यास प्रश्न व विषय चुनें:</label>
          <select
            value={selectedIdx}
            onChange={(e) => setSelectedIdx(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {QUESTION_BANK.map((q, idx) => (
              <option key={idx} value={idx}>
                {idx + 1}. {q.topic} - {q.question.substring(0, 38)}...
              </option>
            ))}
          </select>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("reel")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "reel" ? "bg-indigo-600 text-white" : "text-slate-400"
            }`}
          >
            <Video className="w-3.5 h-3.5" /> Reel Generator
          </button>
          <button
            onClick={() => setActiveTab("pdf")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "pdf" ? "bg-indigo-600 text-white" : "text-slate-400"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Revision PDF
          </button>
        </div>

        {/* TAB 1: REEL */}
        {activeTab === "reel" && (
          <div className="space-y-3">
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-300">
              <b>चयनित प्रश्न:</b> {currentItem.question}
            </div>
            <button
              onClick={() => generateReelImage(false)}
              disabled={isProcessing}
              className="w-full py-3 bg-rose-600 active:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2"
            >
              📥 1. सवाल इमेज डाउनलोड करें (HD)
            </button>
            <button
              onClick={() => generateReelImage(true)}
              disabled={isProcessing}
              className="w-full py-3 bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2"
            >
              📥 2. उत्तर इमेज डाउनलोड करें (HD)
            </button>
          </div>
        )}

        {/* TAB 2: PDF */}
        {activeTab === "pdf" && (
          <div className="space-y-3">
            <button
              onClick={generateHindiPDF}
              disabled={isProcessing}
              className="w-full py-3 bg-indigo-600 active:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2"
            >
              📥 इस टॉपिक की साफ़ 1-Page PDF डाउनलोड करें
            </button>

            {/* Hidden Perfect Hindi Template for Rendering */}
            <div
              ref={pdfTemplateRef}
              className="bg-white text-slate-900 rounded-xl p-6 border border-slate-300 shadow-md font-sans"
            >
              <div className="border-b-2 border-indigo-600 pb-3 mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-black text-indigo-950 uppercase tracking-tight">
                    🎯 EduAI Pro — 1-Page Revision Capsule
                  </h2>
                  <p className="text-xs font-bold text-indigo-600">
                    विषय: {currentItem.topic}
                  </p>
                </div>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded">
                  CET • REET 2026
                </span>
              </div>

              <div className="space-y-3">
                {currentItem.points.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-xs font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      {item.title}
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed pl-5">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-600">
                <div>🚀 <b>पूरा 100 PYQ टेस्ट दें:</b> education-platform-fawn-six.vercel.app/quiz</div>
                <div className="font-semibold text-indigo-700">@EduAI_RajasthanExam</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
