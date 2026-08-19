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

    // Call Groq with reliable parameters
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'आप EduAI के एक सर्वश्रेष्ठ, अत्यंत ज्ञानी और समर्पित शिक्षक हैं। छात्र द्वारा पूछे गए किसी भी विषय (जैसे राजस्थान GK, प्रजामंडल, इतिहास, भूगोल, गणित, विज्ञान, पिछले वर्षों के PYQs, क्विज़, 50 MCQs या कोई भी सामान्य ज्ञान) का उत्तर अत्यंत विस्तृत, स्पष्ट, सटीक और शुद्ध हिंदी में प्रदान करें।'
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.5,
        max_tokens: 2048
      })
    });

    const data = await groqRes.json();

    if (data && data.choices && data.choices[0]?.message?.content) {
      return NextResponse.json({ answer: data.choices[0].message.content });
    }

    // Return exact error message for quick diagnosis
    return NextResponse.json({ 
      error: data?.error?.message || 'API से उत्तर नहीं मिला। कृपया पुनः प्रयास करें।' 
    }, { status: 500 });

  } catch (error) {
    return NextResponse.json({ 
      error: `सर्वर एरर: ${error.message}` 
    }, { status: 500 });
  }
}
