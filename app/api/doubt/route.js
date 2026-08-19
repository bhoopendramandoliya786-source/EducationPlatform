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

    let systemPrompt = `आप एक अत्यंत बुद्धिमान, निष्पक्ष और ज्ञानी AI शिक्षक हैं।
छात्र जो भी सवाल पूछे (चाहे राजस्थान GK का कोई भी टॉपिक हो, भारत/विश्व इतिहास, विज्ञान, गणित, हिंदी, करंट अफेयर्स, कोडिंग या कोई भी प्रश्न), सिर्फ और सिर्फ उसी सवाल का सटीक, प्रामाणिक और विस्तृत उत्तर शुद्ध हिंदी में दें।
उत्तर में टेबल सिंबल (| |) का प्रयोग न करें। साफ़ और पठनीय बुलेट्स में समझाएँ।`;

    if (isQuizReq) {
      systemPrompt = `आप एक सटीक प्रतियोगी परीक्षा क्विज़ निर्माता हैं।
छात्र ने जिस विषय की क्विज़ मांगी है, केवल उसी विषय के 5 बेहतरीन प्रामाणिक प्रश्न शुद्ध JSON में तैयार करें:
{
  "is_quiz": true,
  "quiz_title": "विषय का नाम",
  "questions": [
    {
      "id": 1,
      "question": "प्रश्न?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "संक्षिप्त और सही व्याख्या"
    }
  ]
}
केवल शुद्ध JSON दें।`;
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
        { type: 'text', text: question ? `${question}\n(कृपया इस फ़ोटो को देखकर पूरा हल समझाएँ)` : 'कृपया इस फ़ोटो में लिखे सवाल को देखकर पूरा हल समझाएँ।' }
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
