import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "गोपनीयता नीति | EduAI Pro",
  description:
    "EduAI Pro की गोपनीयता नीति और वेबसाइट पर जानकारी, कुकीज़ तथा तृतीय-पक्ष सेवाओं के उपयोग की जानकारी।",
};

export default function PrivacyPolicyPage() {
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
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> लीगल एवं प्राइवेसी
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            गोपनीयता नीति (Privacy Policy)
          </h1>
          <p className="text-xs text-slate-400">
            अंतिम अपडेट: 2026 • EduAI Pro उपयोगकर्ता डेटा सुरक्षा नीति
          </p>
        </div>

        {/* Policy Points */}
        <div className="space-y-5 text-xs sm:text-sm leading-relaxed text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm">
              <Eye className="w-4 h-4 text-emerald-400" /> 1. जानकारी का उपयोग
            </h2>
            <p className="text-slate-400 leading-normal">
              EduAI Pro प्लेटफॉर्म की सेवाओं को संचालित करने, छात्र प्रोग्रेस ट्रैक करने, व्यक्तिगत परीक्षा तैयारी को बेहतर बनाने और वेबसाइट के प्रदर्शन को समझने के लिए आवश्यक जानकारी का उपयोग करता है।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-emerald-400" /> 2. कुकीज़ और Analytics
            </h2>
            <p className="text-slate-400 leading-normal">
              वेबसाइट के उपयोग और सर्वर प्रदर्शन को ट्रैक करने के लिए तकनीकी कुकीज़ तथा Google Analytics जैसी सेवाओं का उपयोग किया जाता है। इसका उद्देश्य केवल छात्रों के अध्ययन अनुभव को तेज़ और त्रुटिरहित बनाना है।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 3. तृतीय-पक्ष सेवाएँ (Third-Party Services)
            </h2>
            <p className="text-slate-400 leading-normal">
              EduAI Pro प्रमाणीकरण (Authentication) और डेटाबेस के लिए Supabase जैसी सुरक्षित व विश्वसनीय क्लाउड सेवाओं का उपयोग करता है। इन सेवाओं की अपनी स्वतंत्र डेटा सुरक्षा नीतियां हैं।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm">
              <Lock className="w-4 h-4 text-emerald-400" /> 4. जानकारी की सुरक्षा
            </h2>
            <p className="text-slate-400 leading-normal">
              हम उपयोगकर्ता खातों और पासवर्ड्स को आधुनिक एन्क्रिप्शन द्वारा सुरक्षित रखते हैं। हालांकि इंटरनेट पर 100% सुरक्षा की पूर्ण गारंटी नहीं दी जा सकती, फिर भी हम सर्वोत्तम सुरक्षा प्रोटोकॉल का पालन करते हैं।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 5. नीति में बदलाव
            </h2>
            <p className="text-slate-400 leading-normal">
              समय-समय पर नीतियों में सुधार या बदलाव किए जा सकते हैं। किसी भी नए संशोधन के बाद अद्यतित दस्तावेज़ इसी पृष्ठ पर उपलब्ध कराया जाएगा।
            </p>
          </div>

          {/* Callout Notice */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-xs text-emerald-300 font-medium">
            EduAI Pro का उपयोग जारी रखकर आप इस गोपनीयता नीति की सभी शर्तों और प्रक्रियाओं को स्वीकार करते हैं।
          </div>
        </div>

      </section>
    </main>
  );
}