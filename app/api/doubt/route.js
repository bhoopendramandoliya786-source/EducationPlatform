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

    // Groq के एक्टिव मॉडल्स की डायनामिक लिस्ट
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

        if (textModels.length > 0) activeModels = textModels;
      }
    } catch (e) {
      console.log('Model list fetch error:', e);
    }

    const systemPrompt = `आप EduAI के एक सर्वगुण संपन्न, अत्यधिक ज्ञानी और अनुभवी शिक्षक हैं। 
छात्र आपसे कुछ भी पूछ सकते हैं:
1. PYQs (जैसे 100 PYQ, 50 PYQ): हर प्रश्न स्पष्ट नंबरिंग, 4 ऑप्शन्स और सही उत्तर व व्याख्या के साथ दें।
2. MCQs / Quiz: तुरंत साफ़-सुथरे बहुविकल्पीय प्रश्न तैयार करें।
3. थ्योरी/कॉन्सेप्ट: किसी भी विषय (इतिहास, राजस्थान GK, भूगोल, गणित, विज्ञान, राजनीति आदि) को आसान व बिंदुवार (Bullet points) समझाएँ।
4. उत्तर हमेशा शुद्ध, प्राकृतिक और उत्साहवर्धक हिंदी में दें। सीधे मुख्य उत्तर से शुरू करें।`;

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
              { role: 'system', content: systemPrompt },
              { role: 'user', content: question }
            ],
            temperature: 0.5,
            max_tokens: 3500
          })
        });

        const data = await chatRes.json();

        if (data && data.choices && data.choices[0]?.message?.content) {
          let rawAnswer = data.choices[0].message.content;
          const cleanAnswer = rawAnswer.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          return NextResponse.json({ answer: cleanAnswer || rawAnswer });
        }
      } catch (err) {
        console.log(`Failed with ${modelName}, switching to next...`);
      }
    }

    return NextResponse.json({ error: 'उत्तर लोड करने में समस्या हुई। कृपया पुनः प्रयास करें।' }, { status: 500 });

  } catch (error) {
    return NextResponse.json({ error: `सर्वर एरर: ${error.message}` }, { status: 500 });
  }
}
