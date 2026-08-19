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

    // 1. Groq के लाइव मॉडल्स में से सिर्फ़ मुख्य टेक्स्ट चैट मॉडल चुनें (Guard / Whisper हटाकर)
    let activeModel = 'llama3-8b-8192';
    try {
      const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const modelsData = await modelsRes.json();
      if (modelsData && modelsData.data && modelsData.data.length > 0) {
        const chatModels = modelsData.data.filter(m => 
          (m.id.includes('llama') || m.id.includes('mixtral') || m.id.includes('gemma') || m.id.includes('deepseek')) &&
          !m.id.includes('guard') && 
          !m.id.includes('whisper') &&
          !m.id.includes('embed')
        );

        if (chatModels.length > 0) {
          activeModel = chatModels[0].id;
        }
      }
    } catch (e) {
      console.log('Model selection fallback:', e);
    }

    // 2. चैट मॉडल से विस्तृत उत्तर प्राप्त करें
    const chatRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: activeModel,
        messages: [
          {
            role: 'system',
            content: 'आप EduAI के एक सर्वश्रेष्ठ, अत्यंत ज्ञानी और समर्पित शिक्षक हैं। छात्र द्वारा पूछे गए किसी भी विषय (जैसे राजस्थान GK, प्रजामंडल, इतिहास, भूगोल, गणित, विज्ञान, पिछले वर्षों के PYQs, क्विज़, 50 MCQs या कोई भी सामान्य ज्ञान) का उत्तर अत्यंत विस्तृत, स्पष्ट, सटीक और शुद्ध हिंदी में प्रदान करें। जहाँ आवश्यकता हो, वहाँ बिंदुवार (Bullet points) समझाएँ।'
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
      return NextResponse.json({ answer: data.choices[0].message.content });
    }

    return NextResponse.json({ 
      error: data?.error?.message || 'API से उत्तर नहीं मिला। कृपया पुनः प्रयास करें।' 
    }, { status: 500 });

  } catch (error) {
    return NextResponse.json({ 
      error: `सर्वर एरर: ${error.message}` 
    }, { status: 500 });
  }
}
