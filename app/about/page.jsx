export const metadata = {
  title: "हमारे बारे में",
  description:
    "EduAI Pro राजस्थान की प्रतियोगी परीक्षाओं की तैयारी के लिए नोट्स, अभ्यास प्रश्न, PYQ और शैक्षणिक सामग्री उपलब्ध कराने वाला प्लेटफॉर्म है।",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
        <h1 className="text-2xl font-black text-white">हमारे बारे में</h1>

        <div className="mt-5 space-y-4 leading-7 text-slate-300">
          <p>
            EduAI Pro एक शैक्षणिक प्लेटफॉर्म है, जिसका उद्देश्य राजस्थान की
            विभिन्न प्रतियोगी परीक्षाओं की तैयारी करने वाले विद्यार्थियों को
            व्यवस्थित और उपयोगी अध्ययन सामग्री तक आसान पहुँच प्रदान करना है।
          </p>

          <p>
            प्लेटफॉर्म पर विषयवार अध्ययन सामग्री, अध्याय और टॉपिक आधारित
            नोट्स, अभ्यास प्रश्न, MCQ, PYQ और अन्य उपयोगी शैक्षणिक संसाधन
            उपलब्ध कराए जाते हैं।
          </p>

          <h2 className="pt-2 text-lg font-bold text-white">
            हमारा उद्देश्य
          </h2>

          <p>
            हमारा प्रयास है कि विद्यार्थी अपनी तैयारी को बेहतर तरीके से
            व्यवस्थित कर सकें और महत्वपूर्ण विषयों का अभ्यास एक ही प्लेटफॉर्म
            पर कर सकें।
          </p>

          <p>
            EduAI Pro लगातार अपने अध्ययन संसाधनों और सुविधाओं को बेहतर बनाने
            का प्रयास करता है ताकि विद्यार्थियों को सरल, उपयोगी और बेहतर
            learning experience मिल सके।
          </p>

          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-sm text-slate-400">
            EduAI Pro पर उपलब्ध सामग्री केवल शैक्षणिक सहायता के उद्देश्य से
            प्रदान की जाती है। विद्यार्थी आधिकारिक परीक्षा अधिसूचनाओं और
            संबंधित स्रोतों की जानकारी भी अवश्य देखें।
          </div>
        </div>
      </section>
    </main>
  );
}