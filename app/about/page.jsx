import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Target, BookOpen, Brain, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "हमारे बारे में | EduAI Pro",
  description:
    "EduAI Pro राजस्थान की प्रतियोगी परीक्षाओं की तैयारी के लिए नोट्स, अभ्यास प्रश्न, PYQ और शैक्षणिक सामग्री उपलब्ध कराने वाला प्लेटफॉर्म है।",
};

export default function AboutPage() {
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
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> हमारा परिचय
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            हमारे बारे में (About EduAI Pro)
          </h1>
          <p className="text-xs text-slate-400">
            राजस्थान प्रतियोगी परीक्षाओं के लिए आधुनिक, स्मार्ट एवं निःशुल्क अध्ययन मंच
          </p>
        </div>

        {/* Story & Platform Info */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            <strong className="text-white">EduAI Pro</strong> एक अत्याधुनिक शैक्षणिक प्लेटफ़ॉर्म है, जिसका मुख्य उद्देश्य राजस्थान की विभिन्न प्रतियोगी परीक्षाओं (जैसे CET, REET, RPSC 2nd Grade, RAS Pre, राजस्थान पुलिस, पटवार आदि) की तैयारी करने वाले विद्यार्थियों को उच्च-गुणवत्ता एवं परीक्षा-उपयोगी अध्ययन सामग्री एक ही स्थान पर उपलब्ध कराना है।
          </p>

          <p>
            हम पारंपरिक रट्टा-पद्धति के बजाय टू-द-पॉइंट रिवीजन, स्मार्ट माइंड-मैप्स और लगातार मॉक प्रैक्टिस पर विश्वास करते हैं ताकि प्रत्येक छात्र कम समय में अधिकतम अंक अर्जित कर सके।
          </p>

          {/* Key Feature Pillars */}
          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm">स्मार्ट थ्योरी नोट्स</h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                अध्यायवार संक्षिप्त बुलेट फैक्ट्स एवं परीक्षा में बार-बार पूछे जाने वाले मुख्य बिंदु।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm">MCQ & PYQ टेस्ट एरीना</h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                विगत वर्षों के 100 PYQ प्रश्न और टॉपिक अनुसार 50 MCQs के समयबद्ध लाइव टेस्ट।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Brain className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm">24x7 AI ट्यूटर</h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                कठिन प्रश्नों, ऐतिहासिक तिथियों और विज्ञान के तथ्यों की तुरंत व्याख्या पाने की सुविधा।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm">क्लाउड प्रोग्रेस ट्रैकिंग</h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                दैनिक स्ट्रीक, हल किए गए प्रश्न और टेस्ट स्कोर का स्वचालित क्लाउड रिकॉर्ड।
              </p>
            </div>
          </div>

          {/* Goal Statement */}
          <div className="pt-2 space-y-2">
            <h2 className="text-sm font-black text-white flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-400" /> हमारा विज़न
            </h2>
            <p className="text-slate-300 leading-relaxed">
              हमारा लक्ष्य राजस्थान के दूर-दराज़ क्षेत्रों में रहने वाले प्रत्येक मेहनती छात्र तक निःशुल्क, आधुनिक और गुणवत्तापूर्ण प्रतियोगी शिक्षण सामग्री पहुँचाना है ताकि कोई भी प्रतिभा संसाधनों के अभाव में पीछे न छूटे।
            </p>
          </div>

          {/* Disclaimer Note Box */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-xs text-emerald-300 font-medium">
            EduAI Pro पर उपलब्ध सामग्री केवल छात्रों की अध्ययन सहायता हेतु बनाई गई है। आधिकारिक परीक्षा तिथियों, विज्ञप्ति व अंतिम उत्तर कुंजी के लिए संबंधित भर्ती बोर्ड की वेबसाइट अवश्य देखें।
          </div>
        </div>

      </section>
    </main>
  );
}