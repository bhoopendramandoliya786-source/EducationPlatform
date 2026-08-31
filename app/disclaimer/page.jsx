export const metadata = {
  title: "अस्वीकरण",
  description:
    "EduAI Pro पर उपलब्ध शैक्षणिक सामग्री और जानकारी के उपयोग से संबंधित अस्वीकरण।",
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
        <h1 className="text-2xl font-black text-white">अस्वीकरण</h1>

        <div className="mt-5 space-y-5 leading-7 text-slate-300">
          <div>
            <h2 className="font-bold text-white">शैक्षणिक उद्देश्य</h2>
            <p className="mt-1">
              EduAI Pro पर उपलब्ध नोट्स, प्रश्न, MCQ, PYQ और अन्य सामग्री
              केवल शैक्षणिक एवं अध्ययन सहायता के उद्देश्य से प्रदान की जाती है।
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white">जानकारी की सटीकता</h2>
            <p className="mt-1">
              सामग्री को सही और उपयोगी रखने का प्रयास किया जाता है, लेकिन
              सभी जानकारी की पूर्ण सटीकता या निरंतर अद्यतन रहने की गारंटी
              नहीं दी जा सकती। परीक्षा, भर्ती, परिणाम या आधिकारिक सूचना के
              लिए संबंधित संस्था की आधिकारिक वेबसाइट और अधिसूचना को प्राथमिकता दें।
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white">परीक्षा परिणाम</h2>
            <p className="mt-1">
              EduAI Pro किसी परीक्षा में चयन, अंक, परिणाम या सफलता की गारंटी
              नहीं देता। अध्ययन का परिणाम विद्यार्थी की व्यक्तिगत तैयारी और
              अन्य परिस्थितियों पर निर्भर करता है।
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white">बाहरी लिंक</h2>
            <p className="mt-1">
              प्लेटफॉर्म पर भविष्य में अन्य वेबसाइटों या सेवाओं के लिंक उपलब्ध
              हो सकते हैं। बाहरी वेबसाइटों की सामग्री, उपलब्धता और नीतियों की
              जिम्मेदारी संबंधित वेबसाइट की होगी।
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white">संपर्क</h2>
            <p className="mt-1">
              किसी सामग्री या जानकारी से संबंधित सुझाव, सुधार या समस्या होने
              पर आप हमारे Contact page के माध्यम से हमसे संपर्क कर सकते हैं।
            </p>
          </div>

          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-sm text-slate-400">
            EduAI Pro का उपयोग करके आप समझते हैं कि प्लेटफॉर्म की सामग्री
            शैक्षणिक सहायता के लिए है और आधिकारिक जानकारी के लिए संबंधित
            संस्थाओं के स्रोतों को प्राथमिकता देना आवश्यक है।
          </div>
        </div>
      </section>
    </main>
  );
}