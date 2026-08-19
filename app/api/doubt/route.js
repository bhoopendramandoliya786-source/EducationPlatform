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

    // Determine if request is Quiz or General / Image
    const isQuizReq = question && (question.toLowerCase().includes('quiz') || question.toLowerCase().includes('mcq') || question.toLowerCase().includes('टेस्ट'));

    let systemPrompt = `आप EduAI के एक सर्वश्रेष्ठ, अत्यंत ज्ञानी शिक्षक और परीक्षा विशेषज्ञ हैं।
छात्र के हर सवाल (राजस्थान GK, इतिहास, भूगोल, गणित, विज्ञान, PYQs) का उत्तर अत्यंत विस्तृत, स्पष्ट, बिंदुवार और शुद्ध हिंदी में दें। सीधे उत्तर से शुरुआत करें।`;

    if (isQuizReq) {
      systemPrompt = `आप EduAI के क्विज़ और टेस्ट मास्टर हैं।
जब भी छात्र क्विज़ या MCQs माँगें, आपको JSON फॉर्मेट में शुद्ध डेटा देना होगा ताकि ऐप उसे इंटरएक्टिव क्लिकेबल टेस्ट बना सके।
रिस्पॉन्स का फॉर्मेट केवल और केवल इस तरह का वैलिड JSON होना चाहिए:
{
  "quiz_title": "क्विज़ का नाम",
  "questions": [
    {
      "id": 1,
      "question": "प्रश्न यहाँ लिखें?",
      "options": ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"],
      "correctIndex": 0,
      "explanation": "इस उत्तर का संक्षिप्त और सटीक कारण।"
    }
  ]
}
कोई भी अतिरिक्त वाक्य, बैकग्राउंड थिंकिंग या <think> टैग न लिखें, केवल शुद्ध JSON दें।`;
    }

    // Prepare message payload
    let userContent = [];
    if (image) {
      userContent.push({
        type: 'image_url',
        image_url: { url: image }
      });
      userContent.push({
        type: 'text',
        text: question ? `${question}\n(कृपया इस फ़ोटो में दिए गए सवाल को पढ़कर पूरा विस्तृत हल हिंदी में समझाएँ)` : 'कृपया इस फ़ोटो में दिए गए सवाल को पढ़कर पूरा विस्तृत हल हिंदी में समझाएँ।'
      });
    } else {
      userContent = question;
    }

    // Active Models
    let activeModels = image ? ['llama-3.2-11b-vision-preview', 'llama-3.2-90b-vision-preview'] : ['gemma2-9b-it', 'mixtral-8x7b-32768'];

    try {
      const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const modelsData = await modelsRes.json();
      if (modelsData?.data?.length > 0) {
        if (image) {
          const visionModels = modelsData.data.filter(m => m.active !== false && m.id.includes('vision')).map(m => m.id);
          if (visionModels.length > 0) activeModels = visionModels;
        } else {
          const textModels = modelsData.data.filter(m => m.active !== false && !m.id.includes('guard') && !m.id.includes('whisper') && !m.id.includes('embed') && !m.id.includes('vision')).map(m => m.id);
          if (textModels.length > 0) activeModels = textModels;
        }
      }
    } catch (e) {
      console.log('Model check error:', e);
    }

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
              { role: 'user', content: userContent }
            ],
            temperature: 0.4
          })
        });

        const data = await chatRes.json();

        if (data && data.choices && data.choices[0]?.message?.content) {
          let rawAnswer = data.choices[0].message.content;
          let cleanAnswer = rawAnswer.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

          if (isQuizReq) {
            try {
              // Extract pure json
              const jsonMatch = cleanAnswer.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsedQuiz = JSON.parse(jsonMatch[0]);
                return NextResponse.json({ quiz: parsedQuiz });
              }
            } catch (pErr) {
              console.log('Quiz parse fallback to text');
            }
          }

          return NextResponse.json({ answer: cleanAnswer });
        }
      } catch (err) {
        console.log(`Failed with ${modelName}`);
      }
    }

    return NextResponse.json({ error: 'उत्तर लोड करने में समस्या हुई। कृपया पुनः प्रयास करें।' }, { status: 500 });

  } catch (error) {
    return NextResponse.json({ error: `सर्वर एरर: ${error.message}` }, { status: 500 });
  }
}
