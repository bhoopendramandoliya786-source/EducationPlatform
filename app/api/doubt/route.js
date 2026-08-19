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

    // Groq के लाइव एक्टिव मॉडल्स
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

    const systemPrompt = `आप EduAI के एक सर्वश्रेष्ठ शिक्षक और परीक्षा विशेषज्ञ हैं।
नियम:
1. उत्तर हमेशा साफ़, पठनीय और शुद्ध हिंदी में दें।
2. टेबल सिंबल (| |), HTML टैग (<br>) या हैशटैग (###) का उपयोग बिल्कुल न करें।
3. क्विज़ और PYQ के लिए साफ़ नंबरिंग (1, 2, 3...) और विकल्पों (A, B, C, D) को अलग-अलग लाइनों पर लिखें।
4. महत्वपूर्ण शीर्षकों को सिर्फ **बोल्ड** करें।
5. उत्तर के अंत में सही उत्तर और उसकी छोटी व्याख्या स्पष्ट रूप से दें।`;

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
            temperature: 0.4
          })
        });

        const data = await chatRes.json();

        if (data && data.choices && data.choices[0]?.message?.content) {
          let rawAnswer = data.choices[0].message.content;
          // Clean thinking and raw HTML/pipes
          let cleanAnswer = rawAnswer
            .replace(/<think>[\s\S]*?<\/think>/gi, '')
            .replace(/<br\s*[\/]?>/gi, '\n')
            .trim();
          return NextResponse.json({ answer: cleanAnswer || rawAnswer });
        }
      } catch (err) {
        console.log(`Failed with ${modelName}, trying next...`);
      }
    }

    return NextResponse.json({ error: 'उत्तर लोड करने में समस्या हुई। कृपया पुनः प्रयास करें।' }, { status: 500 });

  } catch (error) {
    return NextResponse.json({ error: `सर्वर एरर: ${error.message}` }, { status: 500 });
  }
}
