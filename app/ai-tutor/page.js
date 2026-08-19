'use client';
import { useState, useRef, useEffect } from 'react';

// Touchable Interactive Quiz Component with PDF export
function InteractiveQuizBox({ quizData }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const questions = quizData.questions || [];

  const handleSelect = (qIdx, optIdx) => {
    if (selectedAnswers[qIdx] !== undefined) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = Object.entries(selectedAnswers).filter(
    ([qIdx, optIdx]) => optIdx === questions[qIdx]?.correctIndex
  ).length;

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-4 w-full print:text-black">
      {/* Quiz Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/60 to-purple-900/60 border border-blue-500/30 p-3.5 rounded-2xl flex items-center justify-between shadow-md print:border-none print:bg-none">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-blue-200 print:text-black">
            🎯 {quizData.quiz_title || 'इंटरएक्टिव टेस्ट'}
          </h3>
          <p className="text-[11px] text-slate-400 print:hidden">विकल्प पर टच करें और तुरंत परिणाम देखें</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            className="px-2.5 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 text-xs font-semibold rounded-xl transition flex items-center gap-1 print:hidden"
            title="PDF में सेव करें"
          >
            📥 PDF
          </button>
          <div className="bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-xl text-center print:border-black">
            <span className="text-[10px] text-slate-400 block uppercase print:text-black">स्कोर</span>
            <span className="text-sm font-bold text-emerald-400 print:text-black">{correctCount} / {questions.length}</span>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {questions.map((q, qIdx) => {
        const userChoice = selectedAnswers[qIdx];
        const isAnswered = userChoice !== undefined;
        const isCorrect = userChoice === q.correctIndex;

        return (
          <div 
            key={qIdx} 
            className="bg-slate-950/90 border border-slate-800/90 p-4 rounded-2xl space-y-3 transition shadow-md print:bg-white print:border-gray-300 print:text-black"
          >
            <div className="flex items-start gap-2.5">
              <span className="bg-blue-600/30 text-blue-400 text-xs font-bold px-2 py-0.5 rounded-md mt-0.5 print:bg-gray-200 print:text-black">
                Q{qIdx + 1}
              </span>
              <p className="font-medium text-slate-100 text-sm leading-snug print:text-black">
                {q.question}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {q.options.map((opt, optIdx) => {
                let btnClasses = "bg-slate-900/80 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-blue-500/60";

                if (isAnswered) {
                  if (optIdx === q.correctIndex) {
                    btnClasses = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold shadow-sm";
                  } else if (userChoice === optIdx) {
                    btnClasses = "bg-red-500/20 border-red-500 text-red-300 font-semibold";
                  } else {
                    btnClasses = "bg-slate-900/30 border-slate-800/30 text-slate-500 opacity-60";
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(qIdx, optIdx)}
                    disabled={isAnswered}
                    className={`w-full text-left text-xs sm:text-sm p-3 rounded-xl border transition-all flex items-center justify-between ${btnClasses} print:border-gray-400 print:text-black`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center border ${
                        isAnswered && optIdx === q.correctIndex 
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : isAnswered && userChoice === optIdx 
                            ? 'bg-red-500 border-red-400 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-300 print:bg-gray-100 print:text-black'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {isAnswered && optIdx === q.correctIndex && (
                      <span className="text-emerald-400 font-bold text-xs bg-emerald-500/20 px-2 py-0.5 rounded-md print:text-black">
                        ✓ सही उत्तर
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="mt-2 p-3 bg-slate-900/90 border border-blue-900/40 rounded-xl text-xs text-blue-200 flex items-start gap-2 print:bg-gray-100 print:text-black">
                <span className="text-sm">💡</span>
                <div>
                  <span className="font-semibold text-blue-300 print:text-black">व्याख्या: </span>
                  {q.explanation}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {answeredCount === questions.length && questions.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border border-emerald-500/40 p-4 rounded-2xl text-center space-y-2 print:hidden">
          <p className="text-base font-bold text-emerald-300">🎉 टेस्ट पूरा हुआ!</p>
          <p className="text-xs text-slate-300">
            स्कोर: <span className="font-bold text-emerald-400">{correctCount}</span> / {questions.length}
          </p>
          <button
            onClick={handleDownloadPDF}
            className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow transition"
          >
            📥 टेस्ट और उत्तर की PDF डाउनलोड करें
          </button>
        </div>
      )}
    </div>
  );
}

export default function AiTutorPage() {
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      type: 'text', 
      text: 'नमस्ते! मैं आपका 24/7 AI ट्यूटर हूँ। मुझसे कोई भी सवाल पूछें, बोलकर या फ़ोटो भेजकर डाउट क्लियर करें, या किसी भी विषय की टच/क्लिक वाली क्विज़ खेलकर PDF डाउनलोड करें!' 
    }
  ]);
  const [input, setInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('वॉइस इनपुट के लिए क्रोम ब्राउज़र का उपयोग करें।');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };
    recognition.start();
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async (customText) => {
    const textToSend = customText || input;
    if ((!textToSend.trim() && !imagePreview) || loading) return;

    const currentImg = imagePreview;
    const userMsg = { 
      role: 'user', 
      type: currentImg ? 'image' : 'text', 
      text: textToSend, 
      image: currentImg 
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setImagePreview(null);
    setLoading(true);

    try {
      const res = await fetch('/api/doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend, image: currentImg })
      });
      const data = await res.json();

      if (data.quiz) {
        setMessages(prev => [...prev, { role: 'ai', type: 'quiz', quiz: data.quiz }]);
      } else if (data.answer) {
        setMessages(prev => [...prev, { role: 'ai', type: 'text', text: data.answer }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', type: 'text', text: data.error || 'उत्तर लोड नहीं हो सका।' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', type: 'text', text: 'नेटवर्क एरर! कृपया पुनः प्रयास करें।' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    'राजस्थान प्रजामंडल क्विज़ बनाओ',
    '1857 क्रांति के 5 MCQs बनाओ',
    'राजस्थान का भूगोल टेस्ट',
    'गणित शॉर्ट ट्रिक्स'
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto p-2 sm:p-4 text-white">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl mb-2.5 shadow-lg flex items-center justify-between backdrop-blur print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-purple-600 text-white rounded-xl text-lg shadow-md">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white">AI Doubt Solver & Quiz Master</h1>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold rounded-full border border-emerald-500/30">
                LIVE 24/7
              </span>
            </div>
            <p className="text-xs text-slate-400">टच-क्विज़ खेलें • PDF डाउनलोड करें • असीमित सवाल पूछें</p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-xl flex items-center gap-1.5 transition"
          title="पूरी चैट PDF में सेव करें"
        >
          📄 Save PDF
        </button>
      </div>

      {/* Quick Action Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none print:hidden">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(action)}
            className="text-xs whitespace-nowrap bg-slate-800/90 hover:bg-blue-600/30 border border-slate-700 hover:border-blue-500 px-3 py-1.5 rounded-full transition shadow-sm"
          >
            ⚡ {action}
          </button>
        ))}
      </div>

      {/* Chat / Quiz Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl shadow-inner print:border-none print:bg-white print:text-black">
        {messages.map((m, mIdx) => (
          <div key={mIdx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} print:block print:mb-4`}>
            <div
              className={`max-w-[95%] sm:max-w-[88%] rounded-2xl p-4 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-md print:bg-gray-100 print:text-black'
                  : 'bg-slate-900/95 border border-slate-800 text-slate-200 rounded-bl-none shadow-lg print:bg-white print:text-black print:border-none'
              }`}
            >
              {m.image && (
                <div className="mb-3">
                  <img src={m.image} alt="Doubt Attachment" className="max-h-60 rounded-xl border border-white/20 object-contain" />
                </div>
              )}

              {m.type === 'quiz' ? (
                <InteractiveQuizBox quizData={m.quiz} />
              ) : (
                <div className="whitespace-pre-wrap">{m.text}</div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start print:hidden">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
              <span className="animate-spin text-blue-400">⏳</span> AI उत्तर तैयार कर रहा है...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="relative mt-2 p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3 max-w-xs print:hidden">
          <img src={imagePreview} alt="Preview" className="h-12 w-12 object-cover rounded-lg border border-slate-700" />
          <span className="text-xs text-slate-300">फ़ोटो अटैच हो गई</span>
          <button
            onClick={() => setImagePreview(null)}
            className="ml-auto text-xs bg-red-500/20 text-red-400 p-1 px-2 rounded-md"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="mt-2 flex items-center gap-2 bg-slate-900/95 border border-slate-800 p-2 rounded-2xl shadow-lg print:hidden">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-base"
          title="फ़ोटो खींचें या चुनें"
        >
          📷
        </button>

        <button
          type="button"
          onClick={handleVoiceInput}
          className={`p-2.5 rounded-xl transition text-base ${
            isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="बोलकर सवाल पूछें"
        >
          🎤
        </button>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="सवाल पूछें या 'प्रजामंडल क्विज़ बनाओ' लिखें..."
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none resize-none px-2 py-1.5"
        />

        <button
          type="button"
          onClick={() => sendMessage()}
          disabled={loading || (!input.trim() && !imagePreview)}
          className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition text-base"
        >
          🚀
        </button>
      </div>
    </div>
  );
}
