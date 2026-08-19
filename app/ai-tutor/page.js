'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Bot, Send, Sparkles, Loader2 } from 'lucide-react';

export default function AITutorPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'नमस्ते! मैं आपका 24/7 AI ट्यूटर हूँ। किसी भी विषय, परीक्षा या प्रश्न से संबंधित अपना डाउट पूछें।'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage })
      });

      const data = await res.json();
      if (data.answer) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.answer }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: data.error || 'उत्तर नहीं मिल पाया, पुनः प्रयास करें।' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'नेटवर्क एरर आया। कृपया दोबारा पूछें।' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans pb-20 selection:bg-blue-500/30">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-4">
        <section className="p-5 rounded-3xl bg-gradient-to-r from-purple-900/30 via-slate-900 to-slate-900 border border-purple-500/30 flex items-center gap-3.5 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
              <span>AI Doubt Solver</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                FREE 24/7
              </span>
            </h1>
            <p className="text-xs text-slate-400">हर कठिन सवाल और थ्योरी का सटीक समाधान प्राप्त करें।</p>
          </div>
        </section>

        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-4 sm:p-6 min-h-[420px] max-h-[520px] overflow-y-auto space-y-4 shadow-xl">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[82%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 text-xs text-slate-400 p-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <span>AI उत्तर लिख रहा है...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="relative flex items-center w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="अपना सवाल यहाँ लिखें..."
            className="w-full bg-slate-900/90 border border-slate-800 focus:border-purple-500/60 rounded-2xl py-3.5 pl-4 pr-12 outline-none text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 shadow-lg backdrop-blur-md"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </main>
    </div>
  );
}
