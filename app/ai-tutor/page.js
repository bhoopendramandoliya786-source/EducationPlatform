"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Send, Sparkles, User } from "lucide-react";

export default function AITutorPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "नमस्ते! 👋 मैं आपका AI परीक्षा साथी हूँ।\n\nराजस्थान GK, इतिहास, भूगोल, विज्ञान, राजनीति या किसी भी विषय का सवाल पूछिए।",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const addMessage = (role, text, extra = {}) => {
    setMessages((prev) => [
      ...prev,
      {
        role,
        text,
        ...extra,
      },
    ]);
  };

  const handleSend = async (e) => {
    e?.preventDefault();

    const question = input.trim();

    if (!question || loading) return;

    setInput("");

    addMessage("user", question);
    setLoading(true);

    try {
      const history = messages
        .slice(-6)
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await fetch("/api/doubt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          messagesHistory: history,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "AI उत्तर नहीं दे पाया।");
      }

      // Quiz response
      if (data?.quiz?.questions?.length) {
        addMessage("assistant", "", {
          quiz: data.quiz,
        });

        return;
      }

      // Normal AI response
      if (data?.answer) {
        addMessage("assistant", data.answer);
        return;
      }

      throw new Error("AI से खाली उत्तर मिला।");
    } catch (error) {
      console.error("AI Tutor Error:", error);

      addMessage(
        "assistant",
        `माफ़ कीजिए भाई 😕 अभी AI से उत्तर नहीं मिल पाया।\n\nकृपया थोड़ी देर बाद फिर कोशिश करें।`
      );
    } finally {
      setLoading(false);
    }
  };

  const renderText = (text) => {
    if (!text) return null;

    // Image markdown को actual image में बदलना
    const imageMatch = text.match(/!\[.*?\]\((https?:\/\/[^)]+)\)/);

    if (imageMatch) {
      const imageUrl = imageMatch[1];

      const remainingText = text
        .replace(imageMatch[0], "")
        .trim();

      return (
        <div className="space-y-3">
          {remainingText && (
            <div className="whitespace-pre-line">{remainingText}</div>
          )}

          <img
            src={imageUrl}
            alt="AI द्वारा बनाई गई तस्वीर"
            className="w-full rounded-2xl border border-slate-700 shadow-lg"
          />
        </div>
      );
    }

    return <div className="whitespace-pre-line">{text}</div>;
  };

  const QuizCard = ({ quiz }) => {
    const [selected, setSelected] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const questions = Array.isArray(quiz?.questions)
      ? quiz.questions
      : [];

    const score = questions.reduce((total, q) => {
      return total + (selected[q.id] === q.correctIndex ? 1 : 0);
    }, 0);

    return (
      <div className="space-y-4">
        <div className="font-bold text-base text-white">
          {quiz.quiz_title || "📝 AI Quiz"}
        </div>

        {questions.map((q, index) => (
          <div
            key={q.id || index}
            className="rounded-2xl bg-slate-950/70 border border-slate-700 p-3"
          >
            <div className="font-semibold text-slate-100 mb-3">
              {index + 1}. {q.question}
            </div>

            <div className="space-y-2">
              {q.options?.map((option, optionIndex) => {
                const isSelected = selected[q.id] === optionIndex;
                const isCorrect =
                  submitted && optionIndex === q.correctIndex;
                const isWrong =
                  submitted &&
                  isSelected &&
                  optionIndex !== q.correctIndex;

                return (
                  <button
                    key={optionIndex}
                    type="button"
                    disabled={submitted}
                    onClick={() =>
                      setSelected((prev) => ({
                        ...prev,
                        [q.id]: optionIndex,
                      }))
                    }
                    className={`w-full text-left p-3 rounded-xl border text-sm transition ${
                      isCorrect
                        ? "bg-green-500/20 border-green-500 text-green-300"
                        : isWrong
                        ? "bg-red-500/20 border-red-500 text-red-300"
                        : isSelected
                        ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                        : "bg-slate-900 border-slate-700 text-slate-300 hover:border-indigo-500"
                    }`}
                  >
                    {String.fromCharCode(65 + optionIndex)}. {option}
                  </button>
                );
              })}
            </div>

            {submitted && q.explanation && (
              <div className="mt-3 text-xs text-slate-400 bg-slate-900 rounded-xl p-3">
                💡 {q.explanation}
              </div>
            )}
          </div>
        ))}

        {!submitted ? (
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold"
          >
            ✅ उत्तर जमा करें
          </button>
        ) : (
          <div className="text-center p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold">
            🎯 आपका स्कोर: {score}/{questions.length}
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-[calc(100vh-120px)] max-w-2xl mx-auto px-3 sm:px-4 pb-3 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between py-3 border-b border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          होम
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>

          <div>
            <div className="text-sm font-bold text-white">
              EduAI Tutor
            </div>
            <div className="text-[10px] text-green-400">
              ● AI Online
            </div>
          </div>
        </div>
      </header>

      {/* Chat */}
      <section
        aria-label="AI चैट"
        className="flex-1 overflow-y-auto py-4 space-y-4"
      >
        {messages.map((message, index) => {
          const isUser = message.role === "user";

          return (
            <div
              key={index}
              className={`flex gap-2 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                  isUser
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm"
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-sm"
                }`}
              >
                {message.quiz ? (
                  <QuizCard quiz={message.quiz} />
                ) : (
                  renderText(message.text)
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 shrink-0 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-400" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            </div>

            <div className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-400">
              AI सोच रहा है...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </section>

      {/* Quick Questions */}
      {!loading && messages.length === 1 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            "1857 की क्रांति के कारण बताओ",
            "राजस्थान के 10 GK प्रश्न बनाओ",
            "प्रजामंडल आंदोलन समझाओ",
            "राजस्थान की राजधानी क्या है?",
          ].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setInput(q)}
              className="text-left text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500 transition"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="sticky bottom-0 pt-2 bg-slate-950"
      >
        <div className="flex gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="अपना सवाल पूछें..."
            className="flex-1 min-w-0 bg-transparent px-2 text-sm text-white placeholder:text-slate-500 outline-none"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center disabled:opacity-40 active:scale-95 transition"
            aria-label="सवाल भेजें"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center text-[10px] text-slate-600 mt-2">
          EduAI • AI answers को verify करना हमेशा अच्छा है
        </div>
      </form>
    </main>
  );
}