"use client";

import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Video, FileText, CheckCircle2, ArrowRight, Eye } from "lucide-react";

const SAMPLE_DATA = {
  topic: "राजस्थान के प्रतीक चिन्ह व लोक देवता",
  exam: "CET / REET 2026 Special",
  question: "राजस्थान का राज्य वृक्ष 'खेजड़ी' को किस वर्ष राज्य वृक्ष घोषित किया गया था?",
  options: ["(A) 1981", "(B) 1983", "(C) 1985", "(D) 1989"],
  correctIndex: 1,
  explanation: "खेजड़ी (Prosopis cineraria) को 31 अक्टूबर 1983 को राज्य वृक्ष घोषित किया गया।",
  summaryPoints: [
    { title: "राज्य वृक्ष (खेजड़ी)", desc: "घोषित: 31 अक्टूबर 1983 | वैज्ञानिक नाम: Prosopis cineraria | थार का कल्पवृक्ष।" },
    { title: "पाबूजी (लोक देवता)", desc: "ऊंटों के देवता | फड़ वाचन: रावणहत्था वाद्ययंत्र | मुख्य स्थल: कोलू मण्ड (फलौदी)।" },
    { title: "गोगाजी (लोक देवता)", desc: "साँपों के देवता | थान: खेजड़ी वृक्ष के नीचे | शीर्षमेड़ी: ददरेवा (चूरू)।" },
    { title: "रामदेवजी (लोक देवता)", desc: "सांप्रदायिक सद्भाव के प्रतीक | मेला: रामदेवरा (जैसलमेर) | ग्रंथ: चौबीस बाणियां।" }
  ]
};

export default function CreatorStudio() {
  const [data, setData] = useState(SAMPLE_DATA);
  const [activeTab, setActiveTab] = useState("reel"); // 'reel' or 'pdf'
  const [showAnswer, setShowAnswer] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const reelRef = useRef(null);
  const pdfRef = useRef(null);

  const downloadReel = async (ans = false) => {
    setShowAnswer(ans);
    setIsDownloading(true);
    setTimeout(async () => {
      if (reelRef.current) {
        const canvas = await html2canvas(reelRef.current, { scale: 3, useCORS: true });
        const link = document.createElement("a");
        link.download = `EduAI_Reel_${ans ? "Answer" : "Question"}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
      setIsDownloading(false);
    }, 200);
  };

  const downloadPDF = async () => {
    setIsDownloading(true);
    if (pdfRef.current) {
      const canvas = await html2canvas(pdfRef.current, { scale: 2.5, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`EduAI_Pro_${data.topic.replace(/\s+/g, "_")}_Notes.pdf`);
    }
    setIsDownloading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-28 font-sans">
      <div className="max-w-md mx-auto space-y-5">
        
        {/* Top Switcher */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-white">⚡ EduAI Studio</h1>
          <p className="text-xs text-slate-400">Instagram रील्स व PDF नोट्स 1-क्लिक में डाउनलोड करें</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("reel")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "reel" ? "bg-indigo-600 text-white shadow" : "text-slate-400"
            }`}
          >
            <Video className="w-3.5 h-3.5" /> Reel Generator
          </button>
          <button
            onClick={() => setActiveTab("pdf")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "pdf" ? "bg-indigo-600 text-white shadow" : "text-slate-400"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> 1-Page PDF Notes
          </button>
        </div>

        {/* TAB 1: REEL GENERATOR */}
        {activeTab === "reel" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => downloadReel(false)}
                disabled={isDownloading}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-1.5"
              >
                📥 1. सवाल इमेज डाउनलोड
              </button>
              <button
                onClick={() => downloadReel(true)}
                disabled={isDownloading}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-1.5"
              >
                📥 2. उत्तर इमेज डाउनलोड
              </button>
            </div>

            {/* Reel Box */}
            <div className="flex justify-center">
              <div
                ref={reelRef}
                style={{ width: "320px", height: "568px" }}
                className="bg-gradient-to-b from-slate-900 via-[#0B1329] to-slate-950 border border-slate-700 rounded-3xl p-5 flex flex-col justify-between text-center shadow-2xl"
              >
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                    ⚠️ 90% छात्र यहाँ गलती करते हैं!
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{data.exam}</div>
                </div>

                <div className="my-auto space-y-3">
                  <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3.5 shadow-inner">
                    <h3 className="text-sm font-bold text-white leading-relaxed">{data.question}</h3>
                  </div>

                  <div className="space-y-2 text-left">
                    {data.options.map((opt, idx) => {
                      const isCorrect = showAnswer && idx === data.correctIndex;
                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                            isCorrect
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md"
                              : "bg-slate-800/40 border-slate-700 text-slate-200"
                          }`}
                        >
                          <span>{opt}</span>
                          {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </div>
                      );
                    })}
                  </div>

                  {showAnswer && (
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-[11px] text-indigo-300 text-left">
                      💡 <b>व्याख्या:</b> {data.explanation}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <p className="text-[11px] font-bold text-amber-400">👉 पूरे 100 PYQ टेस्ट देने के लिए बायो में लिंक देखें!</p>
                  <div className="text-[9px] text-slate-400 mt-0.5">EduAI Pro • t.me/EduAI_RajasthanExam</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PDF GENERATOR */}
        {activeTab === "pdf" && (
          <div className="space-y-4">
            <button
              onClick={downloadPDF}
              disabled={isDownloading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2"
            >
              📥 1-Click में Revision PDF डाउनलोड करें
            </button>

            {/* PDF Preview Box */}
            <div
              ref={pdfRef}
              className="bg-white text-slate-900 rounded-xl p-5 border border-slate-200 shadow-lg text-left"
            >
              <div className="border-b-2 border-indigo-600 pb-2 mb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-black text-indigo-950 uppercase">🎯 EduAI Pro Revision Capsule</h2>
                  <p className="text-[11px] font-bold text-indigo-600">विषय: {data.topic}</p>
                </div>
                <span className="text-[9px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">CET • REET</span>
              </div>

              <div className="space-y-2">
                {data.summaryPoints.map((item, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200">
                    <div className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                      <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px]">{idx + 1}</span>
                      {item.title}
                    </div>
                    <p className="text-[10px] text-slate-700 mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-2 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-500">
                <span>🚀 100 PYQ टेस्ट: education-platform-fawn-six.vercel.app</span>
                <span className="font-semibold text-indigo-700">@EduAI_RajasthanExam</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
