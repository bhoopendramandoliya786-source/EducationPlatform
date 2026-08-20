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

    let systemPrompt = `आप ChatGPT और Google Gemini स्तर के एक सर्वज्ञानी, अत्यधिक बुद्धिमान और विनम्र AI सहायक व शिक्षक हैं।
आप दुनिया के किसी भी विषय (भारत व राजस्थान सामान्य ज्ञान, इतिहास, विज्ञान, गणित, राजनीति, कोडिंग, करंट अफेयर्स, सामान्य बातचीत या निबंध) का सर्वोत्तम, तार्किक और सटीक उत्तर देने में सक्षम हैं।

प्रस्तुति नियम:
1. उत्तर स्पष्ट, आकर्षक, और बिंदुवार (Bullet points) रखें।
2. महत्वपूर्ण शब्दों को **बोल्ड** करें।
3. गणितीय सूत्रों और उदाहरणों को स्पष्ट रूप से समझाएँ।
4. कभी भी टूटी हुई टेबल सिंबल (| |) या भ्रामक टेक्स्ट न लिखें।
5. बातचीत की शुरुआत सीधे और आत्मीयता से करें।`;

    if (isQuizReq) {
      systemPrompt = `आप एक अंतरराष्ट्रीय स्तर के टेस्ट व क्विज़ मेकर हैं।
उपयोगकर्ता के मांगे गए विषय पर 5 बेहतरीन, प्रामाणिक और सटीक बहुविकल्पीय प्रश्न (MCQs) शुद्ध JSON में दें ताकि इंटरएक्टिव टच बटन बन सकें:
{
  "is_quiz": true,
  "quiz_title": "विषय का नाम",
  "questions": [
    {
      "id": 1,
      "question": "प्रश्न यहाँ लिखें?",
      "options": ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"],
      "correctIndex": 0,
      "explanation": "विस्तृत प्रमाणिक कारण व व्याख्या"
    }
  ]
}
केवल और केवल शुद्ध JSON दें।`;
    }

    let candidateModels = [
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'qwen/qwen3-32b',
      'meta-llama/llama-4-scout-17b-16e-instruct',
      'qwen/qwen3.6-27b'
    ];

    let userContent = question || 'कृपया इस प्रश्न का विस्तृत समाधान दें।';

    if (image) {
      userContent = [
        { type: 'image_url', image_url: { url: image } },
        { type: 'text', text: question ? `${question}\n(कृपया इस फ़ोटो का विश्लेषण करके पूरा समाधान समझाएँ)` : 'कृपया इस फ़ोटो को देखकर पूरा समाधान विस्तार से समझाएँ।' }
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
              console.log('JSON parse fallback to text');
            }
          }

          return NextResponse.json({ answer: cleanAnswer });
        }
      } catch (err) {
        console.log(`Failed with ${modelName}`);
      }
    }

    return NextResponse.json({ error: 'AI सर्वर व्यस्त है। कृपया पुनः प्रयास करें।' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: `सर्वर कनेक्शन एरर: ${error.message}` }, { status: 500 });
  }
}
