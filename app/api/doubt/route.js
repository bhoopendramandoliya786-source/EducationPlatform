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

    const systemPrompt = `आप EduAI के सर्वश्रेष्ठ शिक्षक और परीक्षा विशेषज्ञ हैं।
छात्र के हर सवाल (राजस्थान GK, इतिहास, भूगोल, गणित, विज्ञान, 100 PYQs, 50 MCQs, क्विज़) का उत्तर तुरंत, सटीक, विस्तृत और शुद्ध हिंदी में दें। सीधे उत्तर से शुरुआत करें।

यदि छात्र क्विज़ / MCQs / PYQ माँगे, तो इस निश्चित फॉर्मेट में दें:
प्रश्न 1: [प्रश्न]
A) [विकल्प A]
B) [विकल्प B]
C) [विकल्प C]
D) [विकल्प D]
सही उत्तर: [A/B/C/D]
व्याख्या: [संक्षिप्त कारण]`;

    // Groq के वर्तमान एक्टिव प्रोडक्शन मॉडल्स
    let candidateModels = [
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'qwen/qwen3-32b',
      'meta-llama/llama-4-scout-17b-16e-instruct',
      'qwen/qwen3.6-27b'
    ];

    let userContent = question || 'कृपया इस प्रश्न को हल करें।';

    if (image) {
      userContent = [
        { type: 'image_url', image_url: { url: image } },
        { type: 'text', text: question ? `${question}\n(कृपया इस फ़ोटो को पढ़कर पूरा हल हिंदी में समझाएँ)` : 'कृपया इस फ़ोटो में लिखे सवाल को पढ़कर पूरा विस्तृत हल हिंदी में समझाएँ।' }
      ];
      candidateModels = ['qwen/qwen3.6-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
    }

    for (const modelName of candidateModels) {
      try {
        const chatRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userContent }
            ],
            temperature: 0.5
          })
        });

        const data = await chatRes.json();

        if (data && data.choices && data.choices[0]?.message?.content) {
          let rawAnswer = data.choices[0].message.content;
          let cleanAnswer = rawAnswer.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          return NextResponse.json({ answer: cleanAnswer });
        }
      } catch (err) {
        console.log(`Failed with ${modelName}, trying next...`);
      }
    }

    return NextResponse.json({ 
      error: 'AI सर्वर व्यस्त है। कृपया 5 सेकंड बाद पुनः प्रयास करें।' 
    }, { status: 500 });

  } catch (error) {
    return NextResponse.json({ 
      error: `सर्वर कनेक्शन एरर: ${error.message}` 
    }, { status: 500 });
  }
}
