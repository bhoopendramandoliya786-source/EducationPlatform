export const metadata = {
  title: "गोपनीयता नीति",
  description:
    "EduAI Pro की गोपनीयता नीति और वेबसाइट पर जानकारी, कुकीज़ तथा तृतीय-पक्ष सेवाओं के उपयोग की जानकारी।",
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
              EduAI Pro प्लेटफॉर्म की सेवाओं को संचालित करने, उपयोगकर्ता अनुभव
              को बेहतर बनाने और वेबसाइट के प्रदर्शन को समझने के लिए आवश्यक
              जानकारी का उपयोग कर सकता है।
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white">कुकीज़ और Analytics</h2>
            <p className="mt-1">
              वेबसाइट के उपयोग और प्रदर्शन को समझने के लिए तकनीकी कुकीज़ तथा
              Analytics सेवाओं का उपयोग किया जा सकता है। Analytics से प्राप्त
              जानकारी का उपयोग वेबसाइट को बेहतर बनाने के उद्देश्य से किया जाता है।
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white">तृतीय-पक्ष सेवाएँ</h2>
            <p className="mt-1">
              EduAI Pro Google Analytics जैसी विश्वसनीय तृतीय-पक्ष सेवाओं का
              उपयोग कर सकता है। भविष्य में वेबसाइट पर विज्ञापन या अन्य सेवाएँ
              जोड़ी जा सकती हैं, जिनकी अपनी गोपनीयता नीतियाँ हो सकती हैं।
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white">जानकारी की सुरक्षा</h2>
            <p className="mt-1">
              हम वेबसाइट और उपयोगकर्ता जानकारी की सुरक्षा के लिए उचित तकनीकी
              उपाय अपनाने का प्रयास करते हैं। हालांकि इंटरनेट के माध्यम से
              होने वाले किसी भी डेटा संचार की पूर्ण सुरक्षा की गारंटी नहीं दी
              जा सकती।
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white">नीति में बदलाव</h2>
            <p className="mt-1">
              आवश्यकता पड़ने पर इस गोपनीयता नीति को समय-समय पर अपडेट किया जा
              सकता है। किसी भी बदलाव के बाद अपडेट किया गया संस्करण इसी पेज पर
              उपलब्ध कराया जाएगा।
            </p>
          </div>

          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-sm text-slate-400">
            EduAI Pro का उपयोग करके आप इस गोपनीयता नीति में वर्णित नियमों और
            प्रक्रियाओं को समझते हैं।
          </div>
        </div>
      </section>
    </main>
  );
}