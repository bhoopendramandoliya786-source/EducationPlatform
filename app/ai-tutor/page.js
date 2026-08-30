"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Send,
  Sparkles,
  User,
} from "lucide-react";

function QuizCard({ quiz }) {
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const questions = Array.isArray(quiz?.questions)
    ? quiz.questions
    : [];

  const score = questions.reduce((total, q) => {
    return total + (
      selected[q.id] === q.correctIndex ? 1 : 0
    );
  }, 0);

  if (!questions.length) {
    return (
      <div className="text-slate-300">
        Quiz तैयार नहीं हो सका।
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-base font-bold text-white">
        {quiz.quiz_title || "📝 Quiz"}
      </div>

      {questions.map((q, index) => (
        <div
          key={q.id || index}
          className="rounded-2xl bg-slate-950/80 border border-slate-700 p-3"
        >
          <div className="text-sm font-semibold text-slate-100 mb-3">
            {index + 1}. {q.question}
          </div>

          <div className="space-y-2">
            {(q.options || []).map((option, optionIndex) => {
              const isSelected =
                selected[q.id] === optionIndex;

              const isCorrect =
                submitted &&
                optionIndex === q.correctIndex;

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
                  {String.fromCharCode(65 + optionIndex)}.{" "}
                  {option}
                </button>
              );
            })}
          </div>

          {submitted && q.explanation && (
            <div className="mt-3 rounded-xl bg-slate-900 p-3 text-xs text-slate-400">
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
          🎯 स्कोर: {score}/{questions.length}
        </div>
      )}
    </div>
  );
}

export default function AITutorPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "नमस्ते! 👋\n\nमैं EduAI हूँ। आप मुझसे किसी भी विषय, सवाल, जानकारी, पढ़ाई, तकनीक, गणित, विज्ञान, इतिहास, सामान्य ज्ञान या रोज़मर्रा की किसी भी चीज़ के बारे में पूछ सकते हैं।\n\nअपना सवाल नीचे लिखिए।",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

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
        .slice(-8)
        .map((message) => ({
          role: message.role,
          text: message.text || "",
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
        throw new Error(
          data?.error || "AI उत्तर नहीं दे पाया।"
        );
      }

      if (data?.quiz?.questions?.length) {
        addMessage("assistant", "", {
          quiz: data.quiz,
        });

        return;
      }

      if (data?.answer) {
        addMessage("assistant", data.answer);
        return;
      }

      throw new Error("AI से खाली उत्तर मिला।");
    } catch (error) {
      console.error("AI Tutor Error:", error);

      addMessage(
        "assistant",
        "माफ़ कीजिए 😕 अभी AI से उत्तर नहीं मिल पाया।\n\nकृपया थोड़ी देर बाद दोबारा कोशिश करें।"
      );
    } finally {
      setLoading(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const renderText = (text) => {
    if (!text) return null;

    return (
      <div className="whitespace-pre-wrap break-words">
        {text}
      </div>
    );
  };

  return (
    <main
      className="
        min-h-[calc(100vh-80px)]
        max-w-3xl
        mx-auto
        px-3
        sm:px-4
        flex
        flex-col
        pb-28
      "
    >
      {/* Header */}
      <header className="flex items-center justify-between py-3 border-b border-slate-800 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>होम</span>
        </Link>

        <div className="flex items-center gap-2">
          <div
            className="
              w-9 h-9
              rounded-xl
              bg-gradient-to-br
              from-indigo-500
              to-purple-600
              flex
              items-center
              justify-center
              shadow-lg
              shadow-indigo-500/20
            "
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          <div>
            <div className="text-sm font-bold text-white">
              EduAI
            </div>

            <div className="text-[10px] text-green-400">
              ● AI Online
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <section
        aria-label="AI चैट"
        className="
          flex-1
          overflow-y-auto
          py-4
          space-y-4
          min-h-0
          scrollbar-thin
          scrollbar-thumb-slate-700
        "
      >
        {messages.map((message, index) => {
          const isUser = message.role === "user";

          return (
            <div
              key={index}
              className={`flex gap-2 ${
                isUser
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {/* AI Icon */}
              {!isUser && (
                <div
                  className="
                    w-8 h-8
                    shrink-0
                    rounded-xl
                    bg-gradient-to-br
                    from-indigo-600
                    to-purple-600
                    flex
                    items-center
                    justify-center
                    shadow-md
                  "
                >
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Message */}
              <div
                className={`
                  max-w-[88%]
                  rounded-2xl
                  p-3.5
                  text-sm
                  leading-relaxed
                  shadow-sm
                  ${
                    isUser
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm"
                      : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-sm"
                  }
                `}
              >
                {message.quiz ? (
                  <QuizCard quiz={message.quiz} />
                ) : (
                  renderText(message.text)
                )}
              </div>

              {/* User Icon */}
              {isUser && (
                <div
                  className="
                    w-8 h-8
                    shrink-0
                    rounded-xl
                    bg-slate-800
                    border
                    border-slate-700
                    flex
                    items-center
                    justify-center
                  "
                >
                  <User className="w-4 h-4 text-indigo-400" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2">
            <div
              className="
                w-8 h-8
                rounded-xl
                bg-indigo-600/20
                flex
                items-center
                justify-center
              "
            >
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            </div>

            <div
              className="
                px-4
                py-3
                rounded-2xl
                bg-slate-900
                border
                border-slate-800
                text-sm
                text-slate-400
              "
            >
              AI सोच रहा है...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </section>

      {/* Input Area */}
      <div
        className="
          sticky
          bottom-0
          z-30
          pt-2
          pb-3
          bg-slate-950
        "
      >
        <form onSubmit={handleSend}>
          <div
            className="
              flex
              items-center
              gap-2
              p-2
              rounded-2xl
              bg-slate-900
              border
              border-slate-700
              shadow-2xl
              shadow-black/30
            "
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              disabled={loading}
              autoComplete="off"
              enterKeyHint="send"
              placeholder="कुछ भी पूछिए..."
              className="
                flex-1
                min-w-0
                h-11
                bg-transparent
                px-3
                text-sm
                text-white
                placeholder:text-slate-500
                outline-none
              "
            />

            <button
              type="submit"
              disabled={
                !input.trim() || loading
              }
              aria-label="सवाल भेजें"
              className="
                w-11
                h-11
                shrink-0
                rounded-xl
                bg-gradient-to-r
                from-indigo-600
                to-purple-600
                text-white
                flex
                items-center
                justify-center
                disabled:opacity-40
                active:scale-95
                transition
                shadow-lg
                shadow-indigo-500/20
              "
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="text-center text-[10px] text-slate-600 mt-2">
          EduAI • आप किसी भी विषय पर सवाल पूछ सकते हैं
        </div>
      </div>
    </main>
  );
}