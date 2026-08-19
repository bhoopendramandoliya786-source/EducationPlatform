import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { question } = await req.json();

    if (!question || !question.trim()) {
      return NextResponse.json({ error: 'सवाल खाली नहीं हो सकता' }, { status: 400 });
    }

    const fullPrompt = `आप EduAI के वरिष्ठ शिक्षक हैं। छात्र के निम्नलिखित सवाल का विस्तृत, स्पष्ट और बिंदुवार उत्तर शुद्ध हिंदी में दें। यदि परीक्षा संबंधी टॉपिक हो तो महत्वपूर्ण बिंदु, इतिहास/थ्योरी, और अभ्यास हेतु 2-3 PYQs/MCQs भी शामिल करें:\n\nप्रश्न: ${question}`;

    // Reliable Free High-Performance AI Endpoint
    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: fullPrompt }
        ],
        jsonMode: false
      })
    });

    const answer = await res.text();

    if (answer && !answer.includes('"error"') && answer.trim().length > 10) {
      return NextResponse.json({ answer });
    }

    // Direct Clean Secondary Request
    const backupRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}`);
    const backupText = await backupRes.text();

    if (backupText && !backupText.includes('"error"') && backupText.trim().length > 10) {
      return NextResponse.json({ answer: backupText });
    }

    return NextResponse.json({ 
      error: 'उत्तर लोड नहीं हो सका। कृपया पुनः प्रयास करें।' 
    }, { status: 500 });

  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json({ 
      error: 'सर्वर से संपर्क नहीं हो पाया।' 
    }, { status: 500 });
  }
}
