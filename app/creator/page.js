"use client";

import React, { useState } from "react";
import jsPDF from "jspdf";
import { Video, FileText, CheckCircle2, Sparkles } from "lucide-react";

const SAMPLE_DATA = {
  topic: "राजस्थान के प्रतीक चिन्ह व लोक देवता",
  exam: "CET / REET 2026 Special",
  question: "राजस्थान का राज्य वृक्ष 'खेजड़ी' को किस वर्ष राज्य वृक्ष घोषित किया गया था?",
  options: ["(A) 1981", "(B) 1983", "(C) 1985", "(D) 1989"],
  correctIndex: 1,
  explanation: "खेजड़ी (Prosopis cineraria) को 31 अक्टूबर 1983 को राज्य वृक्ष घोषित किया गया।",
  summaryPoints: [
    { title: "राज्य वृक्ष (खेजड़ी)", desc: "घोषित: 31 अक्टूबर 1983 | वैज्ञानिक नाम: Prosopis cineraria | उपनाम: थार का कल्पवृक्ष।" },
    { title: "पाबूजी (लोक देवता)", desc: "ऊंटों के देवता | फड़ वाचन: रावणहत्था वाद्ययंत्र | मुख्य स्थल: कोलू मण्ड (फलौदी)।" },
    { title: "गोगाजी (लोक देवता)", desc: "साँपों के देवता | थान: खेजड़ी वृक्ष के नीचे | शीर्षमेड़ी: ददरेवा (चूरू)।" },
    { title: "रामदेवजी (लोक देवता)", desc: "सांप्रदायिक सद्भाव के प्रतीक | मेला: रामदेवरा (जैसलमेर) | ग्रंथ: चौबीस बाणियां।" }
  ]
};

