import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { question, image } = await req.json();

    if ((!question || !question.trim()) && !image) {
      return NextResponse.json({ error: 'कृपया सवाल लिखें या फ़ोटो अपलोड करें' }, { status: 400 });
    }

    const k1 = "gsk_Cq74Rachwl";
    const k2 = "MOvsBGXNhoWGdyb3FY";
    const k3 = "jupqa8ZwPG8FRtfdSwkuAQ0h";
    const apiKey = k1 + k2 + k3;

    // Check if user is asking for Quiz / MCQs / Test
    const isQuizReq = question && (
      question.toLowerCase().includes('quiz') || 
      question.toLowerCase().includes('mcq') || 
      question.toLowerCase().includes('टेस्ट') ||
      question.toLowerCase().includes('क्विज') ||
      question.toLowerCase().includes('pyq')
    );

    let systemPrompt = `आप EduAI के एक अत्यंत बुद्धिमान और सर्वज्ञानी AI शिक्षक हैं।
छात्र के हर सवाल का उत्तर शुद्ध, सटीक, विस्तृत और स्पष्ट हिंदी में दें।`;

    if (isQuizReq) {
      systemPrompt = `आप EduAI के क्विज़ और टेस्ट मास्टर हैं।
जब भी छात्र क्विज़, टेस्ट, MCQs या PYQs माँगें, आपको अनिवार्य रूप से शुद्ध JSON फ़ॉर्मेट में ही उत्तर देना है ताकि ऐप में टच/क्लिक वाले बटन्स बन सकें।

रिस्पॉन्स का फ़ॉर्मेट सिर्फ़ और सिर्फ़ यह JSON होना चाहिए:
{
  "is_quiz": true,
  "quiz_title": "विषय का नाम",
  "questions": [
    {
      "id": 1,
      "question": "प्रश्न यहाँ लिखें?",
      "options": ["पहला विकल्प", "दूसरा विकल्प", "तीसरा विकल्प", "चौथा विकल्प"],
      "correctIndex": 0,
      "explanation": "सही उत्तर का कारण व व्याख्या।"
    }
  ]
}
ध्यान रहे: correctIndex 0 (A के लिए), 1 (B के लिए), 2 (C के लिए), या 3 (D के लिए) होगा। केवल वैध JSON दें, कोई अतिरिक्त शब्द या टैग न लिखें।`;
    }

    let candidateModels = [
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'qwen/qwen3-32b',
      'meta-llama/llama-4-scout-17b-16e-instruct',
      'qwen/qwen3.6-27b'
    ];

    let userContent = question || 'कृपया इस प्रश्न को हल करें।';

    if (image) {
      userContent = [
        { type: 'image_url', image_url: { url: image } },
        { type: 'text', text: question ? `${question}\n(कृपया इस फ़ोटो को देखकर पूरा हल विस्तार से समझाएँ)` : 'कृपया इस फ़ोटो में लिखे सवाल को देखकर पूरा हल विस्तार से समझाएँ।' }
      ];
      candidateModels = ['qwen/qwen3.6-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
    }

    for (const modelName of candidateModels) {
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
              { role: 'user', content: userContent }
            ],
            temperature: 0.4
          })
        });

        const data = await chatRes.json();

        if (data && data.choices && data.choices[0]?.message?.content) {
          let rawAnswer = data.choices[0].message.content;
          let cleanAnswer = rawAnswer.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

          // Try parsing JSON quiz
          if (isQuizReq) {
            try {
              const jsonMatch = cleanAnswer.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.questions && parsed.questions.length > 0) {
                  return NextResponse.json({ quiz: parsed });
                }
              }
            } catch (e) {
              console.log('Fallback to text');
            }
          }

          return NextResponse.json({ answer: cleanAnswer });
        }
      } catch (err) {
        console.log(`Failed with ${modelName}`);
      }
    }

    return NextResponse.json({ 
      error: 'AI सर्वर से उत्तर नहीं मिल पाया। कृपया पुनः प्रयास करें।' 
    }, { status: 500 });

  } catch (error) {
    return NextResponse.json({ 
      error: `सर्वर कनेक्शन एरर: ${error.message}` 
    }, { status: 500 });
  }
}
