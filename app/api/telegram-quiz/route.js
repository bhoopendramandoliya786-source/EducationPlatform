import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = "@EduAI_RajasthanExam";
const WEBSITE_URL = "https://education-platform-fawn-six.vercel.app";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request) {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json(
        { success: false, error: "TELEGRAM_BOT_TOKEN is missing." },
        { status: 400 }
      );
    }

    let questionsToSend = [];

    // 1. Fetch questions from database
    if (supabase) {
      try {
        const { data: questions, error } = await supabase
          .from("quiz_questions")
          .select("*")
          .limit(100);

        if (questions && questions.length > 0) {
          // Shuffle array randomly
          const shuffled = [...questions].sort(() => 0.5 - Math.random());
          questionsToSend = shuffled.slice(0, 20).map((q) => ({
            question: q.question,
            options: Array.isArray(q.options)
              ? q.options.slice(0, 4)
              : [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean),
            correct_index:
              typeof q.correct_index === "number" ? q.correct_index : 0,
            explanation:
              q.explanation ||
              "विस्तृत व्याख्या व 100+ PYQs हल करने हेतु EduAI Pro विजिट करें।",
          }));
        }
      } catch (dbErr) {
        console.error("Database fetch error:", dbErr);
      }
    }

    // 2. Fallback if database has fewer questions
    if (questionsToSend.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No questions found in database to post.",
      });
    }

    // 3. Loop through 20 questions and send Telegram Native Polls
    let sentCount = 0;
    for (const q of questionsToSend) {
      if (!q.question || !q.options || q.options.length < 2) continue;

      const cleanExplanation = (q.explanation || "सही उत्तर!").substring(0, 120);
      const htmlExplanation = `${cleanExplanation}\n\n👉 <a href="${WEBSITE_URL}">पूरे 100 प्रश्नों का टेस्ट यहाँ दें</a>`;

      const pollRes = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPoll`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            question: `🎯 [Q.${sentCount + 1}] ${q.question.substring(0, 270)}`,
            options: JSON.stringify(
              q.options.map((opt) => String(opt || "").substring(0, 95))
            ),
            type: "quiz",
            correct_option_id: Math.max(
              0,
              Math.min(q.correct_index, q.options.length - 1)
            ),
            explanation: htmlExplanation,
            explanation_parse_mode: "HTML",
            is_anonymous: true,
          }),
        }
      );

      const pollData = await pollRes.json();
      if (pollData.ok) {
        sentCount++;
      }

      // 1.5 second delay between polls to avoid Telegram rate limits
      await delay(1500);
    }

    // 4. Send a single Summary Button at the end of the 20-question test round
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: `📊 <b>आज का 20 प्रश्नों का स्पीड टेस्ट राउंड समाप्त!</b>\n\n🎯 अपनी ऑल-राजस्थान रैंक, नेगेटिव मार्किंग स्कोरकार्ड और 100+ PYQs हल करने के लिए नीचे दिए गए बटन पर क्लिक करें:`,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🚀 फुल टेस्ट हल करें (100% Free)",
                  url: WEBSITE_URL,
                },
              ],
            ],
          },
        }),
      }
    );

    return NextResponse.json({
      success: true,
      message: `Successfully posted ${sentCount} quiz questions to Telegram!`,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}