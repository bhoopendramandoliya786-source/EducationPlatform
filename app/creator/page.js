"use client";

import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Video, FileText, Sparkles, CheckCircle2 } from "lucide-react";

const SAMPLE_DATA = {
  topic: "राजस्थान के लोक देवता एवं प्रतीक चिन्ह",
  exam: "CET / REET 2026 Special",
  question: "राजस्थान का राज्य वृक्ष 'खेजड़ी' को किस वर्ष राज्य वृक्ष घोषित किया गया था?",
  options: ["(A) 1981", "(B) 1983", "(C) 1985", "(D) 1989"],
  correctIndex: 1,
  explanation: "खेजड़ी (Prosopis cineraria) को 31 अक्टूबर 1983 को राज्य वृक्ष का दर्जा दिया गया।",
  summaryPoints: [
    { title: "राज्य वृक्ष (खेजड़ी)", desc: "घोषित: 31 अक्टूबर 1983 | वैज्ञानिक नाम: Prosopis cineraria | थार का कल्पवृक्ष।" },
    { title: "पाबूजी (लोक देवता)", desc: "ऊंटों के देवता | फड़ वाचन: रावणहत्था वाद्ययंत्र | कोलू मण्ड (फलौदी)।" },
    { title: "गोगाजी (लोक देवता)", desc: "साँपों के देवता | थान: खेजड़ी वृक्ष के नीचे | ददरेवा (चूरू)।" },
    { title: "रामदेवजी (लोक देवता)", desc: "सांप्रदायिक सद्भाव के प्रतीक | मेला: रामदेवरा (जैसलमेर) | ग्रंथ: चौबीस बाणियां।" }
  ]
};

export default function CreatorStudio() {
  const [data, setData] = useState(SAMPLE_DATA);
  const [isExporting, setIsExporting] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const reelRef = useRef(null);
  const pdfRef = useRef(null);

  const downloadReelFrame = async (withAnswer = false) => {
    setShowAnswer(withAnswer);
    setIsExporting(true);
    setTimeout(async () => {
      if (reelRef.current) {
        const canvas = await html2canvas(reelRef.current, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `EduAI_Reel_${withAnswer ? "Ans" : "Q"}.png`;
        link.href = imgData;
        link.click();
      }
      setIsExporting(false);
    }, 150);
  };

  const downloadPDFNotes = async () => {
    setIsExporting(true);
    if (pdfRef.current) {
      const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`EduAI_Pro_Revision_Capsule.pdf`);
    }
    setIsExporting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> EduAI Creator Studio
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">1-Click Reel & Revision PDF Generator</h1>
            <p className="text-slate-400 text-sm mt-1">रील्स इमेजेस और 1-पेज रिवीजन PDF नोट्स जनरेट करें।</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => downloadReelFrame(false)} disabled={isExporting} className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-xl text-sm font-medium cursor-pointer">
              <Video className="w-4 h-4" /> Reel Frame (Q)
            </button>
            <button onClick={() => downloadReelFrame(true)} disabled={isExporting} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm font-medium cursor-pointer">
              <CheckCircle2 className="w-4 h-4" /> Reel Frame (Ans)
            </button>
            <button onClick={downloadPDFNotes} disabled={isExporting} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-medium cursor-pointer">
              <FileText className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 flex flex-col items-center">
            <h2 className="text-sm font-semibold text-slate-400 mb-3">Vertical Reel Preview (1080x1920)</h2>
            <div ref={reelRef} style={{ width: "340px", height: "600px" }} className="relative bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700 rounded-3xl p-6 flex flex-col justify-between text-center select-none">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-3">
                  ⚠️ 90% छात्र यहाँ गलती करते हैं!
                </div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wide">{data.exam}</div>
              </div>
              <div className="my-auto space-y-4">
                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                  <h3 className="text-sm font-bold text-white leading-snug">{data.question}</h3>
                </div>
                <div className="space-y-2 text-left">
                  {data.options.map((opt, idx) => {
                    const isCorrect = showAnswer && idx === data.correctIndex;
                    return (
                      <div key={idx} className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${isCorrect ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" : "bg-slate-800/50 border-slate-700 text-slate-200"}`}>
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
              <div className="pt-3 border-t border-slate-800">
                <p className="text-xs font-bold text-amber-400">👉 पूरे 100 PYQ टेस्ट देने के लिए बायो में लिंक देखें!</p>
                <div className="text-[10px] text-slate-500 mt-1">EduAI Pro • t.me/EduAI_RajasthanExam</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col items-center w-full">
            <h2 className="text-sm font-semibold text-slate-400 mb-3">1-Page PDF Revision Preview</h2>
            <div ref={pdfRef} style={{ width: "100%", maxWidth: "480px" }} className="bg-white text-slate-900 rounded-2xl p-6 border border-slate-200 select-none">
              <div className="flex justify-between items-center border-b-2 border-indigo-600 pb-3 mb-4">
                <div>
                  <h2 className="text-base font-black text-indigo-950 uppercase">🎯 EduAI Pro Revision Capsule</h2>
                  <p className="text-xs font-bold text-indigo-600">विषय: {data.topic}</p>
                </div>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">100% Exam-Oriented</span>
              </div>
              <div className="space-y-2.5">
                {data.summaryPoints.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-xs font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">{idx + 1}</span>
                      {item.title}
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed pl-5">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-600">
                <div>🚀 <b>टेस्ट दें:</b> education-platform-fawn-six.vercel.app/quiz</div>
                <div className="font-semibold text-indigo-700">@EduAI_RajasthanExam</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
