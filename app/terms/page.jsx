import React from "react";
import Link from "next/link";
import { ArrowLeft, Scale, BookOpen, ShieldAlert, RefreshCw, FileCheck2 } from "lucide-react";

export const metadata = {
  title: "नियम एवं शर्तें | EduAI Pro",
  description:
    "EduAI Pro के उपयोग से संबंधित नियम एवं शर्तें तथा प्लेटफॉर्म उपयोग की जानकारी।",
};

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-4 font-sans select-none">

      {/* Back Button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> वापस होम
        </Link>
      </div>

      {/* Main Content Card */}
      <section className="rounded-[28px] border border-emerald-500/20 bg-gradient-to-b from-slate-900/95 to-slate-950 p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

        {/* Title Header */}
        <div className="space-y-2 border-b border-slate-800 pb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
            <Scale className="w-3.5 h-3.5 text-emerald-400" /> उपयोग की शर्तें
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            नियम एवं शर्तें (Terms & Conditions)
          </h1>
          <p className="text-xs text-slate-400">
            अंतिम अपडेट: 2026 • EduAI Pro सेवा उपयोग दिशा-निर्देश
          </p>
        </div>

        {/* Terms Points */}
        <div className="space-y-5 text-xs sm:text-sm leading-relaxed text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm">
              <FileCheck2 className="w-4 h-4 text-emerald-400" /> 1. प्लेटफॉर्म का उपयोग
            </h2>
            <p className="text-slate-400 leading-normal">
              EduAI Pro का उपयोग केवल वैध, व्यक्तिगत और शैक्षणिक अध्ययन उद्देश्यों के लिए किया जाना चाहिए। व्यावसायिक पुनर्वितरण या अनधिकृत स्क्रैपिंग पूर्णतया प्रतिबंधित है।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-emerald-400" /> 2. अध्ययन सामग्री की प्रकृति
            </h2>
            <p className="text-slate-400 leading-normal">
              प्लेटफॉर्म पर उपलब्ध नोट्स, प्रश्न, MCQ, PYQ और AI उत्तर विद्यार्थियों की त्वरित अध्ययन सहायता के उद्देश्य से हैं। आधिकारिक अधिसूचना, परिणाम या नियमों के लिए संबंधित परीक्षा संस्था की आधिकारिक वेबसाइट को ही अंतिम प्रमाण मानें।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm">
              <ShieldAlert className="w-4 h-4 text-emerald-400" /> 3. उचित उपयोग नीति (Fair Usage)
            </h2>
            <p className="text-slate-400 leading-normal">
              उपयोगकर्ता प्लेटफॉर्म की सर्वर कार्यप्रणाली को बाधित करने, API का गलत इस्तेमाल करने या सुरक्षा तंत्र को बाईपास करने का प्रयास नहीं करेंगे। ऐसा पाए जाने पर अकाउंट निलंबित किया जा सकता है।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm">
              <RefreshCw className="w-4 h-4 text-emerald-400" /> 4. सेवाओं एवं सामग्री में संशोधन
            </h2>
            <p className="text-slate-400 leading-normal">
              EduAI Pro परीक्षा पाठ्यक्रम या तकनीकी सुधारों के अनुसार प्लेटफॉर्म की सामग्री, फीचर्स और AI मॉडल्स में किसी भी समय बदलाव या अपडेट करने का अधिकार सुरक्षित रखता है।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm">
              <Scale className="w-4 h-4 text-emerald-400" /> 5. नियमों में बदलाव
            </h2>
            <p className="text-slate-400 leading-normal">
              इन नियमों एवं शर्तों को समय-समय पर अपडेट किया जा सकता है। नया संस्करण तुरंत प्रभाव से इसी पेज पर प्रभावी माना जाएगा।
            </p>
          </div>

          {/* Callout Notice */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-xs text-emerald-300 font-medium">
            EduAI Pro का उपयोग करके आप इन नियमों एवं शर्तों को पूरी तरह स्वीकार करते हैं और एक अनुशासित विद्यार्थी के रूप में अध्ययन करने के लिए सहमत होते हैं।
          </div>
        </div>

      </section>
    </main>
  );
}