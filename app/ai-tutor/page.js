"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Send, Sparkles, User, CheckCircle2, Zap } from "lucide-react";

/* =======================================================
   QUIZ CARD (EMERALD LUXE)
======================================================= */
function QuizCard({ quiz }) {
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const questions = Array.isArray(quiz?.questions)
    ? quiz.questions.slice(0, 20)
    : [];

  const score = questions.reduce((total, q) => {
    return total + (selected[q.id] === q.correctIndex ? 1 : 0);
  }, 0);

  if (!questions.length) {
    return <div className="text-slate-400 text-xs">Quiz तैयार नहीं हो सका।</div>;
  }

  const answeredCount = Object.keys(selected).length;

  return (
    <div className="space-y-3 font-sans">
      {/* Quiz Header */}
      <div className="rounded-2xl bg-slate-950/80 border border-emerald-500/30 p-3.5 space-y-1">
        <div className="text-sm font-black text-white flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{quiz.quiz_title || "EduAI इंटरएक्टिव क्विज़"}</span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>कुल {questions.length} प्रश्न</span>
          {!submitted && (
            <span className="text-emerald-400 font-bold">
              हल: {answeredCount}/{questions.length}
            </span>
          )}
        </div>
      </div>

      {/* Questions */}
      {questions.map((q, index) => {
        const questionId = q.id ?? index;

        return (
          <div
            key={questionId}
            className="rounded-2xl bg-slate-950/90 border border-slate-800 p-3.5 space-y-2.5"
          >
            <div className="text-xs sm:text-sm font-bold text-slate-100 leading-relaxed">
              {index + 1}. {q.question}
            </div>

            <div className="space-y-1.5">
              {(Array.isArray(q.options) ? q.options : []).map((option, optionIndex) => {
                const isSelected = selected[questionId] === optionIndex;
                const isCorrect = submitted && optionIndex === q.correctIndex;
                const isWrong = submitted && isSelected && optionIndex !== q.correctIndex;

                let optStyle = "bg-slate-900 border-slate-800 text-slate-300 hover:border-emerald-500/40";
                if (isCorrect) optStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                else if (isWrong) optStyle = "bg-rose-500/20 border-rose-500 text-rose-300 line-through";
                else if (isSelected) optStyle = "bg-emerald-500/15 border-emerald-500 text-emerald-200 font-bold";

                return (
                  <button
                    key={optionIndex}
                    type="button"
                    disabled={submitted}
                    onClick={() =>
                      setSelected((prev) => ({
                        ...prev,
                        [questionId]: optionIndex,
                      }))
                    }
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between ${optStyle}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-[10px] font-black shrink-0">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {submitted && q.explanation && (
              <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/20 p-2.5 text-[11px] text-emerald-200 leading-relaxed">
                💡 {q.explanation}
              </div>
            )}
          </div>
        );
      })}

      {/* Submit / Score */}
      {!submitted ? (
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition cursor-pointer"
        >
          ✅ उत्तर जमा करें
        </button>
      ) : (
        <div className="rounded-2xl bg-slate-900/90 border border-emerald-500/30 p-4 text-center space-y-1">
          <div className="text-xs font-bold text-slate-400">आपका स्कोर</div>
          <div className="text-2xl font-black text-emerald-400">
            {score}/{questions.length}
          </div>
          <div className="text-[11px] text-slate-300 font-medium">
            {score === questions.length
              ? "🔥 शानदार! सभी उत्तर सही हैं।"
              : score >= Math.ceil(questions.length * 0.7)
              ? "👏 बहुत बढ़िया अभ्यास!"
              : "💪 नियमित अभ्यास से स्कोर और बेहतर होगा।"}
          </div>
        </div>
      )}
    </div>
  );
}

/* =======================================================
   MESSAGE CONTENT
======================================================= */
function MessageContent({ text, image }) {
  if (image) {
    return (
      <div className="space-y-2">
        <img
          src={image}
          alt="EduAI Generated Image"
          loading="lazy"
          className="block w-full max-w-lg mx-auto rounded-2xl border border-slate-800 shadow-xl object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        {text && <div className="whitespace-pre-wrap break-words text-xs text-slate-400">{text}</div>}
      </div>
    );
  }

  if (!text) return null;

  const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = imageRegex.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index);
    if (before) parts.push({ type: "text", content: before });
    parts.push({ type: "image", alt: match[1], url: match[2] });
    lastIndex = match.index + match[0].length;
  }

  const remaining = text.slice(lastIndex);
  if (remaining) parts.push({ type: "text", content: remaining });

  if (!parts.length) {
    return <div className="whitespace-pre-wrap break-words">{text}</div>;
  }

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.type === "image") {
          return (
            <img
              key={index}
              src={part.url}
              alt={part.alt || "EduAI Generated Image"}
              loading="lazy"
              className="block w-full max-w-lg mx-auto rounded-2xl border border-slate-800 shadow-xl object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          );
        }
        return (
          <div key={index} className="whitespace-pre-wrap break-words leading-relaxed">
            {part.content}
          </div>
        );
      })}
    </div>
  );
}