export default function CreatorStudio() {
  const [activeTab, setActiveTab] = useState("reel");
  const [isProcessing, setIsProcessing] = useState(false);

  // Direct Native Canvas Drawing (100% Mobile Compatible & Instant)
  const generateDirectImage = (withAnswer = false) => {
    setIsProcessing(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");

      // 1. Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
      bgGrad.addColorStop(0, "#090D16");
      bgGrad.addColorStop(0.5, "#0F172A");
      bgGrad.addColorStop(1, "#030712");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Top Header Badge
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
      ctx.fillText(SAMPLE_DATA.exam, 540, 260);

      // 3. Question Card Box
      ctx.fillStyle = "#1E293B";
      ctx.beginPath();
      ctx.roundRect(80, 360, 920, 320, 32);
      ctx.fill();
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = "bold 44px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      
      // Multi-line Question Text wrapping
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
      wrapText(SAMPLE_DATA.question, 540, 480, 820, 60);

      // 4. Options Cards
      const startY = 740;
      SAMPLE_DATA.options.forEach((opt, idx) => {
        const y = startY + (idx * 160);
        const isCorrect = withAnswer && idx === SAMPLE_DATA.correctIndex;

        ctx.fillStyle = isCorrect ? "rgba(16, 185, 129, 0.2)" : "#1E293B";
        ctx.beginPath();
        ctx.roundRect(80, y, 920, 120, 24);
        ctx.fill();
        ctx.strokeStyle = isCorrect ? "#10B981" : "#334155";
        ctx.lineWidth = isCorrect ? 5 : 2;
        ctx.stroke();

        ctx.font = isCorrect ? "bold 42px system-ui, sans-serif" : "600 38px system-ui, sans-serif";
        ctx.fillStyle = isCorrect ? "#6EE7B7" : "#F1F5F9";
        ctx.textAlign = "left";
        ctx.fillText(opt, 140, y + 74);

        if (isCorrect) {
          ctx.textAlign = "right";
          ctx.fillText("✓ सही उत्तर", 940, y + 74);
        }
      });

      // 5. Explanation Box (If Answer frame)
      if (withAnswer) {
        ctx.fillStyle = "rgba(99, 102, 241, 0.15)";
        ctx.beginPath();
        ctx.roundRect(80, 1420, 920, 160, 24);
        ctx.fill();
        ctx.strokeStyle = "#6366F1";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = "bold 32px system-ui, sans-serif";
        ctx.fillStyle = "#A5B4FC";
        ctx.textAlign = "left";
        ctx.fillText("💡 व्याख्या:", 120, 1480);
        ctx.font = "normal 30px system-ui, sans-serif";
        ctx.fillStyle = "#E2E8F0";
        wrapText(SAMPLE_DATA.explanation, 120, 1530, 840, 40);
      }

      // 6. Bottom CTA
      ctx.textAlign = "center";
      ctx.font = "bold 36px system-ui, sans-serif";
      ctx.fillStyle = "#F59E0B";
      ctx.fillText("👉 पूरे 100 PYQ टेस्ट देने के लिए बायो लिंक खोलें! 🚀", 540, 1720);

      ctx.font = "500 28px system-ui, sans-serif";
      ctx.fillStyle = "#64748B";
      ctx.fillText("EduAI Pro • t.me/EduAI_RajasthanExam", 540, 1790);

      // Trigger Direct Download
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `EduAI_Reel_${withAnswer ? "Ans" : "Q"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert("Error generating image: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Direct PDF Generator
  const generateDirectPDF = () => {
    setIsProcessing(true);
    try {
      const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4"
      });

      // Header
      doc.setFillColor(30, 27, 75);
      doc.rect(0, 0, 210, 32, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text("EduAI Pro - 1-Page Revision Capsule", 14, 14);

      doc.setFontSize(11);
      doc.setTextColor(224, 231, 255);
      doc.text("Topic: " + SAMPLE_DATA.topic + " | CET / REET 2026", 14, 24);

      // Points
      let currentY = 45;
      SAMPLE_DATA.summaryPoints.forEach((point, idx) => {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, currentY, 182, 26, 3, 3, "F");
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, currentY, 182, 26, 3, 3, "S");

        doc.setFontSize(11);
        doc.setTextColor(67, 56, 202);
        doc.text(`${idx + 1}. ${point.title}`, 20, currentY + 9);

        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        const splitText = doc.splitTextToSize(point.desc, 170);
        doc.text(splitText, 20, currentY + 18);

        currentY += 34;
      });

      // Footer
      doc.setFillColor(241, 245, 249);
      doc.rect(0, 275, 210, 22, "F");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("Practice 100+ PYQ & Free Tests: https://education-platform-fawn-six.vercel.app/quiz", 14, 287);
      doc.text("Telegram: @EduAI_RajasthanExam", 150, 287);

      doc.save(`EduAI_Revision_Capsule_${Date.now()}.pdf`);
    } catch (err) {
      alert("Error generating PDF: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-24 font-sans">
      <div className="max-w-md mx-auto space-y-5">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> 1-Click Fast Studio
          </div>
          <h1 className="text-xl font-bold text-white">EduAI Reels & PDF Generator</h1>
        </div>

        {/* Tab Switch */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("reel")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "reel" ? "bg-indigo-600 text-white" : "text-slate-400"
            }`}
          >
            <Video className="w-3.5 h-3.5" /> Reel Images
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

        {/* TAB 1: REELS */}
        {activeTab === "reel" && (
          <div className="space-y-3">
            <button
              onClick={() => generateDirectImage(false)}
              disabled={isProcessing}
              className="w-full py-3 bg-rose-600 active:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2"
            >
              📥 1. सवाल इमेज डाउनलोड करें (HD)
            </button>
            <button
              onClick={() => generateDirectImage(true)}
              disabled={isProcessing}
              className="w-full py-3 bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2"
            >
              📥 2. उत्तर इमेज डाउनलोड करें (HD)
            </button>
          </div>
        )}

        {/* TAB 2: PDF */}
        {activeTab === "pdf" && (
          <div className="space-y-3">
            <button
              onClick={generateDirectPDF}
              disabled={isProcessing}
              className="w-full py-3 bg-indigo-600 active:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2"
            >
              📥 1-Page PDF तुरंत डाउनलोड करें
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
