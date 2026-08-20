'use client';
import { useState, useRef, useEffect } from 'react';

// Format Markdown text just like ChatGPT (Bold, Bullets, Headers, Code)
function FormattedMessage({ text }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-2 text-sm sm:text-[15px] leading-relaxed text-slate-100 font-sans">
      {lines.map((line, idx) => {
        let trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Horizontal Rule
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={idx} className="my-3 border-slate-800" />;
        }

        // Headers
        if (trimmed.startsWith('### ')) {
          return <h3 key={idx} className="text-base font-bold text-blue-400 mt-3 mb-1">{trimmed.replace('### ', '')}</h3>;
        }
        if (trimmed.startsWith('## ')) {
          return <h2 key={idx} className="text-lg font-bold text-indigo-300 mt-4 mb-1.5">{trimmed.replace('## ', '')}</h2>;
        }
        if (trimmed.startsWith('# ')) {
          return <h1 key={idx} className="text-xl font-extrabold text-white mt-4 mb-2">{trimmed.replace('# ', '')}</h1>;
        }

        // Bullet points
        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ');
        let content = isBullet ? trimmed.substring(2) : trimmed;

        // Parse Bold (**text**)
        const parts = content.split(/(\*\*.*?\*\*)/g);
        const renderedParts = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-semibold text-white">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-blue-400 text-base leading-tight">•</span>
              <div className="flex-1">{renderedParts}</div>
            </div>
          );
        }

        return <p key={idx}>{renderedParts}</p>;
      })}
    </div>
  );
}

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

  return (
    <div className="space-y-4 w-full">
      <div className="bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 border border-blue-500/30 p-4 rounded-2xl flex items-center justify-between shadow-lg backdrop-blur print:hidden">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-blue-200 flex items-center gap-2">
            <span>🎯</span> {quizData.quiz_title || 'इंटरएक्टिव टेस्ट'}
          </h3>
          <p className="text-xs text-slate-400">टच करके सही विकल्प चुनें</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1 shadow"
          >
            📥 PDF
          </button>
          <div className="bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 block uppercase">स्कोर</span>
            <span className="text-sm font-bold text-emerald-400">{correctCount}/{questions.length}</span>
          </div>
        </div>
      </div>

      {questions.map((q, qIdx) => {
        const userChoice = selectedAnswers[qIdx];
        const isAnswered = userChoice !== undefined;

        return (
          <div 
            key={qIdx} 
            className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3 transition shadow-md print:bg-white print:border-b print:border-gray-200 print:text-black"
          >
            <div className="flex items-start gap-2.5">
              <span className="bg-blue-600/30 text-blue-400 text-xs font-bold px-2 py-0.5 rounded-md mt-0.5 print:text-black">
                Q{qIdx + 1}
              </span>
              <p className="font-medium text-slate-100 text-sm leading-relaxed print:text-black">
                {q.question}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1 print:grid-cols-2">
              {q.options.map((opt, optIdx) => {
                let btnClasses = "bg-slate-950/60 border-slate-800 text-slate-200 hover:bg-slate-800/80 hover:border-blue-500/50";

                if (isAnswered) {
                  if (optIdx === q.correctIndex) {
                    btnClasses = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold shadow-sm";
                  } else if (userChoice === optIdx) {
                    btnClasses = "bg-red-500/20 border-red-500 text-red-300 font-semibold";
                  } else {
                    btnClasses = "bg-slate-950/20 border-slate-800/30 text-slate-500 opacity-60";
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(qIdx, optIdx)}
                    disabled={isAnswered}
                    className={`w-full text-left text-xs sm:text-sm p-3 rounded-xl border transition-all flex items-center justify-between ${btnClasses} print:border print:border-gray-300 print:text-black`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center border border-slate-700 text-slate-300 print:border-black print:text-black">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="print:text-black">{opt}</span>
                    </div>
                    {isAnswered && optIdx === q.correctIndex && (
                      <span className="text-emerald-400 font-bold text-xs bg-emerald-500/20 px-2 py-0.5 rounded-md print:text-black">
                        ✓ सही
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="mt-2 p-3 bg-slate-950 border border-blue-900/40 rounded-xl text-xs text-blue-200 print:hidden">
                💡 <span className="font-semibold text-blue-300">व्याख्या: </span>{q.explanation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AiTutorPage() {
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      type: 'text', 
      text: 'नमस्ते! ✨ मैं आपका AI सुपर ट्यूटर हूँ। मुझसे किसी भी विषय, परीक्षा, कोडिंग या सामान्य जिज्ञासा पर बात करें—लिखकर, बोलकर 🎤 या फ़ोटो 📷 खींचकर!' 
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
      setMessages(prev => [...prev, { role: 'ai', type: 'text', text: 'नेटवर्क समस्या। पुनः प्रयास करें।' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    'राजस्थान GK 5 MCQs',
    'मैथ्स शॉर्टकट ट्रिक्स',
    'Rajasthan Prajamandal Tricks',
    'Daily Study Time Table'
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto p-2 sm:p-4 text-white print:p-0 print:max-w-none print:h-auto">
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl mb-2.5 shadow-xl flex items-center justify-between backdrop-blur print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                EduAI Super Intelligence
              </h1>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-semibold rounded-full border border-blue-500/30">
                GPT & Gemini Core
              </span>
            </div>
            <p className="text-xs text-slate-400">स्वाभाविक भाषा • Emojis 🚀 • टच-क्विज़ • फ़ोटो सॉल्वर</p>
          </div>
        </div>
      </div>

      {/* Quick Action Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none print:hidden">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(action)}
            className="text-xs whitespace-nowrap bg-slate-800/90 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500 px-3.5 py-1.5 rounded-full transition shadow-sm"
          >
            ⚡ {action}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl shadow-inner print:border-none print:bg-white print:p-0 print:space-y-2">
        {messages.map((m, mIdx) => (
          <div key={mIdx} className={`flex ${m.role === 'user' ? 'justify-end print:hidden' : 'justify-start print:block'}`}>
            <div
              className={`max-w-[95%] sm:max-w-[88%] rounded-2xl p-4 leading-relaxed ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-md text-sm'
                  : 'bg-slate-900/95 border border-slate-800/90 text-slate-200 rounded-bl-none shadow-lg print:border-none print:bg-white print:p-0 print:text-black'
              }`}
            >
              {m.image && (
                <div className="mb-3">
                  <img src={m.image} alt="Doubt" className="max-h-64 rounded-xl border border-white/20 object-contain" />
                </div>
              )}

              {m.type === 'quiz' ? (
                <InteractiveQuizBox quizData={m.quiz} />
              ) : (
                <FormattedMessage text={m.text} />
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start print:hidden">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none px-4 py-3 text-sm text-slate-300 flex items-center gap-2 shadow-md">
              <span className="animate-spin text-blue-400">✨</span> AI समाधान तैयार कर रहा है...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="relative mt-2 p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3 max-w-xs print:hidden">
          <img src={imagePreview} alt="Preview" className="h-12 w-12 object-cover rounded-lg border border-slate-700" />
          <span className="text-xs text-slate-300 truncate">फ़ोटो अटैच हो गई</span>
          <button onClick={() => setImagePreview(null)} className="ml-auto text-xs bg-red-500/20 text-red-400 p-1 px-2 rounded-md">✕</button>
        </div>
      )}

      {/* Input Bar */}
      <div className="mt-2 flex items-center gap-2 bg-slate-900/95 border border-slate-800 p-2 rounded-2xl shadow-lg print:hidden">
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition" title="फ़ोटो भेजें">📷</button>
        <button type="button" onClick={handleVoiceInput} className={`p-2.5 rounded-xl transition ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`} title="बोलकर पूछें">🎤</button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="ChatGPT / Gemini से कुछ भी पूछें या क्विज़ मांगें..."
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none resize-none px-2 py-1.5 font-sans"
        />
        <button type="button" onClick={() => sendMessage()} disabled={loading || (!input.trim() && !imagePreview)} className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 disabled:opacity-40 text-white rounded-xl transition">🚀</button>
      </div>
    </div>
  );
}
