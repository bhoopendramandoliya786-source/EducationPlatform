import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = "@EduAI_RajasthanExam";
const WEBSITE_URL = "https://education-platform-fawn-six.vercel.app/quiz";

export async function GET(request) {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ 
        success: false, 
        error: "TELEGRAM_BOT_TOKEN is missing in Environment Variables." 
      }, { status: 400 });
    }

    const fallbackQuestions = [
      {
        question: "राजस्थान का राज्य वृक्ष 'खेजड़ी' को राज्य वृक्ष कब घोषित किया गया था?",
        options: ["1981", "1983", "1985", "1989"],
        correct_index: 1,
        explanation: "खेजड़ी (Prosopis cineraria) को 31 अक्टूबर 1983 को राजस्थान का राज्य वृक्ष घोषित किया गया था।"
      },
      {
        question: "पाबूजी की फड़ का वाचन करते समय किस वाद्ययंत्र का मुख्य रूप से प्रयोग किया जाता है?",
        options: ["जंतर", "रावणहत्था", "सारंगी", "कमायचा"],
        correct_index: 1,
        explanation: "पाबूजी की फड़ का वाचन नायक/भील भोपों द्वारा रावणहत्था वाद्ययंत्र से किया जाता है।"
      },
      {
        question: "राजस्थान का नवगठित 'डीडवाना-कुचामन' जिला किस संभाग के अंतर्गत आता है?",
        options: ["जयपुर", "अजमेर", "बीकानेर", "जोधपुर"],
        correct_index: 1,
        explanation: "डीडवाना-कुचामन जिला अजमेर संभाग के अंतर्गत आता है।"
      }
    ];

    let selectedQ = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];

    if (supabase) {
      try {
        const { data: questions } = await supabase.from("quiz_questions").select("*").limit(40);
        if (questions && questions.length > 0) {
          const q = questions[Math.floor(Math.random() * questions.length)];
          selectedQ = {
            question: q.question,
            options: Array.isArray(q.options) ? q.options.slice(0, 4) : [q.option_a, q.option_b, q.option_c, q.option_d],
            correct_index: typeof q.correct_index === "number" ? q.correct_index : 0,
            explanation: q.explanation || "विस्तृत व्याख्या व 100+ PYQ हल करने हेतु EduAI Pro पोर्टल विजिट करें।"
          };
        }
      } catch (dbErr) {
        console.log("Using fallback questions...");
      }
    }

    // 1. Send Quiz Poll with clickable HTML link in explanation
    const pollUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPoll`;
    const cleanExplanation = (selectedQ.explanation || "सही उत्तर!").substring(0, 120);
    const htmlExplanation = `${cleanExplanation}\n\n👉 <a href="${WEBSITE_URL}">पूरे 100 प्रश्नों का टेस्ट यहाँ दें</a>`;

    const pollRes = await fetch(pollUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        question: `🎯 ${selectedQ.question.substring(0, 280)}`,
        options: JSON.stringify(selectedQ.options.map(opt => String(opt || "").substring(0, 95))),
        type: "quiz",
        correct_option_id: Math.max(0, Math.min(selectedQ.correct_index, selectedQ.options.length - 1)),
        explanation: htmlExplanation,
        explanation_parse_mode: "HTML",
        is_anonymous: true
      })
    });

    const pollData = await pollRes.json();
    if (!pollData.ok) {
      return NextResponse.json({ success: false, error: pollData.description }, { status: 400 });
    }

    // 2. Send Direct Clickable Button right below the poll
    const msgUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(msgUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `📝 <b>आज के विषय के सभी 100 PYQ व 50 MCQ टेस्ट लाइव हैं!</b>\nअपनी रैंक व स्कोरकार्ड तुरंत देखने के लिए नीचे दिए गए बटन पर क्लिक करें:`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🚀 ऑनलाइन टेस्ट दें (100% Free)",
                url: WEBSITE_URL
              }
            ]
          ]
        }
      })
    });

    return NextResponse.json({ success: true, message: "Quiz & clickable button successfully posted to Telegram channel!" });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
