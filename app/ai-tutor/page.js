"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Send, ArrowLeft, Bot, User, BookOpen, Flame } from "lucide-react";

export default function AITutorPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "नमस्ते! मैं आपका 24/7 AI परीक्षा साथी हूँ। राजस्थान GK, इतिहास, भूगोल, राजनीति, विज्ञान या किसी भी विषय में अपना सवाल पूछें।"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.answer || "उत्तर तैयार नहीं हो सका।" }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: `${userMessage} से संबंधित मुख्य परीक्षा बिंदु:

• यह राजस्थान प्रतियोगी परीक्षाओं (RAS/REET/CET) के लिए महत्वपूर्ण टॉपिक है।
• कृपया विस्तृत जानकारी के लिए होमपेज पर संबंधित विषय के स्मार्ट नोट्स देखें।`
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `${userMessage} का मुख्य सारांश:

यह टॉपिक परीक्षा में बार-बार पूछा जाता है। इस विषय के सभी अध्यायों और 50 MCQs के लिए होमपेज से विषय सूची देखें।`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 flex flex-col h-[calc(100vh-135px)] justify-between space-y-3">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between pt-1">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="w-3.5 h-3.5" /> होम
        </Link>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> AI Live Doubt Engine
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-md shadow-indigo-500/30">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`p-4 rounded-3xl text-xs leading-relaxed max-w-[85%] whitespace-pre-line shadow-sm ${
                m.role === "user"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none"
                  : "bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none"
              }`}
            >
              {m.text}
            </div>
            {m.role === "user" && (
              <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 items-center text-xs text-slate-400 animate-pulse">
            <div className="w-7 h-7 rounded-xl bg-indigo-600/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            AI उत्तर तैयार कर रहा है...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="pt-2 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="डाउट या सवाल यहाँ लिखें (उदा. 1857 की क्रांति के कारण)..."
          className="flex-1 px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold active:scale-95 disabled:opacity-50 transition shadow-lg shadow-indigo-500/25 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
