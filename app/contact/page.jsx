export const metadata = {
  title: "संपर्क करें",
  description: "EduAI Pro से संपर्क करने की जानकारी।",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
        <h1 className="text-2xl font-black text-white">संपर्क करें</h1>

        <div className="mt-5 space-y-4 leading-7 text-slate-300">
          <p>
            EduAI Pro से संबंधित सुझाव, समस्या या अन्य जानकारी के लिए
            आप हमसे संपर्क कर सकते हैं।
          </p>

          <p>
            हम प्लेटफॉर्म को विद्यार्थियों के लिए बेहतर बनाने के लिए
            आपके सुझावों का स्वागत करते हैं।
          </p>

          <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <p className="text-sm text-slate-400">
              संपर्क की जानकारी जल्द यहाँ उपलब्ध कराई जाएगी।
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
