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

    // Active verified fast model
    let activeModel = 'deepseek-r1-distill-llama-70b';
    try {
      const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const modelsData = await modelsRes.json();
      if (modelsData?.data?.length > 0) {
        const textModels = modelsData.data.filter(m => 
          (m.id.includes('llama-3') || m.id.includes('deepseek') || m.id.includes('gemma')) &&
          !m.id.includes('guard') &&
          !m.id.includes('whisper') &&
          !m.id.includes('arabic')
        );
        if (textModels.length > 0) {
          activeModel = textModels[0].id;
        }
      }
    } catch (e) {
      console.log('Model check fallback:', e);
    }

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
            content: 'आप EduAI के एक सर्वश्रेष्ठ, अत्यंत ज्ञानी शिक्षक हैं। छात्र के हर सवाल (GK, इतिहास, भूगोल, गणित, विज्ञान, PYQs, क्विज़) का उत्तर अत्यंत साफ़, सटीक, बिंदुवार (Bullet Points) और शुद्ध हिंदी में दें। अनावश्यक इंग्लिश या विचार न लिखें।'
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

    let rawAnswer = data?.choices?.[0]?.message?.content || '';

    if (rawAnswer) {
      // Clean <think> tags completely so student sees clean output
      const cleanAnswer = rawAnswer.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      return NextResponse.json({ answer: cleanAnswer || rawAnswer });
    }

    return NextResponse.json({ 
      error: data?.error?.message || 'उत्तर लोड करने में समस्या हुई।' 
    }, { status: 500 });

  } catch (error) {
    return NextResponse.json({ 
      error: `सर्वर एरर: ${error.message}` 
    }, { status: 500 });
  }
}
