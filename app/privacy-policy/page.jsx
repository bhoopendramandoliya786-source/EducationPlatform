export const metadata = {
  title: "गोपनीयता नीति",
  description: "EduAI Pro की गोपनीयता नीति।",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
        <h1 className="text-2xl font-black text-white">गोपनीयता नीति</h1>

        <div className="mt-5 space-y-5 leading-7 text-slate-300">
          <div>
            <h2 className="font-bold text-white">जानकारी का उपयोग</h2>
            <p className="mt-1">
              EduAI Pro उपयोगकर्ता अनुभव और प्लेटफॉर्म की सेवाओं को बेहतर
              बनाने के लिए आवश्यक जानकारी का उपयोग कर सकता है।
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white">कुकीज़ और Analytics</h2>
            <p className="mt-1">
              वेबसाइट के प्रदर्शन और उपयोग को समझने के लिए Analytics तथा
              आवश्यक तकनीकी कुकीज़ का उपयोग किया जा सकता है।
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white">तृतीय-पक्ष सेवाएँ</h2>
            <p className="mt-1">
              भविष्य में वेबसाइट पर Google Analytics, विज्ञापन या अन्य
              विश्वसनीय तृतीय-पक्ष सेवाओं का उपयोग किया जा सकता है।
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white">नीति में बदलाव</h2>
            <p className="mt-1">
              आवश्यकता पड़ने पर इस गोपनीयता नीति को समय-समय पर अपडेट किया
              जा सकता है।
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
