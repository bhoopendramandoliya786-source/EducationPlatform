import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { question } = await req.json();

    if (!question || !question.trim()) {
      return NextResponse.json({ error: 'सवाल खाली नहीं हो सकता' }, { status: 400 });
    }

    const systemPrompt = `आप EduAI के एक उच्च-स्तरीय शिक्षक और विशेषज्ञ मार्गदर्शक हैं।
छात्र के सवाल का उत्तर अत्यंत विस्तृत, प्रामाणिक और उच्च-गुणवत्ता वाले हिंदी प्रारूप में दें:
1. संपूर्ण थ्योरी और पृष्ठभूमि (Concepts & Deep Theory)
2. परीक्षा उपयोगी महत्वपूर्ण बिंदु व मुख्य तिथियां (Key Facts/Dates)
3. पिछले वर्षों के प्रश्न (Previous Year Questions - PYQs)
4. अभ्यास हेतु बहुविकल्पीय प्रश्न (MCQs with Explanations)
उत्तर हमेशा बिंदुवार, स्वच्छ और पढ़ने में आसान बनाएं।`;

    const promptText = `${systemPrompt}\n\nछात्र का प्रश्न: ${question}`;

    // Free High-Power Open LLM Engine (DeepSeek / Mistral Backend)
    const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(promptText)}?model=deepseek&system=${encodeURIComponent(systemPrompt)}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    let answer = await response.text();

    // अगर पहले मॉडल से उत्तर न मिले तो बैकअप मॉडल
    if (!answer || answer.includes('Payment Required') || answer.length < 20) {
      const fallbackRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(promptText)}?model=mistral`, {
        method: 'GET'
      });
      answer = await fallbackRes.text();
    }

    if (answer && answer.trim().length > 0) {
      return NextResponse.json({ answer });
    }

    return NextResponse.json({ 
      error: 'उत्तर लोड करने में समस्या हुई, कृपया दोबारा प्रयास करें।' 
    }, { status: 500 });

  } catch (error) {
    console.error('AI Engine Error:', error);
    return NextResponse.json({ 
      error: 'सर्वर व्यस्त है। कृपया 10 सेकंड बाद पुनः प्रयास करें।' 
    }, { status: 500 });
  }
}
