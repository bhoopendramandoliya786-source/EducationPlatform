'use client';
import { useState, useRef, useEffect } from 'react';

// Modern Markdown & Image Renderer
function FormattedMessage({ text }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-3 text-[14px] sm:text-[15px] leading-relaxed text-slate-200 font-sans tracking-wide">
      {lines.map((line, idx) => {
        let trimmed = line.trim();

        if (!trimmed) return <div key={idx} className="h-1" />;
        if (trimmed === '---' || trimmed === '***') return <hr key={idx} className="my-4 border-slate-800" />;

        // Image Embed: ![alt](url)
        const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imgMatch) {
          const altText = imgMatch[1];
          const imgSrc = imgMatch[2];
          return (
            <div key={idx} className="my-4 rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-900/90 shadow-2xl group transition-all duration-300 hover:border-indigo-500/50">
              <div className="relative">
                <img 
                  src={imgSrc} 
                  alt={altText} 
                  className="w-full max-h-96 object-cover transition duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
              <div className="p-3.5 bg-slate-900/95 backdrop-blur flex items-center justify-between border-t border-slate-800">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-2 truncate">
                  <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">🎨</span> {altText}
                </span>
                <a 
                  href={imgSrc} 
                  download="EduAI-Image.jpg"
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                >
                  <span>📥</span> डाउनलोड HD
                </a>
              </div>
            </div>
          );
        }

        // Headers
        if (trimmed.startsWith('### ')) return <h3 key={idx} className="text-base font-bold text-indigo-300 mt-3 mb-1">{trimmed.replace('### ', '')}</h3>;
        if (trimmed.startsWith('## ')) return <h2 key={idx} className="text-lg font-extrabold text-blue-400 mt-4 mb-2">{trimmed.replace('## ', '')}</h2>;
        if (trimmed.startsWith('# ')) return <h1 key={idx} className="text-xl font-black text-white mt-4 mb-2 tracking-tight">{trimmed.replace('# ', '')}</h1>;

        // Bullets
        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ');
        let content = isBullet ? trimmed.substring(2) : trimmed;

        // Bold
        const parts = content.split(/(\*\*.*?\*\*)/g);
        const renderedParts = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={pIdx} className="font-semibold text-white bg-white/5 px-1 rounded">{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1">
              <span className="text-indigo-400 font-bold text-sm mt-0.5">•</span>
              <div className="flex-1 text-slate-200">{renderedParts}</div>
            </div>
          );
        }

        return <p key={idx}>{renderedParts}</p>;
      })}
    </div>
  );
}