/* =======================================================
   MAIN AI TUTOR PAGE
======================================================= */
export default function AITutorPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "नमस्ते! 👋\n\nमैं आपका 24x7 EduAI Pro ट्यूटर हूँ। आप मुझसे राजस्थान GK, प्रतियोगी परीक्षाओं, गणित, विज्ञान या किसी भी कठिन सवाल का हल पूछ सकते हैं।\n\n📝 क्विज़ बनाएँ: \"मेवाड़ इतिहास पर 5 प्रश्न बनाओ\"\n🖼️ चित्र देखें: \"हवामहल की फोटो दिखाओ\"\n\nअपना सवाल नीचे पूछिए!",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const addMessage = (role, text, extra = {}) => {
    setMessages((prev) => [...prev, { role, text, ...extra }]);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setInput("");
    addMessage("user", question);
    setLoading(true);

    try {
      const history = messages.slice(-8).map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        text: typeof msg.text === "string" ? msg.text : "",
      }));

      const res = await fetch("/api/doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, messagesHistory: history }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "AI उत्तर नहीं दे पाया।");

      if (data?.quiz && Array.isArray(data.quiz.questions) && data.quiz.questions.length) {
        addMessage("assistant", "", { quiz: data.quiz });
        return;
      }

      if (data?.image) {
        addMessage("assistant", data?.answer || "", { image: data.image });
        return;
      }

      if (typeof data?.answer === "string" && data.answer.trim()) {
        addMessage("assistant", data.answer);
        return;
      }

      throw new Error("AI से खाली उत्तर मिला।");
    } catch (error) {
      console.error("AI Tutor Error:", error);
      addMessage(
        "assistant",
        "माफ़ कीजिए 😕 अभी AI से उत्तर नहीं मिल पाया। कृपया थोड़ी देर बाद पुनः प्रयास करें।"
      );
    } finally {
      setLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <main className="min-h-screen bg-[#06090e] text-white flex flex-col font-sans select-none">

      {/* Top Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-[#06090e]/95 backdrop-blur-xl shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>होम</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
            <Sparkles className="w-4 h-4 fill-slate-950" />
          </div>
          <div>
            <div className="text-xs font-black tracking-tight flex items-center gap-1">
              <span>EduAI Pro</span>
              <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">AI</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ऑनलाइन ट्यूटर
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <section aria-label="AI चैट" className="flex-1 min-h-0 overflow-y-auto py-4 px-3 sm:px-4 pb-36 overscroll-contain">
        <div className="max-w-2xl mx-auto space-y-3.5">
          {messages.map((message, index) => {
            const isUser = message.role === "user";

            return (
              <div
                key={index}
                className={`flex gap-2.5 items-end ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold rounded-br-xs shadow-emerald-500/10"
                      : "bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-xs"
                  }`}
                >
                  {message.quiz ? (
                    <QuizCard quiz={message.quiz} />
                  ) : (
                    <MessageContent text={message.text} image={message.image} />
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 shrink-0 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                    <User className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-end gap-2.5">
              <div className="w-7 h-7 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <span>EduAI विश्लेषण कर रहा है...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} className="h-1" />
        </div>
      </section>

      {/* Fixed Bottom Input */}
      <div className="fixed left-0 right-0 bottom-0 z-50 px-3 pb-3 pt-2 bg-[#06090e]/90 backdrop-blur-xl border-t border-slate-800/80">
        <form onSubmit={handleSend} className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl focus-within:border-emerald-500/50 transition">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              autoComplete="off"
              enterKeyHint="send"
              placeholder="कोई भी प्रश्न पूछें (उदा. राजस्थान के लोक देवता)..."
              className="flex-1 min-w-0 h-10 bg-transparent px-3 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="सवाल भेजें"
              className="w-10 h-10 shrink-0 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center disabled:opacity-30 active:scale-95 transition shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center text-[10px] text-slate-500 mt-1">
            EduAI Pro • 24x7 AI शंका समाधान
          </div>
        </form>
      </div>

    </main>
  );
}