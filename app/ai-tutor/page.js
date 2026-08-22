'use client';
import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';

export default function AITutorPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'नमस्ते! मैं आपका AI ट्यूटर हूँ। राजस्थान GK या किसी भी विषय से जुड़ा अपना डाउट पूछें।' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg, { role: 'assistant', text: `"${input}" पर विस्तृत नोट्स और व्याख्या तैयार की जा रही है...` }]);
    setInput('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 flex flex-col h-[calc(100vh-140px)] justify-between">
      <div className="space-y-3 overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`p-3.5 rounded-2xl text-xs ${m.role === 'user' ? 'bg-indigo-600 text-white ml-auto max-w-[80%]' : 'bg-slate-900 border border-slate-800 text-slate-200 max-w-[85%]'}`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="pt-2 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="अपना सवाल यहाँ लिखें..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
        />
        <button onClick={handleSend} className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white active:scale-95 transition">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
