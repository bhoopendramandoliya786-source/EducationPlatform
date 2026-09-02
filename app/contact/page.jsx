import React from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, Send, Sparkles, HelpCircle } from "lucide-react";

export const metadata = {
  title: "संपर्क करें | EduAI Pro",
  description:
    "EduAI Pro से संपर्क करें। सुझाव, समस्याओं और प्लेटफॉर्म से संबंधित जानकारी के लिए हमसे जुड़ें।",
};

export default function ContactPage() {
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
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> सहायता केंद्र
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            संपर्क करें (Contact Us)
          </h1>
          <p className="text-xs text-slate-400">
            EduAI Pro विद्यार्थी सहायता, सुझाव एवं तकनीकी सहयोग
          </p>
        </div>

        {/* Intro */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            EduAI Pro से संबंधित सुझाव, किसी प्रश्न में संशय, नोट्स में सुधार या अन्य किसी भी तकनीकी समस्या के लिए आप हमसे सीधे संपर्क कर सकते हैं।
          </p>
          <p>
            हम राजस्थान के प्रतियोगी विद्यार्थियों के प्रत्येक सुझाव को प्राथमिकता देते हैं ताकि आपका परीक्षा अभ्यास निरंतर और बेहतर हो सके।
          </p>

          {/* Email Support Card */}
          <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/80 p-5 space-y-3 shadow-inner">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Mail className="w-4 h-4 text-emerald-400" />
              <h2>आधिकारिक ईमेल सहायता</h2>
            </div>

            <a
              href="mailto:eduaipro2@gmail.com"
              className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-emerald-400 hover:text-emerald-300 transition hover:underline"
            >
              <span>eduaipro2@gmail.com</span>
              <Send className="w-3.5 h-3.5" />
            </a>

            <p className="text-xs text-slate-400 leading-normal">
              कृपया अपने संदेश में विषय (Subject), संबंधित अध्याय या प्रश्न संख्या तथा समस्या का संक्षिप्त विवरण अवश्य लिखें ताकि हमारी टीम तुरंत समाधान कर सके।
            </p>
          </div>

          {/* Telegram Channel Shortcut */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">लाइव टेलीग्राम कम्युनिटी</span>
              <span className="text-[11px] text-slate-400 block">दैनिक टेस्ट अपडेट्स और फ्री PDF चर्चा</span>
            </div>
            <a
              href="https://t.me/EduAI_RajasthanExam"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition whitespace-nowrap"
            >
              चैनल खोलें →
            </a>
          </div>

        </div>

      </section>
    </main>
  );
}