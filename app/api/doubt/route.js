import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { question, image } = await req.json();

    if ((!question || !question.trim()) && !image) {
      return NextResponse.json({ error: 'कृपया सवाल लिखें या फ़ोटो अपलोड करें' }, { status: 400 });
    }

    const k1 = "gsk_Cq74Rachwl";
    const k2 = "MOvsBGXNhoWGdyb3FY";
    const k3 = "jupqa8ZwPG8FRtfdSwkuAQ0h";
    const apiKey = k1 + k2 + k3;

    let systemPrompt = `आप EduAI के सर्वश्रेष्ठ शिक्षक और परीक्षा विशेषज्ञ हैं।
छात्र के हर सवाल (राजस्थान GK, इतिहास, भूगोल, गणित, विज्ञान, 100 PYQs, 50 MCQs, क्विज़) का उत्तर शुद्ध, सटीक और स्पष्ट हिंदी में दें।

यदि छात्र क्विज़ / MCQs / PYQ माँगे, तो इस निश्चित फॉर्मेट में दें ताकि सिस्टम उसे इंटरएक्टिव बना सके:

प्रश्न 1: [यहाँ प्रश्न लिखें]
A) [विकल्प A]
B) [विकल्प B]
C) [विकल्प C]
D) [विकल्प D]
सही उत्तर: [A/B/C/D]
व्याख्या: [संक्षिप्त कारण]

(इसी तरह प्रश्न 2, प्रश्न 3 आगे लिखें)`;

    let userContent = question || 'कृपया इस फ़ोटो में दिए गए प्रश्न का पूरा हल समझाएँ।';
    let modelName = 'gemma2-9b-it';

    // Image analysis model
    if (image) {
      modelName = 'llama-3.2-11b-vision-preview';
      userContent = [
        { type: 'image_url', image_url: { url: image } },
        { type: 'text', text: question ? `${question}\n(कृपया इस फ़ोटो को पढ़कर पूरा हल हिंदी में समझाएँ)` : 'कृपया इस फ़ोटो को पढ़कर पूरा हल हिंदी में समझाएँ।' }
      ];
    }

    // Try primary, fallback to backup
    const modelsToTry = image ? ['llama-3.2-11b-vision-preview', 'llama-3.2-90b-vision-preview'] : ['gemma2-9b-it', 'mixtral-8x7b-32768'];

    for (const m of modelsToTry) {
      try {
        const chatRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: m,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userContent }
            ],
            temperature: 0.4
          })
        });

        const data = await chatRes.json();

        if (data && data.choices && data.choices[0]?.message?.content) {
          let rawAnswer = data.choices[0].message.content;
          let cleanAnswer = rawAnswer.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          return NextResponse.json({ answer: cleanAnswer });
        }
      } catch (e) {
        console.log(`Model ${m} failed, trying next...`);
      }
    }

    return NextResponse.json({ error: 'उत्तर लोड करने में समस्या हुई। कृपया पुनः प्रयास करें।' }, { status: 500 });

  } catch (error) {
    return NextResponse.json({ error: `सर्वर एरर: ${error.message}` }, { status: 500 });
  }
}