// Modern Interactive Quiz Component
function InteractiveQuizBox({ quizData, onNextSet }) {
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
      {/* Quiz Top Glass Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 border border-indigo-500/30 p-4 rounded-2xl flex items-center justify-between shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xl">
            🎯
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white">
              {quizData.quiz_title || 'इंटरएक्टिव टेस्ट'}
            </h3>
            <p className="text-xs text-slate-400">टच करके सही विकल्प चुनें</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <span>📥</span> PDF
          </button>
          <div className="bg-slate-950/80 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-center">
            <span className="text-xs font-bold text-indigo-400">{correctCount}/{questions.length}</span>
          </div>
        </div>
      </div>

      {/* Question Cards */}
      {questions.map((q, qIdx) => {
        const userChoice = selectedAnswers[qIdx];
        const isAnswered = userChoice !== undefined;

        return (
          <div key={qIdx} className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700">
            <div className="flex items-start gap-3">
              <span className="px-2.5 py-1 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-lg mt-0.5">
                Q{qIdx + 1}
              </span>
              <p className="font-semibold text-slate-100 text-sm leading-relaxed">
                {q.question}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {q.options.map((opt, optIdx) => {
                let btnClasses = "bg-slate-950/60 border-slate-800/80 text-slate-200 hover:bg-slate-800 hover:border-slate-600";

                if (isAnswered) {
                  if (optIdx === q.correctIndex) {
                    btnClasses = "bg-emerald-950/60 border-emerald-500 text-emerald-300 font-semibold shadow-lg shadow-emerald-900/20";
                  } else if (userChoice === optIdx) {
                    btnClasses = "bg-rose-950/60 border-rose-500 text-rose-300 font-semibold";
                  } else {
                    btnClasses = "bg-slate-950/20 border-slate-800/40 text-slate-500 opacity-50";
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(qIdx, optIdx)}
                    disabled={isAnswered}
                    className={`w-full text-left text-xs sm:text-sm p-3 rounded-xl border transition-all duration-200 flex items-center justify-between ${btnClasses}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center bg-white/5 border border-white/10 text-slate-300">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {isAnswered && optIdx === q.correctIndex && (
                      <span className="text-emerald-400 font-bold text-xs bg-emerald-500/20 px-2 py-0.5 rounded-md">✓ सही</span>
                    )}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="mt-2 p-3 bg-slate-950/90 border border-indigo-900/30 rounded-xl text-xs text-indigo-200/90 flex items-start gap-2">
                <span className="text-indigo-400">💡</span>
                <div><span className="font-bold text-indigo-300">व्याख्या: </span>{q.explanation}</div>
              </div>
            )}
          </div>
        );
      })}

      {answeredCount === questions.length && questions.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <span className="text-sm font-bold text-emerald-300 block">🎉 टेस्ट पूरा हुआ!</span>
            <span className="text-xs text-slate-400">कुल स्कोर: {correctCount} / {questions.length}</span>
          </div>
          <button
            onClick={() => onNextSet && onNextSet(quizData.quiz_title)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
          >
            <span>⚡</span> अगले 5 प्रश्न लोड करें ➔
          </button>
        </div>
      )}
    </div>
  );
}

export default function ModernAiTutorPage() {
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      type: 'text', 
      text: 'नमस्ते! ✨ मैं आपका नेक्स्ट-जेन AI सुपर ट्यूटर हूँ। मुझसे किसी भी विषय पर बात करें, क्विज़ 🎯 खेलें, 4K फोटो 🎨 बनवाएँ या आवाज़ 🔊 में समझें!' 
    }
  ]);
  const [input, setInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [showToolsMenu, setShowToolsMenu] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const speakText = (text, idx) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_~]|!\[.*?\]\(.*?\)/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'hi-IN';
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);
    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('वॉइस इनपुट के लिए क्रोम का उपयोग करें।');
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
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        setImagePreview(canvas.toDataURL('image/jpeg', 0.7));
        setShowToolsMenu(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async (customText, customMode) => {
    const textToSend = customText || input;
    if ((!textToSend.trim() && !imagePreview) || loading) return;

    const currentImg = imagePreview;
    const currentTool = customMode || activeTool;

    const userMsg = { 
      role: 'user', 
      type: currentImg ? 'image' : 'text', 
      text: textToSend, 
      image: currentImg 
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setImagePreview(null);
    setActiveTool(null);
    setLoading(true);

    try {
      const res = await fetch('/api/doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: textToSend, 
          image: currentImg,
          messagesHistory: newHistory,
          mode: currentTool
        })
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

  const modernSuggestions = [
    { title: '🎯 राजस्थान GK क्विज़', prompt: 'राजस्थान GK के 5 महत्वपूर्ण MCQs क्विज़ बनाओ', mode: 'quiz' },
    { title: '🎨 ताज महल 4K फोटो', prompt: 'Taj Mahal sunset ultra realistic 8k photorealistic', mode: 'image' },
    { title: '💡 गणित शॉर्ट ट्रिक्स', prompt: 'प्रतियोगी परीक्षा के लिए समय और कार्य (Time & Work) की शॉर्ट ट्रिक्स समझाओ' },
    { title: '🚀 1857 की क्रांति नोट्स', prompt: '1857 की क्रांति के मुख्य कारण और परिणाम सरल नोट्स में बताओ' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-5xl mx-auto p-2 sm:p-4 text-slate-100 print:p-0 print:max-w-none">

      {/* 2026 Ultra-Header */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-3.5 sm:p-4 rounded-2xl mb-3 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/25 animate-pulse">
              ✨
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                EduAI 2026 Core
              </h1>
              <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold rounded-full">
                Gemini & GPT-4o
              </span>
            </div>
            <p className="text-xs text-slate-400">अल्ट्रा-फास्ट रीजनिंग • टच-क्विज़ • 4K AI इमेजेस</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([{ role: 'ai', type: 'text', text: 'नमस्ते! नया सत्र शुरू हो गया है। आप क्या पूछना चाहते हैं?' }])}
          className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold rounded-xl text-slate-300 transition flex items-center gap-1.5 shadow-sm"
        >
          <span>🔄</span> न्यू चैट
        </button>
      </div>

      {/* Suggestion Chips (Hero Section on First Load) */}
      {messages.length === 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 animate-fadeIn">
          {modernSuggestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(item.prompt, item.mode)}
              className="p-3 bg-slate-900/60 hover:bg-indigo-950/40 border border-slate-800/90 hover:border-indigo-500/50 rounded-2xl text-left transition shadow-md group"
            >
              <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 block mb-1">
                {item.title}
              </span>
              <span className="text-[11px] text-slate-400 line-clamp-1">
                {item.prompt}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main Messages Window */}
      <div className="flex-1 overflow-y-auto space-y-4 p-3 sm:p-4 bg-slate-950/60 border border-slate-900 rounded-3xl shadow-inner backdrop-blur-sm">
        {messages.map((m, mIdx) => (
          <div key={mIdx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[95%] sm:max-w-[85%] rounded-3xl p-4 sm:p-5 shadow-xl ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white rounded-br-none'
                  : 'bg-slate-900/90 border border-slate-800/90 text-slate-200 rounded-bl-none'
              }`}
            >
              {m.image && (
                <div className="mb-3">
                  <img src={m.image} alt="Upload" className="max-h-64 rounded-2xl border border-white/10 object-contain shadow-md" />
                </div>
              )}

              {m.type === 'quiz' ? (
                <InteractiveQuizBox 
                  quizData={m.quiz} 
                  onNextSet={(title) => sendMessage(`अगले 5 प्रश्न और बनाओ: ${title}`, 'quiz')} 
                />
              ) : (
                <div>
                  <FormattedMessage text={m.text} />

                  {m.role === 'ai' && m.text && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-end">
                      <button
                        onClick={() => speakText(m.text, mIdx)}
                        className={`text-xs px-3 py-1 rounded-xl border transition flex items-center gap-1.5 ${
                          speakingIdx === mIdx
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                            : 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        <span>{speakingIdx === mIdx ? '⏹️ बंद करें' : '🔊 बोलकर सुनाओ'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-bl-none px-4 py-3 text-xs sm:text-sm text-slate-300 flex items-center gap-2.5 shadow-xl">
              <span className="animate-spin text-indigo-400">✨</span> AI सुपर दिमाग प्रोसेस कर रहा है...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview if selected */}
      {imagePreview && (
        <div className="relative mt-2 p-2 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center gap-3 max-w-xs shadow-lg">
          <img src={imagePreview} alt="Preview" className="h-12 w-12 object-cover rounded-xl border border-slate-700" />
          <span className="text-xs text-slate-300 truncate">फ़ोटो अटैच हो गई</span>
          <button onClick={() => setImagePreview(null)} className="ml-auto text-xs bg-rose-500/20 text-rose-400 p-1 px-2 rounded-lg">✕</button>
        </div>
      )}

      {/* Floating Tools Sheet */}
      {showToolsMenu && (
        <div className="mb-2 p-3 bg-slate-900/95 border border-slate-800/90 rounded-2xl shadow-2xl backdrop-blur-xl flex gap-2 animate-fadeIn">
          <button
            onClick={() => { setActiveTool('image'); setShowToolsMenu(false); }}
            className="flex-1 p-2.5 bg-slate-950/80 hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-left transition flex flex-col gap-1"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🎨</span>
              <span className="text-xs font-bold text-white">Create 4K Image</span>
            </div>
            <span className="text-[10px] text-slate-400">टेक्स्ट से सुंदर AI चित्र बनाएँ</span>
          </button>

          <button
            onClick={() => { setActiveTool('quiz'); setShowToolsMenu(false); }}
            className="flex-1 p-2.5 bg-slate-950/80 hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-left transition flex flex-col gap-1"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span className="text-xs font-bold text-white">Interactive Quiz</span>
            </div>
            <span className="text-[10px] text-slate-400">टच-बटन वाला टेस्ट पेपर</span>
          </button>
        </div>
      )}

      {/* Ultra-Modern Floating Input Bar */}
      <div className="mt-2.5 flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 p-2 rounded-2xl shadow-2xl">
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />

        <button
          type="button"
          onClick={() => setShowToolsMenu(!showToolsMenu)}
          className={`p-2.5 rounded-xl transition text-base font-bold ${
            showToolsMenu ? 'bg-indigo-600 text-white rotate-45' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
          }`}
          title="Tools Menu"
        >
          ＋
        </button>

        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition" title="फ़ोटो अपलोड">📷</button>
        <button type="button" onClick={handleVoiceInput} className={`p-2.5 rounded-xl transition ${isListening ? 'bg-rose-500 animate-pulse text-white' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'}`} title="बोलकर पूछें">🎤</button>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={activeTool === 'image' ? "किस चीज़ का 4K चित्र बनाना है?..." : "ChatGPT / Gemini से कुछ भी पूछें..."}
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none resize-none px-2 py-1.5 font-sans"
        />

        <button 
          type="button" 
          onClick={() => sendMessage()} 
          disabled={loading || (!input.trim() && !imagePreview)} 
          className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-40 text-white rounded-xl transition shadow-lg shadow-indigo-600/25"
        >
          🚀
        </button>
      </div>

    </div>
  );
}