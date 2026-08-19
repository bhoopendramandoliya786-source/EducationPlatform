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

    const isQuizReq = question && (
      question.toLowerCase().includes('quiz') || 
      question.toLowerCase().includes('mcq') || 
      question.toLowerCase().includes('टेस्ट') ||
      question.toLowerCase().includes('क्विज')
    );

    let systemPrompt = `आप राजस्थान व भारत की प्रतियोगी परीक्षाओं (RPSC RAS, SI, RSMSSB, REET, Police, SSC, UPSC) के वरिष्ठ प्रामाणिक शिक्षक हैं।

नियम:
1. उत्तर में कभी भी टूटी हुई टेबल सिंबल (| |), हैशटैग (##), या HTML टैग्स का प्रयोग न करें।
2. हमेशा साफ़, पठनीय बिंदुवार (Bullet Points) और आसान ट्रिक्स में उत्तर दें।
3. विषय के अनुसार 100% प्रामाणिक ऐतिहासिक तथ्य दें (जैसे राजस्थान प्रजामंडल आंदोलन में: जयपुर-1931 कपूरचंद पाटनी/जमनालाल बजाज, बूंदी-1931 कांतिलाल, मारवाड़-1934 जयनारायण व्यास, मेवाड़-1938 माणिक्यलाल वर्मा/बलवंत सिंह मेहता, बीकानेर-1936 मघाराम वैद्य, कोटा-1939 नयनूराम शर्मा आदि)।`;

    if (isQuizReq) {
      systemPrompt = `आप राजस्थान व भारत प्रतियोगी परीक्षाओं के प्रश्नपत्र निर्माता हैं।
अनिवार्य रूप से केवल शुद्ध JSON दें:
{
  "is_quiz": true,
  "quiz_title": "विषय का नाम",
  "questions": [
    {
      "id": 1,
      "question": "प्रामाणिक प्रश्न यहाँ लिखें?",
      "options": ["सटीक विकल्प A", "सटीक विकल्प B", "सटीक विकल्प C", "सटीक विकल्प D"],
      "correctIndex": 0,
      "explanation": "विस्तृत प्रमाणिक व्याख्या"
    }
  ]
}`;
    }

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
        { type: 'text', text: question ? `${question}\n(कृपया इस फ़ोटो को देखकर पूरा हल विस्तार से समझाएँ)` : 'कृपया इस फ़ोटो में लिखे सवाल को देखकर पूरा हल विस्तार से समझाएँ।' }
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
            temperature: 0.3
          })
        });

        const data = await chatRes.json();

        if (data && data.choices && data.choices[0]?.message?.content) {
          let rawAnswer = data.choices[0].message.content;
          let cleanAnswer = rawAnswer
            .replace(/<think>[\s\S]*?<\/think>/gi, '')
            .replace(/\|/g, '')
            .replace(/##+/g, '')
            .trim();

          if (isQuizReq) {
            try {
              const jsonMatch = rawAnswer.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.questions && parsed.questions.length > 0) {
                  return NextResponse.json({ quiz: parsed });
                }
              }
            } catch (e) {
              console.log('JSON parse fallback');
            }
          }

          return NextResponse.json({ answer: cleanAnswer });
        }
      } catch (err) {
        console.log(`Failed with ${modelName}`);
      }
    }

    return NextResponse.json({ error: 'AI सर्वर से उत्तर नहीं मिल पाया।' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: `सर्वर कनेक्शन एरर: ${error.message}` }, { status: 500 });
  }
}
