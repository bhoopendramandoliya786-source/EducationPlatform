import React from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, GraduationCap, CheckCircle2, ExternalLink, Mail } from "lucide-react";

export const metadata = {
  title: "अस्वीकरण (Disclaimer) | EduAI Pro",
  description:
    "EduAI Pro पर उपलब्ध शैक्षणिक सामग्री और जानकारी के उपयोग से संबंधित अस्वीकरण।",
};

export default function DisclaimerPage() {
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
            <AlertTriangle className="w-3.5 h-3.5 text-emerald-400" /> महत्वपूर्ण घोषणा
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            अस्वीकरण (Disclaimer)
          </h1>
          <p className="text-xs text-slate-400">
            अंतिम अपडेट: 2026 • EduAI Pro शैक्षणिक सामग्री स्पष्टीकरण
          </p>
        </div>

        {/* Disclaimer Points */}
        <div className="space-y-5 text-xs sm:text-sm leading-relaxed text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm">
              <GraduationCap className="w-4 h-4 text-emerald-400" /> 1. केवल शैक्षणिक उद्देश्य
            </h2>
            <p className="text-slate-400 leading-normal">
              EduAI Pro पर उपलब्ध नोट्स, टेस्ट सीरीज़, 50 MCQs, 100 PYQs और AI व्याख्या केवल छात्रों के व्यक्तिगत अध्ययन व प्रतियोगी परीक्षा अभ्यास के लिए प्रदान की जाती हैं।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2. जानकारी की सटीकता
            </h2>
            <p className="text-slate-400 leading-normal">
              सामग्री को तथ्यात्मक रूप से शुद्ध रखने का हर संभव प्रयास किया गया है, किंतु राजस्थान बोर्ड या अन्य परीक्षा संस्थाओं द्वारा जारी नवीनतम संशोधन सर्वोपरि होंगे। आधिकारिक पुष्टि हेतु संबंधित संस्था की विज्ञप्ति अवश्य देखें।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-emerald-400" /> 3. परीक्षा परिणाम एवं चयन की गारंटी
            </h2>
            <p className="text-slate-400 leading-normal">
              EduAI Pro किसी भी सरकारी अथवा निजी प्रतियोगी परीक्षा में चयन या अंकों की कोई गारंटी नहीं देता है। सफलता पूर्णतः छात्र के स्वयं के अध्ययन, मेहनत और परीक्षा केंद्र में प्रदर्शन पर निर्भर करती है।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm">
              <ExternalLink className="w-4 h-4 text-emerald-400" /> 4. बाहरी लिंक
            </h2>
            <p className="text-slate-400 leading-normal">
              प्लेटफ़ॉर्म पर दिए गए किसी भी बाहरी स्रोत या सोशल कम्युनिटी (जैसे टेलीग्राम) के लिंक छात्रों की सुविधा के लिए हैं। उन पृष्ठों की सामग्री व संचालन की ज़िम्मेदारी संबंधित प्रदाता की होगी।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-emerald-400" /> 5. त्रुटि सुधार एवं संपर्क
            </h2>
            <p className="text-slate-400 leading-normal">
              यदि आपको किसी प्रश्न, उत्तर कुंजी या नोट्स में कोई त्रुटि मिलती है, तो आप हमारे संपर्क पेज के माध्यम से हमें सूचित कर सकते हैं ताकि त्वरित सुधार किया जा सके।
            </p>
          </div>

          {/* Callout Notice */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-xs text-emerald-300 font-medium">
            EduAI Pro का उपयोग करते हुए आप यह स्वीकार करते हैं कि यह प्लेटफ़ॉर्म एक स्व-अध्ययन सहायक साधन है, न कि कोई आधिकारिक सरकारी निकाय।
          </div>
        </div>

      </section>
    </main>
  );
}