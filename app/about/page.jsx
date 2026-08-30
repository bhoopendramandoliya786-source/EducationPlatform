export const metadata = {
  title: "हमारे बारे में",
  description: "EduAI Pro के बारे में जानें।",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
        <h1 className="text-2xl font-black text-white">हमारे बारे में</h1>

        <div className="mt-5 space-y-4 leading-7 text-slate-300">
          <p>
            EduAI Pro एक शैक्षणिक प्लेटफॉर्म है जो राजस्थान की विभिन्न
            प्रतियोगी परीक्षाओं की तैयारी करने वाले विद्यार्थियों के लिए
            उपयोगी अध्ययन सामग्री उपलब्ध कराने का प्रयास करता है।
          </p>

          <p>
            प्लेटफॉर्म पर विषयवार नोट्स, अध्याय, टॉपिक, अभ्यास प्रश्न,
            PYQ और अन्य शैक्षणिक सामग्री उपलब्ध कराई जा सकती है।
          </p>

          <p>
            हमारा उद्देश्य विद्यार्थियों को व्यवस्थित और सरल तरीके से
            अध्ययन सामग्री तक पहुँच प्रदान करना है।
          </p>
        </div>
      </section>
    </main>
  );
}
