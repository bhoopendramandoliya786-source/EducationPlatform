'use client';
import { useState, useRef, useEffect } from 'react';

function RenderSmartContent({ content, msgIdx, userAnswers, onSelectOption }) {
  const qPattern = /(?:प्रश्न\s*\d+|Q\s*\d+|\d+\.)\s*[:\.]?\s*([^\n]+)[\s\S]*?A\)\s*([^\n]+)[\s\S]*?B\)\s*([^\n]+)[\s\S]*?C\)\s*([^\n]+)[\s\S]*?D\)\s*([^\n]+)[\s\S]*?सही उत्तर\s*[:\.]?\s*([A-D])/gi;
  
  let matches = [...content.matchAll(qPattern)];

  if (matches.length === 0) {
    return <div className="whitespace-pre-wrap leading-relaxed">{content}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">📝 इंटरएक्टिव टेस्ट मोड</span>
        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">विकल्प चुनें</span>
      </div>
      {matches.map((m, qIdx) => {
        const qText = m[1].trim();
        const options = [m[2].trim(), m[3].trim(), m[4].trim(), m[5].trim()];
        const correctLetter = m[6].toUpperCase();
        const correctIdx = correctLetter.charCodeAt(0) - 65;
        const ansKey = `${msgIdx}_${qIdx}`;
        const selectedIdx = userAnswers[ansKey];
        const isAnswered = selectedIdx !== undefined;

        return (
          <div key={qIdx} className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-2.5">
            <p className="font-medium text-slate-100 text-sm">
              {qIdx + 1}. {qText}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {options.map((opt, optIdx) => {
                let btnStyle = 'bg-slate-900 border-slate-800 hover:border-blue-500/50 text-slate-300';
                
                if (isAnswered) {
                  if (optIdx === correctIdx) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold';
                  } else if (selectedIdx === optIdx) {
                    btnStyle = 'bg-red-500/20 border-red-500 text-red-300';
                  } else {
                    btnStyle = 'bg-slate-900/40 border-slate-800/40 text-slate-500';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    disabled={isAnswered}
                    onClick={() => onSelectOption(msgIdx, qIdx, optIdx)}
                    className={`text-left text-xs sm:text-sm p-2.5 rounded-lg border transition flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                    {isAnswered && optIdx === correctIdx && <span className="text-emerald-400 font-bold ml-2">✓ सही</span>}
                    {isAnswered && selectedIdx === optIdx && optIdx !== correctIdx && <span className="text-red-400 font-bold ml-2">✗ गलत</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AiTutorPage() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'नमस्ते! मैं आपका 24/7 AI ट्यूटर हूँ। किसी भी विषय, परीक्षा या प्रश्न से संबंधित अपना डाउट पूछें। आप सवाल लिखकर, बोलकर या फ़ोटो खींचकर भी भेज सकते हैं!' }
  ]);
  const [input, setInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, userAnswers]);

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

  const handleOptionClick = (msgIdx, qIdx, optIdx) => {
    const key = `${msgIdx}_${qIdx}`;
    if (userAnswers[key] !== undefined) return;
    setUserAnswers(prev => ({ ...prev, [key]: optIdx }));
  };

  const sendMessage = async (customText) => {
    const textToSend = customText || input;
    if ((!textToSend.trim() && !imagePreview) || loading) return;

    const currentImg = imagePreview;
    const userMsg = { role: 'user', text: textToSend, image: currentImg };

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

      if (data.answer) {
        setMessages(prev => [...prev, { role: 'ai', text: data.answer }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: data.error || 'उत्तर लोड नहीं हो सका।' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'नेटवर्क एरर! कृपया पुनः प्रयास करें।' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    'राजस्थान प्रजामंडल क्विज़ बनाओ',
    '1857 क्रांति के 5 PYQs बनाओ',
    'राजस्थान का भूगोल क्विज़ बनाओ',
    'गणित शॉर्ट ट्रिक्स'
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto p-2 sm:p-4 text-white">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl mb-2.5 shadow-lg flex items-center justify-between backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-xl text-xl">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white">AI Doubt Solver</h1>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold rounded-full border border-emerald-500/30">FREE 24/7</span>
            </div>
            <p className="text-xs text-slate-400">हर कठिन सवाल और थ्योरी का सटीक समाधान प्राप्त करें।</p>
          </div>
        </div>
      </div>

      {/* Quick Action Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(action)}
            className="text-xs whitespace-nowrap bg-slate-800/90 hover:bg-blue-600/30 border border-slate-700 hover:border-blue-500 px-3 py-1.5 rounded-full transition"
          >
            ⚡ {action}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl shadow-inner">
        {messages.map((m, mIdx) => (
          <div key={mIdx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[94%] sm:max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                  : 'bg-slate-900/95 border border-slate-800 text-slate-200 rounded-bl-none shadow-lg'
              }`}
            >
              {m.image && (
                <div className="mb-3">
                  <img src={m.image} alt="Uploaded Doubt" className="max-h-60 rounded-xl border border-white/20 object-contain" />
                </div>
              )}

              {m.role === 'ai' ? (
                <RenderSmartContent 
                  content={m.text} 
                  msgIdx={mIdx} 
                  userAnswers={userAnswers} 
                  onSelectOption={handleOptionClick} 
                />
              ) : (
                <div className="whitespace-pre-wrap">{m.text}</div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
              <span className="animate-spin text-blue-400">⏳</span> AI समाधान तैयार कर रहा है...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Thumbnail */}
      {imagePreview && (
        <div className="relative mt-2 p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3 max-w-xs">
          <img src={imagePreview} alt="Preview" className="h-12 w-12 object-cover rounded-lg border border-slate-700" />
          <span className="text-xs text-slate-300">फ़ोटो अटैच की गई</span>
          <button
            onClick={() => setImagePreview(null)}
            className="ml-auto text-xs bg-red-500/20 text-red-400 p-1 px-2 rounded-md"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="mt-2 flex items-center gap-2 bg-slate-900/95 border border-slate-800 p-2 rounded-2xl shadow-lg">
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
          title="फ़ोटो अपलोड करें"
        >
          📷
        </button>

        <button
          type="button"
          onClick={handleVoiceInput}
          className={`p-2.5 rounded-xl transition text-base ${
            isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="बोलकर पूछें"
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
          placeholder="अपना सवाल यहाँ लिखें..."
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
