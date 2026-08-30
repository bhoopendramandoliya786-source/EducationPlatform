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
} from "lucide-react";

/* =======================================================
   QUIZ CARD
======================================================= */

function QuizCard({ quiz }) {
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const questions = Array.isArray(quiz?.questions)
    ? quiz.questions.slice(0, 20)
    : [];

  const score = questions.reduce((total, q) => {
    return (
      total +
      (selected[q.id] === q.correctIndex ? 1 : 0)
    );
  }, 0);

  if (!questions.length) {
    return (
      <div className="text-slate-300">
        Quiz तैयार नहीं हो सका।
      </div>
    );
  }

  const answeredCount = Object.keys(selected).length;

  return (
    <div className="space-y-4">
      {/* Quiz Header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 p-4">
        <div className="text-base font-bold text-white">
          {quiz.quiz_title || "📝 EduAI Quiz"}
        </div>

        <div className="text-xs text-slate-400 mt-1">
          कुल {questions.length} प्रश्न
        </div>

        {!submitted && (
          <div className="text-xs text-indigo-300 mt-2">
            चुने गए उत्तर: {answeredCount}/{questions.length}
          </div>
        )}
      </div>

      {/* Questions */}
      {questions.map((q, index) => {
        const questionId =
          q.id ?? index;

        return (
          <div
            key={questionId}
            className="
              rounded-2xl
              bg-slate-950/90
              border
              border-slate-700
              p-3
            "
          >
            <div className="text-sm font-semibold text-slate-100 mb-3 leading-relaxed">
              {index + 1}. {q.question}
            </div>

            <div className="space-y-2">
              {(Array.isArray(q.options)
                ? q.options
                : []
              ).map((option, optionIndex) => {
                const isSelected =
                  selected[questionId] ===
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
                      setSelected((prev) => ({
                        ...prev,
                        [questionId]:
                          optionIndex,
                      }))
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
                    <span className="font-bold mr-1">
                      {String.fromCharCode(
                        65 + optionIndex
                      )}.
                    </span>

                    {option}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {submitted && q.explanation && (
              <div
                className="
                  mt-3
                  rounded-xl
                  bg-slate-900
                  border
                  border-slate-800
                  p-3
                  text-xs
                  text-slate-400
                  leading-relaxed
                "
              >
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
          className="
            w-full
            py-3
            rounded-xl
            bg-gradient-to-r
            from-indigo-600
            to-purple-600
            text-white
            font-bold
            shadow-lg
            shadow-indigo-500/20
            active:scale-[0.98]
            transition
          "
        >
          ✅ उत्तर जमा करें
        </button>
      ) : (
        <div
          className="
            rounded-2xl
            bg-gradient-to-r
            from-indigo-500/10
            to-purple-500/10
            border
            border-indigo-500/20
            p-4
            text-center
          "
        >
          <div className="text-lg font-black text-white">
            🎯 आपका स्कोर
          </div>

          <div className="text-2xl font-black text-indigo-300 mt-1">
            {score}/{questions.length}
          </div>

          <div className="text-xs text-slate-400 mt-1">
            {score === questions.length
              ? "🔥 शानदार! सभी उत्तर सही हैं।"
              : score >=
                Math.ceil(
                  questions.length * 0.7
                )
              ? "👏 बहुत बढ़िया!"
              : "💪 अभ्यास करते रहें, अगली बार और बेहतर होगा।"}
          </div>
        </div>
      )}
    </div>
  );
}

/* =======================================================
   MESSAGE CONTENT
   - Normal text
   - Markdown image
   - Direct image URL
======================================================= */

function MessageContent({ text, image }) {
  /* Direct image */
  if (image) {
    return (
      <div className="space-y-3">
        <img
          src={image}
          alt="EduAI Generated Image"
          loading="lazy"
          className="
            block
            w-full
            max-w-xl
            mx-auto
            rounded-2xl
            border
            border-slate-700
            shadow-lg
            object-contain
          "
          onError={(e) => {
            e.currentTarget.style.display =
              "none";
          }}
        />

        {text && (
          <div className="whitespace-pre-wrap break-words text-xs text-slate-400">
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
    Markdown image:
    ![alt](https://example.com/image.jpg)
  */

  const imageRegex =
    /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while (
    (match = imageRegex.exec(text)) !==
    null
  ) {
    const before = text.slice(
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
            <div
              key={index}
              className="space-y-2"
            >
              <img
                src={part.url}
                alt={
                  part.alt ||
                  "EduAI Generated Image"
                }
                loading="lazy"
                className="
                  block
                  w-full
                  max-w-xl
                  mx-auto
                  rounded-2xl
                  border
                  border-slate-700
                  shadow-lg
                  object-contain
                "
                onError={(e) => {
                  e.currentTarget.style.display =
                    "none";
                }}
              />
            </div>
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

/* =======================================================
   MAIN AI TUTOR PAGE
======================================================= */

export default function AITutorPage() {
  const [messages, setMessages] =
    useState([
      {
        role: "assistant",
        text:
          "नमस्ते! 👋\n\nमैं EduAI हूँ। आप मुझसे किसी भी विषय, सवाल, पढ़ाई, गणित, विज्ञान, इतिहास, तकनीक, सामान्य ज्ञान या रोज़मर्रा की जानकारी के बारे में पूछ सकते हैं।\n\n📝 Quiz चाहिए तो बोलिए: \"भारत पर quiz बनाओ\"\n🖼️ Image चाहिए तो बोलिए: \"राजस्थान का किला बनाओ\"\n\nअपना सवाल नीचे लिखिए।",
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

  /* ---------------------------------------------------
     AUTO SCROLL
  --------------------------------------------------- */

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  /* ---------------------------------------------------
     INPUT FOCUS
  --------------------------------------------------- */

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);

    return () =>
      clearTimeout(timer);
  }, []);

  /* ---------------------------------------------------
     ADD MESSAGE
  --------------------------------------------------- */

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
     SEND MESSAGE
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

    /* Clear input */
    setInput("");

    /* Show user message immediately */
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
              message.role ===
              "user"
                ? "user"
                : "assistant",
            text:
              typeof message.text ===
              "string"
                ? message.text
                : "",
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

      /* ------------------------------------------------
         QUIZ RESPONSE
      ------------------------------------------------ */

      if (
        data?.quiz &&
        Array.isArray(
          data.quiz.questions
        ) &&
        data.quiz.questions.length
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

      /* ------------------------------------------------
         IMAGE RESPONSE
      ------------------------------------------------ */

      if (data?.image) {
        addMessage(
          "assistant",
          data?.answer || "",
          {
            image:
              data.image,
          }
        );

        return;
      }

      /* ------------------------------------------------
         NORMAL RESPONSE
      ------------------------------------------------ */

      if (
        typeof data?.answer ===
          "string" &&
        data.answer.trim()
      ) {
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

  /* =====================================================
     UI
  ===================================================== */

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
      {/* =================================================
          HEADER
      ================================================= */}

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
          shrink-0
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
            active:scale-95
            transition
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
              shadow-lg
              shadow-indigo-500/20
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

      {/* =================================================
          CHAT AREA
      ================================================= */}

      <section
        aria-label="AI चैट"
        className="
          flex-1
          min-h-0
          overflow-y-auto
          py-4
          px-3
          sm:px-4
          pb-48
          overscroll-contain
        "
      >
        <div
          className="
            max-w-3xl
            mx-auto
            space-y-4
          "
        >
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
                    items-end
                    ${
                      isUser
                        ? "justify-end"
                        : "justify-start"
                    }
                  `}
                >
                  {/* AI ICON */}
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
                        shadow-md
                      "
                    >
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  {/* MESSAGE */}
                  <div
                    className={`
                      max-w-[90%]
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

                  {/* USER ICON */}
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

          {/* LOADING */}
          {loading && (
            <div className="flex items-end gap-2">
              <div
                className="
                  w-8
                  h-8
                  shrink-0
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

          {/* Scroll target */}
          <div
            ref={chatEndRef}
            className="h-1"
          />
        </div>
      </section>

      {/* =================================================
          FIXED INPUT
          Chat के नीचे पर्याप्त padding ऊपर रखी गई है
      ================================================= */}

      <div
        className="
          fixed
          left-0
          right-0
          bottom-0
          z-[60]
          px-3
          pb-3
          pt-2
          bg-slate-950/95
          backdrop-blur-xl
          border-t
          border-slate-900
        "
      >
        <form
          onSubmit={handleSend}
          className="
            max-w-3xl
            mx-auto
          "
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
              shadow-black/30
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
                shadow-lg
                shadow-indigo-500/20
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