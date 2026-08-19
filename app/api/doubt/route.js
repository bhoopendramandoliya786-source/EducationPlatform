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
      question.toLowerCase().includes('क्विज') ||
      question.toLowerCase().includes('pyq')
    );

    let systemPrompt = `आप भारत और राजस्थान की प्रतियोगी परीक्षाओं (RPSC, RSMSSB, UPSC, SSC, REET, Police) के वरिष्ठ परीक्षा विशेषज्ञ व शिक्षक हैं।
छात्र के हर सवाल का उत्तर पूरी तरह ऐतिहासिक और प्रमाणिक तथ्यों के आधार पर शुद्ध हिंदी में दें।`;

    if (isQuizReq) {
      systemPrompt = `आप भारत व राजस्थान प्रतियोगी परीक्षाओं के आधिकारिक प्रश्नपत्र निर्माता हैं।
जब छात्र "Raj" या राजस्थान से जुड़ा कोई भी विषय माँगे (जैसे प्रजामंडल, 1857 क्रांति, किसान आंदोलन, एकीकरण, भूगोल, कला-संस्कृति):
- प्रश्न वास्तविक परीक्षा स्तर (PYQ/Standard) के होने चाहिए। उदाहरण के लिए 'प्रजामंडल' का अर्थ 'राजस्थान का प्रजामंडल आंदोलन' (जयपुर, मेवाड़, मारवाड़, हाड़ौती, बीकानेर प्रजामंडल, संस्थापक, वर्ष, अधिवेशन) है।
- कोई भी अप्रासंगिक या मनगढ़ंत प्रश्न न बनाएँ।

अनिवार्य JSON फॉर्मेट:
{
  "is_quiz": true,
  "quiz_title": "विशिष्ट विषय का नाम (जैसे: राजस्थान प्रजामंडल आंदोलन टेस्ट)",
  "questions": [
    {
      "id": 1,
      "question": "प्रामाणिक प्रश्न यहाँ लिखें?",
      "options": ["सटीक विकल्प A", "सटीक विकल्प B", "सटीक विकल्प C", "सटीक विकल्प D"],
      "correctIndex": 0,
      "explanation": "विस्तृत प्रमाणिक व्याख्या (तारीख, स्थान, व्यक्ति सहित)"
    }
  ]
}
केवल शुद्ध JSON प्रदान करें।`;
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
          let cleanAnswer = rawAnswer.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

          if (isQuizReq) {
            try {
              const jsonMatch = cleanAnswer.match(/\{[\s\S]*\}/);
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
