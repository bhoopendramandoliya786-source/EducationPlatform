export const metadata = {
  title: "संपर्क करें",
  description:
    "EduAI Pro से संपर्क करें। सुझाव, समस्याओं और प्लेटफॉर्म से संबंधित जानकारी के लिए हमसे जुड़ें।",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
        <h1 className="text-2xl font-black text-white">संपर्क करें</h1>

        <div className="mt-5 space-y-4 leading-7 text-slate-300">
          <p>
            EduAI Pro से संबंधित सुझाव, समस्या, सामग्री या अन्य जानकारी के
            लिए आप हमसे संपर्क कर सकते हैं।
          </p>

          <p>
            हम विद्यार्थियों के सुझावों का स्वागत करते हैं और प्लेटफॉर्म को
            बेहतर बनाने का लगातार प्रयास करते हैं।
          </p>

          <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <h2 className="font-bold text-white">ईमेल से संपर्क करें</h2>

            <a
              href="mailto:eduaipro2@gmail.com"
              className="mt-2 inline-block text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              eduaipro2@gmail.com
            </a>

            <p className="mt-3 text-sm text-slate-400">
              कृपया अपने संदेश में विषय और समस्या या सुझाव की जानकारी स्पष्ट
              रूप से लिखें।
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}