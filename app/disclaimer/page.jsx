export const metadata = {
  title: "अस्वीकरण",
  description: "EduAI Pro का अस्वीकरण।",
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
              EduAI Pro पर उपलब्ध सामग्री केवल शैक्षणिक और अध्ययन सहायता
              के उद्देश्य से प्रदान की जाती है।
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white">जानकारी की सटीकता</h2>
            <p className="mt-1">
              सामग्री को सही और उपयोगी रखने का प्रयास किया जाता है, लेकिन
              किसी भी परीक्षा, परिणाम, भर्ती या आधिकारिक सूचना के लिए
              संबंधित संस्था की आधिकारिक जानकारी को प्राथमिकता दें।
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white">बाहरी लिंक</h2>
            <p className="mt-1">
              भविष्य में प्लेटफॉर्म पर बाहरी वेबसाइटों के लिंक हो सकते हैं।
              उन वेबसाइटों की सामग्री और नीतियों की जिम्मेदारी संबंधित
              वेबसाइट की होगी।
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white">संपर्क</h2>
            <p className="mt-1">
              किसी सामग्री या जानकारी से संबंधित सुझाव या समस्या होने पर
              हमसे संपर्क किया जा सकता है।
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
