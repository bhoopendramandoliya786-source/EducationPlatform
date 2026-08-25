import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = "@EduAI_RajasthanExam";
const WEBSITE_URL = "https://education-platform-fawn-six.vercel.app";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fallbackBank = [
  { question: "राजस्थान का राज्य वृक्ष 'खेजड़ी' को राज्य वृक्ष कब घोषित किया गया था?", options: ["1981", "1983", "1985", "1989"], correct_index: 1, explanation: "खेजड़ी (Prosopis cineraria) को 31 अक्टूबर 1983 को राज्य वृक्ष घोषित किया गया था।" },
  { question: "पाबूजी की फड़ का वाचन करते समय किस वाद्ययंत्र का मुख्य रूप से प्रयोग किया जाता है?", options: ["जंतर", "रावणहत्था", "सारंगी", "कमायचा"], correct_index: 1, explanation: "पाबूजी की फड़ का वाचन भोपों द्वारा रावणहत्था वाद्ययंत्र से किया जाता है।" },
  { question: "राजस्थान का नवगठित 'डीडवाना-कुचामन' जिला किस संभाग के अंतर्गत आता है?", options: ["जयपुर", "अजमेर", "बीकानेर", "जोधपुर"], correct_index: 1, explanation: "डीडवाना-कुचामन जिला अजमेर संभाग के अंतर्गत आता है।" },
  { question: "मुकंदरा हिल्स राष्ट्रीय उद्यान को टाइगर रिजर्व कब घोषित किया गया?", options: ["2010", "2012", "2013", "2015"], correct_index: 2, explanation: "मुकंदरा हिल्स को 9 अप्रैल 2013 को राजस्थान का तीसरा टाइगर रिजर्व घोषित किया गया।" },
  { question: "राजस्थान में 'उड़न गिलहरी' के लिए प्रसिद्ध वन्यजीव अभयारण्य कौन सा है?", options: ["तालछापर", "सीतामाता अभयारण्य", "कुम्भलगढ़", "माउंट आबू"], correct_index: 1, explanation: "सीतामाता अभयारण्य (प्रतापगढ़) महुआ के पेड़ों पर रहने वाली उड़न गिलहरी हेतु प्रसिद्ध है।" },
  { question: "काले हिरणों एवं कुंरजा पक्षी के लिए कौन सा अभयारण्य प्रसिद्ध है?", options: ["तालछापर (चूरू)", "राष्ट्रीय मरु उद्यान", "सरिस्का", "केवलादेव"], correct_index: 0, explanation: "तालछापर अभयारण्य (चूरू) काले हिरणों (Black Buck) और मोथिया घास के लिए प्रसिद्ध है।" },
  { question: "राजस्थान का पहला राष्ट्रीय उद्यान कौन सा है?", options: ["केवलादेव", "रणथंभौर", "मुकंदरा हिल्स", "सरिस्का"], correct_index: 1, explanation: "रणथंभौर को 1 नवंबर 1980 को राजस्थान का पहला राष्ट्रीय उद्यान घोषित किया गया था।" },
  { question: "रामगढ़ विषधारी टाइगर रिजर्व राजस्थान के किस जिले में स्थित है?", options: ["कोटा", "बूंदी", "सवाई माधोपुर", "करौली"], correct_index: 1, explanation: "रामगढ़ विषधारी (बूंदी) भारत का 52वां और राजस्थान का चौथा टाइगर रिजर्व बना।" },
  { question: "केवलादेव राष्ट्रीय उद्यान को यूनेस्को (UNESCO) की विश्व धरोहर सूची में कब शामिल किया गया?", options: ["1981", "1983", "1985", "1990"], correct_index: 2, explanation: "केवलादेव घना पक्षी विहार को 1985 में यूनेस्को प्राकृतिक धरोहर सूची में शामिल किया गया।" },
  { question: "राजस्थान में 'सांभर झील' को रामसर स्थल का दर्जा कब दिया गया?", options: ["1981", "1990", "1995", "2002"], correct_index: 1, explanation: "सांभर झील को 23 मार्च 1990 को राजस्थान की दूसरी रामसर साइट घोषित किया गया।" },
  { question: "माउंट आबू वन्यजीव अभयारण्य मुख्य रूप से किस पक्षी के लिए जाना जाता है?", options: ["गोडावण", "जंगली मुर्गे (Grey Junglefowl)", "साइबेरियन क्रेन", "हरियल"], correct_index: 1, explanation: "माउंट आबू अभयारण्य जंगली मुर्गों एवं 'डिकिल्पटेरा आबुआंसिस' वनस्पति के लिए प्रसिद्ध है।" },
  { question: "घड़ियालों की संसार की एकमात्र प्राकृतिक शरणस्थली कौन सा अभयारण्य है?", options: ["जवाहर सागर", "राष्ट्रीय चम्बल घड़ियाल अभयारण्य", "शेरगढ़", "बस्सी"], correct_index: 1, explanation: "राष्ट्रीय चम्बल घड़ियाल अभयारण्य तीन राज्यों (राज., MP, UP) का अंतरराज्यीय अभयारण्य है।" },
  { question: "राजस्थान का राज्य पक्षी 'गोडावण' (Great Indian Bustard) कब घोषित किया गया?", options: ["1981", "1982", "1983", "1985"], correct_index: 0, explanation: "गोडावण (Ardeotis nigriceps) को 21 मई 1981 को राज्य पक्षी घोषित किया गया था।" },
  { question: "धौकड़ा (Anogeissus pendula) वन राजस्थान के कितने प्रतिशत वन क्षेत्र पर पाए जाते हैं?", options: ["लगभग 20%", "लगभग 35%", "लगभग 58%", "लगभग 75%"], correct_index: 2, explanation: "धौकड़ा वन राजस्थान के वनों के सर्वाधिक भाग (लगभग 58.11%) पर विस्तृत हैं।" },
  { question: "राजस्थान वन विभाग की स्थापना किस वर्ष की गई थी?", options: ["1949-50", "1952", "1955", "1960"], correct_index: 0, explanation: "राजस्थान वन विभाग की स्थापना वर्ष 1949-50 में की गई थी।" },
  { question: "हरे कबूतरों के लिए राजस्थान का कौन सा अभयारण्य प्रसिद्ध है?", options: ["सरिस्का (अलवर)", "रणथंभौर", "केलादेवी", "नाहरगढ़"], correct_index: 0, explanation: "सरिस्का वन्यजीव अभयारण्य (अलवर) में हरे कबूतर (Yellow-footed Green Pigeon) पाए जाते हैं।" },
  { question: "शेरगढ़ वन्यजीव अभयारण्य किस जिले में स्थित है और किस नदी के किनारे है?", options: ["बारां - परवन नदी", "झालावाड़ - आहू नदी", "कोटा - चम्बल नदी", "बूंदी - मेज नदी"], correct_index: 0, explanation: "शेरगढ़ अभयारण्य बारां जिले में परवन नदी के किनारे स्थित है, जिसे साँपों की शरणस्थली कहते हैं।" },
  { question: "फुलवारी की नाल अभयारण्य किस जिले में स्थित है?", options: ["राजसमंद", "उदयपुर", "सिरोही", "पाली"], correct_index: 1, explanation: "फुलवारी की नाल उदयपुर में है जहाँ से मानसी-वाकल और सोम नदियाँ निकलती हैं।" },
  { question: "राजस्थान में देश का प्रथम मरु वानस्पतिक उद्यान 'माचिया सफारी पार्क' कहाँ है?", options: ["जोधपुर", "जैसलमेर", "बाड़मेर", "बीकानेर"], correct_index: 0, explanation: "माचिया सफारी पार्क कायलाना झील के किनारे जोधपुर में स्थित है।" },
  { question: "केलादेवी वन्यजीव अभयारण्य किस जिले में विस्तृत है?", options: ["करौली एवं सवाई माधोपुर", "धौलपुर एवं भरतपुर", "कोटा एवं बूंदी", "अलवर एवं दौसा"], correct_index: 0, explanation: "केलादेवी अभयारण्य करौली व सवाई माधोपुर में विस्तृत है और यह रणथंभौर का बफर जोन है।" }
];

