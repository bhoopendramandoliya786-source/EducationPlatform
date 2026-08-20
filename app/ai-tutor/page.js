cat << 'EOF' > app/ai-tutor/page.js
'use client';
import { useState, useRef, useEffect } from 'react';

function FormattedMessage({ text }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-3 text-sm sm:text-[15px] leading-relaxed text-slate-100 font-sans">
      {lines.map((line, idx) => {
        let trimmed = line.trim();

        if (!trimmed) return <div key={idx} className="h-0.5" />;
        if (trimmed === '---' || trimmed === '***') return <hr key={idx} className="my-3 border-slate-800" />;

        const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imgMatch) {
          const altText = imgMatch[1];
          const imgSrc = imgMatch[2];
          return (
            <div key={idx} className="my-3 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/80 shadow-xl group">
              <img 
                src={imgSrc} 
                alt={altText} 
                className="w-full max-h-80 object-cover transition duration-300 group-hover:scale-[1.01]"
                loading="lazy"
              />
              <div className="p-3 bg-slate-900/90 text-xs text-blue-300 font-medium flex items-center justify-between border-t border-slate-800">
                <span className="flex items-center gap-1.5 truncate"><span>🎨</span> {altText}</span>
                <a 
                  href={imgSrc} 
                  download="EduAI-Image.jpg"
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow"
                >
                  📥 Download HD
                </a>
              </div>
            </div>
          );
        }

        if (trimmed.startsWith('### ')) return <h3 key={idx} className="text-base font-bold text-blue-400 mt-3 mb-1">{trimmed.replace('### ', '')}</h3>;
        if (trimmed.startsWith('## ')) return <h2 key={idx} className="text-lg font-bold text-indigo-300 mt-4 mb-1.5">{trimmed.replace('## ', '')}</h2>;
        if (trimmed.startsWith('# ')) return <h1 key={idx} className="text-xl font-extrabold text-white mt-4 mb-2">{trimmed.replace('# ', '')}</h1>;

        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ');
        let content = isBullet ? trimmed.substring(2) : trimmed;

        const parts = content.split(/(\*\*.*?\*\*)/g);
        const renderedParts = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={pIdx} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
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
          <p className="text-xs text-slate-400">विकल्प पर टच करें</p>
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
          <div key={qIdx} className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3 transition shadow-md print:bg-white print:border-b print:border-gray-200 print:text-black">
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
                      <span className="text-emerald-400 font-bold text-xs bg-emerald-500/20 px-2 py-0.5 rounded-md print:text-black">✓ सही</span>
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
      text: 'नमस्ते! ✨ मैं आपका Google Gemini और ChatGPT पावर्ड AI सुपर असिस्टेंट हूँ। नीचे दिए गए **+ बटन** पर क्लिक करके आप इमेज जनरेट 🎨, PDF नोट्स अपलोड 📄, डीप रिसर्च 🔬 या लाइव कैनवास 📝 शुरू कर सकते हैं!' 
    }
  ]);
  const [input, setInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [attachedDocName, setAttachedDocName] = useState(null);
  const [pdfTextContent, setPdfTextContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [canvasContent, setCanvasContent] = useState('# My Study Notes\n\nयहाँ आप अपने नोट्स या निबंध लिख सकते हैं...');

  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
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
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);
    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

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

  // Safe Image Compression
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
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setImagePreview(compressedBase64);
        setShowPlusMenu(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Document / PDF / Text file Reader
  const handleDocSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAttachedDocName(file.name);
    setShowPlusMenu(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPdfTextContent(event.target.result);
    };
    reader.readAsText(file);
  };

  const sendMessage = async (customText) => {
    const textToSend = customText || input;
    if ((!textToSend.trim() && !imagePreview && !pdfTextContent) || loading) return;

    const currentImg = imagePreview;
    const currentTool = activeTool;
    const currentPdfText = pdfTextContent;
    const docName = attachedDocName;

    const userMsg = { 
      role: 'user', 
      type: currentImg ? 'image' : 'text', 
      text: textToSend || (docName ? `दस्तावेज़ [${docName}] का विश्लेषण करें` : ''), 
      image: currentImg,
      docName: docName
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setImagePreview(null);
    setAttachedDocName(null);
    setPdfTextContent('');
    setActiveTool(null);
    setLoading(true);

    try {
      const res = await fetch('/api/doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: textToSend, 
          image: currentImg,
          pdfText: currentPdfText,
          messagesHistory: newHistory,
          mode: currentTool
        })
      });
      const data = await res.json();

      if (data.quiz) {
        setMessages(prev => [...prev, { role: 'ai', type: 'quiz', quiz: data.quiz }]);
      } else if (data.answer) {
        setMessages(prev => [...prev, { role: 'ai', type: 'text', text: data.answer }]);
        if (currentTool === 'canvas' || showCanvas) {
          setCanvasContent(prev => prev + '\n\n' + data.answer);
        }
      } else {
        setMessages(prev => [...prev, { role: 'ai', type: 'text', text: data.error || 'उत्तर लोड नहीं हो सका।' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', type: 'text', text: 'नेटवर्क समस्या। पुनः प्रयास करें।' }]);
    } finally {
      setLoading(false);
    }
  };

  const geminiMenuTools = [
    { id: 'image', icon: '🎨', label: 'Create image', desc: 'AI चित्र या 4K फ़ोटो बनाएँ' },
    { id: 'doc', icon: '📄', label: 'Upload Notes / File', desc: 'किताब व नोट्स से सवाल पूछें' },
    { id: 'research', icon: '🔬', label: 'Deep Research', desc: 'गहराई से रिसर्च व विस्तृत रिपोर्ट' },
    { id: 'canvas', icon: '📝', label: 'Canvas Workspace', desc: 'लाइव स्प्लिट स्क्रीन नोट्स' },
    { id: 'quiz', icon: '🎯', label: 'Interactive Quiz', desc: 'टच-क्विज़ और टेस्ट बनाएँ' }
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] max-w-7xl mx-auto p-2 sm:p-4 text-white print:p-0 print:max-w-none print:h-auto gap-4">
      {/* Main Chat Area */}
      <div className={`flex flex-col flex-1 h-full transition-all duration-300`}>
        {/* Header */}
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl mb-2.5 shadow-xl flex items-center justify-between backdrop-blur print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  EduAI Super Suite
                </h1>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold rounded-full border border-indigo-500/30">
                  Gemini Tools Live
                </span>
              </div>
              <p className="text-xs text-slate-400">+ टूल्स • इमेज क्रिएटर • फ़ाइल रीडर • कैनवास</p>
            </div>
          </div>

          <button
            onClick={() => setShowCanvas(!showCanvas)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
              showCanvas ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>📝</span> {showCanvas ? 'कैनवास छिपाएँ' : 'कैनवास खोलें'}
          </button>
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

                {m.docName && (
                  <div className="mb-2 p-2 bg-blue-900/40 border border-blue-600/40 rounded-xl text-xs flex items-center gap-2">
                    <span>📄</span> संलग्न फ़ाइल: <strong>{m.docName}</strong>
                  </div>
                )}

                {m.type === 'quiz' ? (
                  <InteractiveQuizBox quizData={m.quiz} />
                ) : (
                  <div>
                    <FormattedMessage text={m.text} />

                    {m.role === 'ai' && m.text && (
                      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-end print:hidden">
                        <button
                          onClick={() => speakText(m.text, mIdx)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 ${
                            speakingIdx === mIdx
                              ? 'bg-red-500/20 border-red-500/50 text-red-300 animate-pulse'
                              : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-300'
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
            <div className="flex justify-start print:hidden">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none px-4 py-3 text-sm text-slate-300 flex items-center gap-2 shadow-md">
                <span className="animate-spin text-blue-400">✨</span> Gemini सुपर इंजन प्रोसेस कर रहा है...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Attachment Previews */}
        {imagePreview && (
          <div className="relative mt-2 p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3 max-w-xs print:hidden">
            <img src={imagePreview} alt="Preview" className="h-12 w-12 object-cover rounded-lg border border-slate-700" />
            <span className="text-xs text-slate-300 truncate">फ़ोटो प्रोसेस हो गई</span>
            <button onClick={() => setImagePreview(null)} className="ml-auto text-xs bg-red-500/20 text-red-400 p-1 px-2 rounded-md">✕</button>
          </div>
        )}

        {attachedDocName && (
          <div className="relative mt-2 p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3 max-w-xs print:hidden">
            <span className="text-xl">📄</span>
            <span className="text-xs text-slate-300 truncate">{attachedDocName}</span>
            <button onClick={() => { setAttachedDocName(null); setPdfTextContent(''); }} className="ml-auto text-xs bg-red-500/20 text-red-400 p-1 px-2 rounded-md">✕</button>
          </div>
        )}

        {/* Active Tool Tag */}
        {activeTool && (
          <div className="mt-2 flex items-center gap-2 text-xs text-blue-300 px-3 py-1.5 bg-blue-900/30 border border-blue-700/40 rounded-xl">
            <span>सक्रिय टूल: <strong>{activeTool.toUpperCase()}</strong></span>
            <button onClick={() => setActiveTool(null)} className="text-red-400 ml-auto font-bold">✕</button>
          </div>
        )}

        {/* Plus Tools Popup Menu */}
        {showPlusMenu && (
          <div className="mb-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl grid grid-cols-2 sm:grid-cols-3 gap-2 animate-fadeIn">
            {geminiMenuTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  if (tool.id === 'doc') {
                    docInputRef.current?.click();
                  } else if (tool.id === 'canvas') {
                    setShowCanvas(true);
                    setActiveTool('canvas');
                    setShowPlusMenu(false);
                  } else {
                    setActiveTool(tool.id);
                    setShowPlusMenu(false);
                  }
                }}
                className="p-3 bg-slate-950/80 hover:bg-indigo-900/30 border border-slate-800 hover:border-indigo-500 rounded-xl text-left transition flex flex-col gap-1"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{tool.icon}</span>
                  <span className="text-xs font-bold text-slate-100">{tool.label}</span>
                </div>
                <span className="text-[10px] text-slate-400 leading-tight">{tool.desc}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="mt-2 flex items-center gap-2 bg-slate-900/95 border border-slate-800 p-2 rounded-2xl shadow-lg print:hidden relative">
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
          <input type="file" accept=".txt,.pdf,.docx,.doc" ref={docInputRef} onChange={handleDocSelect} className="hidden" />

          {/* Google Plus (+) Button for Tools Menu */}
          <button
            type="button"
            onClick={() => setShowPlusMenu(!showPlusMenu)}
            className={`p-2.5 rounded-xl transition text-base font-bold shadow ${
              showPlusMenu ? 'bg-indigo-600 text-white rotate-45' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Gemini Tools"
          >
            ＋
          </button>

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
            placeholder={
              activeTool === 'image' 
                ? "किस चीज़ का चित्र बनाना है? जैसे: 'Taj Mahal at sunset 4k'..."
                : activeTool === 'research'
                  ? "रिसर्च का विषय लिखें (जैसे: 'राजस्थान एकीकरण का संपूर्ण इतिहास')..."
                  : "Google Gemini और ChatGPT से कुछ भी पूछें..."
            }
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none resize-none px-2 py-1.5 font-sans"
          />
          <button type="button" onClick={() => sendMessage()} disabled={loading || (!input.trim() && !imagePreview && !pdfTextContent)} className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 disabled:opacity-40 text-white rounded-xl transition">🚀</button>
        </div>
      </div>

      {/* Side-by-Side Canvas Workspace */}
      {showCanvas && (
        <div className="w-full sm:w-[420px] bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📝</span>
              <h3 className="font-bold text-sm text-slate-100">Live AI Canvas</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const blob = new Blob([canvasContent], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'My-Notes.txt';
                  a.click();
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition"
              >
                💾 Save
              </button>
              <button
                onClick={() => setShowCanvas(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
          <textarea
            value={canvasContent}
            onChange={(e) => setCanvasContent(e.target.value)}
            className="flex-1 w-full bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-slate-200 text-xs sm:text-sm font-mono focus:outline-none resize-none leading-relaxed"
            placeholder="यहाँ अपने नोट्स या कोड लिखें..."
          />
        </div>
      )}
    </div>
  );
}
EOF