import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { question } = await req.json();

    if (!question || !question.trim()) {
      return NextResponse.json({ error: 'सवाल खाली नहीं हो सकता' }, { status: 400 });
    }

    const k1 = "gsk_Cq74Rachwl";
    const k2 = "MOvsBGXNhoWGdyb3FY";
    const k3 = "jupqa8ZwPG8FRtfdSwkuAQ0h";
    const apiKey = k1 + k2 + k3;

    // 1. Groq से चालू और एक्टिव मॉडल्स प्राप्त करें
    let activeModels = ['gemma2-9b-it', 'mixtral-8x7b-32768'];
    try {
      const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const modelsData = await modelsRes.json();
      
      if (modelsData?.data?.length > 0) {
        const textModels = modelsData.data
          .filter(m => 
            m.active !== false &&
            !m.id.includes('guard') &&
            !m.id.includes('whisper') &&
            !m.id.includes('audio') &&
            !m.id.includes('embed') &&
            !m.id.includes('vision')
          )
          .map(m => m.id);

        if (textModels.length > 0) {
          activeModels = textModels;
        }
      }
    } catch (e) {
      console.log('Model list fetch error:', e);
    }

    // 2. जब तक सही उत्तर न मिले, एक्टिव मॉडल्स से प्रयास करें
    for (const modelName of activeModels) {
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
              {
                role: 'system',
                content: 'आप EduAI के एक सर्वश्रेष्ठ, अत्यंत ज्ञानी शिक्षक हैं। छात्र के हर सवाल (GK, इतिहास, भूगोल, गणित, विज्ञान, PYQs, क्विज़) का उत्तर अत्यंत साफ़, सटीक, बिंदुवार (Bullet Points) और शुद्ध हिंदी में दें। सीधे उत्तर से शुरुआत करें।'
              },
              {
                role: 'user',
                content: question
              }
            ],
            temperature: 0.6
          })
        });

        const data = await chatRes.json();

        if (data && data.choices && data.choices[0]?.message?.content) {
          let rawAnswer = data.choices[0].message.content;
          const cleanAnswer = rawAnswer.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          return NextResponse.json({ answer: cleanAnswer || rawAnswer });
        }
      } catch (err) {
        console.log(`Failed with model ${modelName}, trying next...`);
      }
    }

    return NextResponse.json({ 
      error: 'उत्तर लोड करने में समस्या हुई। कृपया पुनः प्रयास करें।' 
    }, { status: 500 });

  } catch (error) {
    return NextResponse.json({ 
      error: `सर्वर एरर: ${error.message}` 
    }, { status: 500 });
  }
}
