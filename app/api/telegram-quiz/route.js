import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const TELEGRAM_BOT_TOKEN = "8988298606:AAFXHlym2c2GJt01uT6iLEGA1v_q_uGkSXI";
const TELEGRAM_CHAT_ID = "@EduAI_RajasthanExam";

export async function GET(request) {
  try {
    const { data: questions, error } = await supabase
      .from("quiz_questions")
      .select("*")
      .limit(50);

    if (error || !questions || questions.length === 0) {
      const fallbackQuestions = [
        {
          question: "राजस्थान का राज्य वृक्ष 'खेजड़ी' को राज्य वृक्ष कब घोषित किया गया था?",
          options: ["1981", "1983", "1985", "1989"],
          correct_index: 1,
          explanation: "खेजड़ी को 31 अक्टूबर 1983 को राजस्थान का राज्य वृक्ष घोषित किया गया था।"
        },
        {
          question: "पाबूजी की फड़ का वाचन करते समय किस वाद्ययंत्र का मुख्य रूप से प्रयोग किया जाता है?",
          options: ["जंतर", "रावणहत्था", "सारंगी", "कमायचा"],
          correct_index: 1,
          explanation: "पाबूजी की फड़ का वाचन रावणहत्था वाद्ययंत्र से किया जाता है।"
        },
        {
          question: "राजस्थान का नवगठित 'डीडवाना-कुचामन' जिला किस संभाग के अंतर्गत आता है?",
          options: ["जयपुर", "अजमेर", "बीकानेर", "जोधपुर"],
          correct_index: 1,
          explanation: "डीडवाना-कुचामन जिला अजमेर संभाग के अंतर्गत आता है।"
        }
      ];
      const q = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
      await sendTelegramPoll(q);
      return NextResponse.json({ success: true, message: "Fallback question posted to Telegram" });
    }

    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    let options = [];
    let correctIndex = 0;

    if (Array.isArray(randomQuestion.options)) {
      options = randomQuestion.options.slice(0, 4);
      correctIndex = typeof randomQuestion.correct_index === "number" ? randomQuestion.correct_index : 0;
    } else {
      options = [
        randomQuestion.option_a || "Option A",
        randomQuestion.option_b || "Option B",
        randomQuestion.option_c || "Option C",
        randomQuestion.option_d || "Option D"
      ];
      correctIndex = randomQuestion.correct_option ? (randomQuestion.correct_option.charCodeAt(0) - 65) : 0;
    }

    await sendTelegramPoll({
      question: randomQuestion.question,
      options,
      correct_index: correctIndex,
      explanation: randomQuestion.explanation || "ऐसे 100+ PYQ हल करने हेतु EduAI Pro पोर्टल विजिट करें।"
    });

    return NextResponse.json({ success: true, message: "Poll successfully posted to Telegram!" });
  } catch (err) {
    console.error("Telegram Quiz Post Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

async function sendTelegramPoll({ question, options, correct_index, explanation }) {
  const pollUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPoll`;
  
  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    question: `🎯 ${question.length > 280 ? question.substring(0, 275) + "..." : question}`,
    options: JSON.stringify(options.map(opt => String(opt).substring(0, 95))),
    type: "quiz",
    correct_option_id: Math.max(0, Math.min(correct_index, options.length - 1)),
    explanation: `${explanation ? explanation.substring(0, 180) : "सही उत्तर!"}\n\n👉 पूरे 100 प्रश्नों का टेस्ट दें: https://education-platform-fawn-six.vercel.app/quiz`,
    is_anonymous: false
  };

  const res = await fetch(pollUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const resData = await res.json();
  if (!resData.ok) {
    throw new Error(resData.description || "Failed to post poll to Telegram");
  }
}
