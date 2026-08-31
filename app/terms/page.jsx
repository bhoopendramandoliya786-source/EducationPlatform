export const metadata = {
  title: "नियम एवं शर्तें",
  description:
    "EduAI Pro के उपयोग से संबंधित नियम एवं शर्तें तथा प्लेटफॉर्म उपयोग की जानकारी।",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
        <h1 className="text-2xl font-black text-white">नियम एवं शर्तें</h1>

        <div className="mt-5 space-y-5 leading-7 text-slate-300">
          <div>
            <h2 className="font-bold text-white">प्लेटफॉर्म का उपयोग</h2>
            <p className="mt-1">
              EduAI Pro का उपयोग केवल वैध, व्यक्तिगत और शैक्षणिक उद्देश्यों
              के लिए किया जाना चाहिए।
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white">अध्ययन सामग्री</h2>
            <p className="mt-1">
              प्लेटफॉर्म पर उपलब्ध नोट्स, प्रश्न, MCQ, PYQ और अन्य सामग्री
              विद्यार्थियों की अध्ययन सहायता के उद्देश्य से प्रदान की जाती है।
              परीक्षा से संबंधित आधिकारिक जानकारी के लिए संबंधित परीक्षा संस्था
              की आधिकारिक सूचना और वेबसाइट को प्राथमिकता दें।
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white">उचित उपयोग</h2>
            <p className="mt-1">
              उपयोगकर्ता प्लेटफॉर्म की सेवाओं का गलत उपयोग करने, वेबसाइट की
              कार्यप्रणाली को बाधित करने या किसी अनधिकृत गतिविधि का प्रयास नहीं
              करेंगे।
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white">सेवाओं में बदलाव</h2>
            <p className="mt-1">
              EduAI Pro आवश्यकता के अनुसार प्लेटफॉर्म की सामग्री, सुविधाओं और
              सेवाओं में बदलाव, सुधार या अपडेट कर सकता है।
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white">नियमों में बदलाव</h2>
            <p className="mt-1">
              इन नियमों एवं शर्तों को समय-समय पर अपडेट किया जा सकता है।
              अपडेट किया गया संस्करण इसी पेज पर उपलब्ध कराया जाएगा।
            </p>
          </div>

          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-sm text-slate-400">
            EduAI Pro का उपयोग करके आप इन नियमों एवं शर्तों को समझते हैं और
            प्लेटफॉर्म का जिम्मेदारीपूर्वक उपयोग करने के लिए सहमत होते हैं।
          </div>
        </div>
      </section>
    </main>
  );
}