export async function GET(request) {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ success: false, error: "TELEGRAM_BOT_TOKEN is missing." }, { status: 400 });
    }

    let rawQuestions = [];

    if (supabase) {
      // Try fetching from questions, quiz_questions, or pyqs tables
      const { data: q1 } = await supabase.from("questions").select("*").limit(100);
      if (q1 && q1.length > 0) {
        rawQuestions = q1;
      } else {
        const { data: q2 } = await supabase.from("quiz_questions").select("*").limit(100);
        if (q2 && q2.length > 0) rawQuestions = q2;
      }
    }

    let finalQuestions = [];

    if (rawQuestions.length > 0) {
      const shuffled = [...rawQuestions].sort(() => 0.5 - Math.random());
      finalQuestions = shuffled.slice(0, 20).map((q) => {
        let opts = [];
        if (Array.isArray(q.options)) {
          opts = q.options;
        } else if (typeof q.options === "string") {
          try { opts = JSON.parse(q.options); } catch (e) { opts = []; }
        }
        if (opts.length < 2) {
          opts = [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean);
        }

        let cIndex = 0;
        if (typeof q.correct_index === "number") cIndex = q.correct_index;
        else if (typeof q.correct_option === "number") cIndex = q.correct_option;
        else if (typeof q.correct_answer === "string") {
          const matchIdx = opts.findIndex(o => String(o).trim() === String(q.correct_answer).trim());
          if (matchIdx !== -1) cIndex = matchIdx;
        }

        return {
          question: q.question || q.text || "राजस्थान सामान्य ज्ञान प्रश्न",
          options: opts.slice(0, 4),
          correct_index: cIndex,
          explanation: q.explanation || "विस्तृत व्याख्या व 100+ PYQs हल करने हेतु EduAI Pro विजिट करें।"
        };
      });
    }

    // Use fallback bank if DB is not returning full 20
    if (finalQuestions.length < 5) {
      finalQuestions = fallbackBank;
    }

    let sentCount = 0;
    for (let i = 0; i < Math.min(20, finalQuestions.length); i++) {
      const q = finalQuestions[i];
      if (!q.question || !q.options || q.options.length < 2) continue;

      const cleanExplanation = (q.explanation || "सही उत्तर!").substring(0, 110);
      const htmlExplanation = `${cleanExplanation}\n\n👉 <a href="${WEBSITE_URL}">पूरा टेस्ट ऐप पर हल करें</a>`;

      const pollRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPoll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          question: `🎯 [Q.${sentCount + 1}] ${q.question.substring(0, 270)}`,
          options: JSON.stringify(q.options.map((opt) => String(opt || "").substring(0, 95))),
          type: "quiz",
          correct_option_id: Math.max(0, Math.min(q.correct_index, q.options.length - 1)),
          explanation: htmlExplanation,
          explanation_parse_mode: "HTML",
          is_anonymous: true,
        }),
      });

      const pollData = await pollRes.json();
      if (pollData.ok) {
        sentCount++;
      }

      await delay(1200); // 1.2s delay for fast and smooth delivery
    }

    // Final summary CTA Button
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `📊 <b>आज का 20 प्रश्नों का राजस्थान GK टेस्ट समाप्त!</b>\n\n🎯 अपनी ऑल-राजस्थान रैंक, स्कोरकार्ड और 100+ PYQs हल करने के लिए नीचे दिए गए बटन पर क्लिक करें:`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🚀 फुल टेस्ट हल करें (100% Free)", url: WEBSITE_URL }]
          ],
        },
      }),
    });

    return NextResponse.json({
      success: true,
      message: `Successfully posted ${sentCount} quiz questions to Telegram!`,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
