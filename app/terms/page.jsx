export const metadata = {
  title: "नियम एवं शर्तें",
  description: "EduAI Pro के उपयोग से संबंधित नियम एवं शर्तें।",
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
              EduAI Pro का उपयोग केवल वैध और शैक्षणिक उद्देश्यों के लिए
              किया जाना चाहिए।
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white">अध्ययन सामग्री</h2>
            <p className="mt-1">
              प्लेटफॉर्म पर उपलब्ध सामग्री विद्यार्थियों की अध्ययन सहायता
              के उद्देश्य से प्रदान की जाती है। परीक्षा की आधिकारिक जानकारी
              के लिए संबंधित परीक्षा संस्था की आधिकारिक वेबसाइट देखें।
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white">सेवाओं में बदलाव</h2>
            <p className="mt-1">
              EduAI Pro किसी भी समय प्लेटफॉर्म की सामग्री, सुविधाओं या
              सेवाओं में बदलाव कर सकता है।
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white">नियमों में बदलाव</h2>
            <p className="mt-1">
              इन नियमों एवं शर्तों को आवश्यकता अनुसार समय-समय पर अपडेट
              किया जा सकता है।
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
