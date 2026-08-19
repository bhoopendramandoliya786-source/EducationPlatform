import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { question } = await req.json();

    if (!question || !question.trim()) {
      return NextResponse.json({ error: 'सवाल खाली नहीं हो सकता' }, { status: 400 });
    }

    const systemPrompt = "आप EduAI के एक सर्वश्रेष्ठ विशेषज्ञ शिक्षक हैं। छात्र द्वारा पूछे गए किसी भी सवाल का उत्तर अत्यंत विस्तृत, प्रामाणिक, उच्च-स्तरीय और बिंदुवार हिंदी में दें। यदि परीक्षा संबंधी टॉपिक हो तो पूरी थ्योरी, महत्वपूर्ण बिंदु, मुख्य तिथियां, पिछले वर्षों के प्रश्न (PYQs) और अभ्यास के लिए MCQs व्याख्या सहित प्रदान करें।";

    // 1. DuckDuckGo Official AI Backend (GPT-4o-mini / Haiku Engine - No API Key Needed)
    try {
      const statusRes = await fetch('https://duckduckgo.com/duckchat/v1/status', {
        headers: {
          'x-vqd-accept': '1',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const vqd = statusRes.headers.get('x-vqd-4');

      if (vqd) {
        const chatRes = await fetch('https://duckduckgo.com/duckchat/v1/chat', {
          method: 'POST',
          headers: {
            'x-vqd-4': vqd,
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'user', content: `${systemPrompt}\n\nछात्र का प्रश्न: ${question}` }
            ]
          })
        });

        const rawText = await chatRes.text();
        const lines = rawText.split('\n');
        let fullAnswer = '';

        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const json = JSON.parse(line.slice(6));
              if (json.message) fullAnswer += json.message;
            } catch (e) {}
          }
        }

        if (fullAnswer.trim().length > 15) {
          return NextResponse.json({ answer: fullAnswer.trim() });
        }
      }
    } catch (e) {
      console.log('Engine 1 fallback triggered');
    }

    // 2. High-Capacity Backup AI Engine
    const backupRes = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        model: 'openai',
        seed: Math.floor(Math.random() * 1000)
      })
    });

    const backupText = await backupRes.text();
    if (backupText && !backupText.includes('"error"') && backupText.trim().length > 15) {
      return NextResponse.json({ answer: backupText.trim() });
    }

    return NextResponse.json({ 
      error: 'उत्तर लोड करने में समस्या हुई। कृपया दोबारा पूछें।' 
    }, { status: 500 });

  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json({ 
      error: 'सर्वर व्यस्त है, कृपया पुनः प्रयास करें।' 
    }, { status: 500 });
  }
}
