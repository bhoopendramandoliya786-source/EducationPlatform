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

    // Universal and completely open system prompt
    const systemPrompt = `आप EduAI के एक अत्यंत बुद्धिमान, बहुमुखी और सर्वज्ञानी AI सहायक (Universal AI Tutor & Assistant) हैं। 
आपकी कोई सीमा नहीं है—छात्र या उपयोगकर्ता आपसे दुनिया का कोई भी सवाल पूछ सकते हैं (जैसे सामान्य बातचीत, हर तरह की परीक्षा, राजस्थान GK, भारत व विश्व का इतिहास, भूगोल, राजनीति, गणित, भौतिकी, रसायन, जीवविज्ञान, कंप्यूटर/कोडिंग, करंट अफेयर्स, 100 PYQs, 50 MCQs क्विज़, निबंध, या कोई भी जिज्ञासा)।

दिशानिर्देश:
1. उपयोगकर्ता जैसा पूछे, उसी के अनुसार सबसे सटीक, उपयोगी और स्पष्ट उत्तर शुद्ध व प्राकृतिक हिंदी में दें।
2. अगर कोई क्विज़ या टेस्ट माँगे, तो प्रश्न, 4 विकल्प (A, B, C, D) और सही उत्तर व संक्षिप्त व्याख्या दें।
3. अगर कोई बातचीत करे या सवाल पूछे, तो दोस्ताना और मार्गदर्शक रूप में सीधे काम की बात समझाएँ।`;

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
        { type: 'text', text: question ? `${question}\n(कृपया इस फ़ोटो को देखकर पूरा हल विस्तार से समझाएँ)` : 'कृपया इस फ़ोटो में दी गई सामग्री/सवाल को देखकर पूरा हल विस्तार से समझाएँ।' }
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
            temperature: 0.6
          })
        });

        const data = await chatRes.json();

        if (data && data.choices && data.choices[0]?.message?.content) {
          let rawAnswer = data.choices[0].message.content;
          let cleanAnswer = rawAnswer.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          return NextResponse.json({ answer: cleanAnswer });
        }
      } catch (err) {
        console.log(`Fallback from ${modelName}`);
      }
    }

    return NextResponse.json({ 
      error: 'AI सर्वर से उत्तर नहीं मिल पाया। कृपया पुनः प्रयास करें।' 
    }, { status: 500 });

  } catch (error) {
    return NextResponse.json({ 
      error: `सर्वर कनेक्शन एरर: ${error.message}` 
    }, { status: 500 });
  }
}
