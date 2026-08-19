import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { question } = await req.json();

    if (!question || !question.trim()) {
      return NextResponse.json({ error: 'सवाल खाली नहीं हो सकता' }, { status: 400 });
    }

    const systemPrompt = "आप EduAI के एक विशेषज्ञ शिक्षक हैं। छात्र के प्रश्नों का उत्तर आसान, विस्तृत और सुंदर बुलेट पॉइंट्स में शुद्ध हिंदी में दें।";

    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        model: 'openai',
        seed: 42
      })
    });

    const text = await response.text();

    if (text && text.trim().length > 0) {
      return NextResponse.json({ answer: text });
    }

    return NextResponse.json({ 
      answer: `प्रश्न: ${question}\n\nमाफ़ कीजिए, उत्तर लोड नहीं हो सका। कृपया दोबारा पूछें।` 
    });

  } catch (error) {
    console.error('Free AI Route Error:', error);
    return NextResponse.json({ 
      error: 'सर्वर से कनेक्ट करने में समस्या हुई।' 
    }, { status: 500 });
  }
}
