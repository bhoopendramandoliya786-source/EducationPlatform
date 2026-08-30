"use client";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Bot,
  Send,
  Sparkles,
  User,
  Image as ImageIcon,
} from "lucide-react";

/* -------------------------------------------------------
   QUIZ CARD
------------------------------------------------------- */

function QuizCard({ quiz }) {
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] =
    useState(false);

  const questions = Array.isArray(
    quiz?.questions
  )
    ? quiz.questions
    : [];

  const score = questions.reduce(
    (total, q) => {
      return (
        total +
        (selected[q.id] ===
        q.correctIndex
          ? 1
          : 0)
      );
    },
    0
  );

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
        {quiz.quiz_title ||
          "📝 EduAI Quiz"}
      </div>

      <div className="text-xs text-slate-400">
        कुल {questions.length} प्रश्न
      </div>

      {questions.map((q, index) => (
        <div
          key={q.id || index}
          className="
            rounded-2xl
            bg-slate-950/80
            border
            border-slate-700
            p-3
          "
        >
          <div className="text-sm font-semibold text-slate-100 mb-3">
            {index + 1}. {q.question}
          </div>

          <div className="space-y-2">
            {(q.options || []).map(
              (option, optionIndex) => {
                const isSelected =
                  selected[q.id] ===
                  optionIndex;

                const isCorrect =
                  submitted &&
                  optionIndex ===
                    q.correctIndex;

                const isWrong =
                  submitted &&
                  isSelected &&
                  optionIndex !==
                    q.correctIndex;

                return (
                  <button
                    key={optionIndex}
                    type="button"
                    disabled={submitted}
                    onClick={() =>
                      setSelected(
                        (prev) => ({
                          ...prev,
                          [q.id]:
                            optionIndex,
                        })
                      )
                    }
                    className={`
                      w-full
                      text-left
                      p-3
                      rounded-xl
                      border
                      text-sm
                      transition
                      ${
                        isCorrect
                          ? "bg-green-500/20 border-green-500 text-green-300"
                          : isWrong
                          ? "bg-red-500/20 border-red-500 text-red-300"
                          : isSelected
                          ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                          : "bg-slate-900 border-slate-700 text-slate-300 hover:border-indigo-500"
                      }
                    `}
                  >
                    {String.fromCharCode(
                      65 + optionIndex
                    )}
                    . {option}
                  </button>
                );
              }
            )}
          </div>

          {submitted &&
            q.explanation && (
              <div
                className="
                  mt-3
                  rounded-xl
                  bg-slate-900
                  p-3
                  text-xs
                  text-slate-400
                "
              >
                💡 {q.explanation}
              </div>
            )}
        </div>
      ))}

      {!submitted ? (
        <button
          type="button"
          onClick={() =>
            setSubmitted(true)
          }
          className="
            w-full
            py-3
            rounded-xl
            bg-gradient-to-r
            from-indigo-600
            to-purple-600
            text-white
            font-bold
          "
        >
          ✅ उत्तर जमा करें
        </button>
      ) : (
        <div
          className="
            text-center
            p-4
            rounded-xl
            bg-indigo-500/10
            border
            border-indigo-500/20
            text-indigo-300
            font-bold
          "
        >
          🎯 आपका स्कोर:{" "}
          {score}/{questions.length}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   MESSAGE CONTENT
------------------------------------------------------- */

function MessageContent({
  text,
  image,
}) {
  if (image) {
    return (
      <div className="space-y-3">
        <img
          src={image}
          alt="EduAI Generated Image"
          className="
            w-full
            max-w-xl
            mx-auto
            rounded-2xl
            border
            border-slate-700
            shadow-lg
            object-contain
          "
          loading="lazy"
        />

        {text && (
          <div className="text-xs text-slate-400">
            {text}
          </div>
        )}
      </div>
    );
  }

  if (!text) {
    return null;
  }

  /*
    Backend अगर Markdown image भेजे:
    ![alt](url)
    तो उसे सीधे image में बदलेंगे।
  */

  const imageRegex =
    /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while (
    (match = imageRegex.exec(text)) !==
    null
  ) {
    const before =
      text.slice(
        lastIndex,
        match.index
      );

    if (before) {
      parts.push({
        type: "text",
        content: before,
      });
    }

    parts.push({
      type: "image",
      alt: match[1],
      url: match[2],
    });

    lastIndex =
      match.index + match[0].length;
  }

  const remaining =
    text.slice(lastIndex);

  if (remaining) {
    parts.push({
      type: "text",
      content: remaining,
    });
  }

  if (!parts.length) {
    return (
      <div className="whitespace-pre-wrap break-words">
        {text}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (part.type === "image") {
          return (
            <img
              key={index}
              src={part.url}
              alt={
                part.alt ||
                "EduAI Generated Image"
              }
              loading="lazy"
              className="
                w-full
                max-w-xl
                mx-auto
                rounded-2xl
                border
                border-slate-700
                shadow-lg
                object-contain
              "
            />
          );
        }

        return (
          <div
            key={index}
            className="
              whitespace-pre-wrap
              break-words
            "
          >
            {part.content}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------
   MAIN PAGE
------------------------------------------------------- */

export default function AITutorPage() {
  const [messages, setMessages] =
    useState([
      {
        role: "assistant",
        text:
          "नमस्ते! 👋\n\nमैं EduAI हूँ। आप मुझसे किसी भी विषय, सवाल, पढ़ाई, गणित, विज्ञान, इतिहास, तकनीक या सामान्य जानकारी के बारे में पूछ सकते हैं।\n\nआप अपना सवाल नीचे लिखिए।",
      },
    ]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const chatEndRef =
    useRef(null);

  const inputRef =
    useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);

    return () =>
      clearTimeout(timer);
  }, []);

  const addMessage = (
    role,
    text,
    extra = {}
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        role,
        text,
        ...extra,
      },
    ]);
  };

  /* ---------------------------------------------------
     SEND
  --------------------------------------------------- */

  const handleSend = async (e) => {
    e?.preventDefault();

    const question =
      input.trim();

    if (
      !question ||
      loading
    ) {
      return;
    }

    setInput("");

    addMessage(
      "user",
      question
    );

    setLoading(true);

    try {
      const history =
        messages
          .slice(-8)
          .map((message) => ({
            role:
              message.role,
            text:
              message.text ||
              "",
          }));

      const res =
        await fetch(
          "/api/doubt",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              question,
              messagesHistory:
                history,
            }),
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error ||
            "AI उत्तर नहीं दे पाया।"
        );
      }

      /* QUIZ */

      if (
        data?.quiz?.questions
          ?.length
      ) {
        addMessage(
          "assistant",
          "",
          {
            quiz:
              data.quiz,
          }
        );

        return;
      }

      /* IMAGE */

      if (data?.image) {
        addMessage(
          "assistant",
          "",
          {
            image:
              data.image,
          }
        );

        return;
      }

      /* NORMAL */

      if (data?.answer) {
        addMessage(
          "assistant",
          data.answer
        );

        return;
      }

      throw new Error(
        "AI से खाली उत्तर मिला।"
      );
    } catch (error) {
      console.error(
        "AI Tutor Error:",
        error
      );

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

  return (
    <main
      className="
        min-h-screen
        bg-slate-950
        text-white
        flex
        flex-col
      "
    >
      {/* HEADER */}

      <header
        className="
          sticky
          top-0
          z-50
          flex
          items-center
          justify-between
          px-3
          sm:px-4
          py-3
          border-b
          border-slate-800
          bg-slate-950/95
          backdrop-blur-md
        "
      >
        <Link
          href="/"
          className="
            flex
            items-center
            gap-2
            text-sm
            text-slate-300
            hover:text-white
          "
        >
          <ArrowLeft className="w-4 h-4" />
          <span>होम</span>
        </Link>

        <div className="flex items-center gap-2">
          <div
            className="
              w-9
              h-9
              rounded-xl
              bg-gradient-to-br
              from-indigo-500
              to-purple-600
              flex
              items-center
              justify-center
            "
          >
            <Sparkles className="w-5 h-5" />
          </div>

          <div>
            <div className="text-sm font-bold">
              EduAI
            </div>

            <div className="text-[10px] text-green-400">
              ● AI Online
            </div>
          </div>
        </div>
      </header>

      {/* CHAT */}

      <section
        aria-label="AI चैट"
        className="
          flex-1
          overflow-y-auto
          py-4
          px-3
          sm:px-4
          space-y-4
          pb-40
        "
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map(
            (message, index) => {
              const isUser =
                message.role ===
                "user";

              return (
                <div
                  key={index}
                  className={`
                    flex
                    gap-2
                    ${
                      isUser
                        ? "justify-end"
                        : "justify-start"
                    }
                  `}
                >
                  {!isUser && (
                    <div
                      className="
                        w-8
                        h-8
                        shrink-0
                        rounded-xl
                        bg-gradient-to-br
                        from-indigo-600
                        to-purple-600
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`
                      max-w-[90%]
                      rounded-2xl
                      p-3.5
                      text-sm
                      leading-relaxed
                      ${
                        isUser
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 rounded-br-sm"
                          : "bg-slate-900 border border-slate-800 rounded-bl-sm"
                      }
                    `}
                  >
                    {message.quiz ? (
                      <QuizCard
                        quiz={
                          message.quiz
                        }
                      />
                    ) : (
                      <MessageContent
                        text={
                          message.text
                        }
                        image={
                          message.image
                        }
                      />
                    )}
                  </div>

                  {isUser && (
                    <div
                      className="
                        w-8
                        h-8
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
            }
          )}

          {loading && (
            <div className="flex items-center gap-2">
              <div
                className="
                  w-8
                  h-8
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
        </div>
      </section>

      {/* INPUT */}

      <div
        className="
          fixed
          left-0
          right-0
          bottom-0
          z-50
          px-3
          pb-3
          pt-2
          bg-slate-950/95
          backdrop-blur-md
          border-t
          border-slate-900
        "
      >
        <form
          onSubmit={handleSend}
          className="max-w-3xl mx-auto"
        >
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
            "
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) =>
                setInput(
                  e.target.value
                )
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
                !input.trim() ||
                loading
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
              "
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div
            className="
              text-center
              text-[10px]
              text-slate-600
              mt-1
            "
          >
            EduAI • किसी भी विषय पर सवाल पूछिए
          </div>
        </form>
      </div>
    </main>
  );
}