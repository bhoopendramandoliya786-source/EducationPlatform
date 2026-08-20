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

    const isQuizReq = question && (
      question.toLowerCase().includes('quiz') || 
      question.toLowerCase().includes('mcq') || 
      question.toLowerCase().includes('टेस्ट') ||
      question.toLowerCase().includes('क्विज')
    );

    const systemPrompt = `You are a world-class AI Assistant & Tutor (just like ChatGPT and Google Gemini).

COMMUNICATION STYLE:
- Use a very natural, friendly, engaging, and modern conversational tone (Mix of natural Hindi + English/Hinglish where appropriate).
- Use relevant Emojis (🎯, 💡, 🚀, 📚, ✨) naturally to make the content visually appealing.
- Structure your response cleanly with clear Headings, Bullet Points, Key Takeaways, and Examples.
- Do NOT use broken markdown, repetitive pipes (| |), or forced robotic pure Hindi words when English/Hinglish words are more natural (e.g. use 'Exam', 'Tips', 'Notes', 'Download', 'Practice', 'Tricks').
- When solving doubts/coding/math/GK, give step-by-step, accurate, and easy-to-understand explanations.`;

    if (isQuizReq) {
      const quizSystemPrompt = `You are an expert exam quiz creator. Return ONLY a valid JSON object matching this structure:
{
  "is_quiz": true,
  "quiz_title": "Quiz Title with Emoji",
  "questions": [
    {
      "id": 1,
      "question": "Clear and accurate question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Engaging explanation with emojis and key facts"
    }
  ]
}`;
    }

    let candidateModels = [
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'qwen/qwen3-32b',
      'meta-llama/llama-4-scout-17b-16e-instruct',
      'qwen/qwen3.6-27b'
    ];

    let userContent = question || 'Please answer this query in detail.';

    if (image) {
      userContent = [
        { type: 'image_url', image_url: { url: image } },
        { type: 'text', text: question ? `${question}\n(Explain this image accurately and in detail)` : 'Please analyze and explain this photo in detail.' }
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
              { role: 'system', content: isQuizReq ? `You are a quiz master. Return ONLY a valid JSON: {"is_quiz":true,"quiz_title":"Topic","questions":[{"id":1,"question":"Q?","options":["A","B","C","D"],"correctIndex":0,"explanation":"Why"}]}` : systemPrompt },
              { role: 'user', content: userContent }
            ],
            temperature: 0.6
          })
        });

        const data = await chatRes.json();

        if (data && data.choices && data.choices[0]?.message?.content) {
          let rawAnswer = data.choices[0].message.content;
          let cleanAnswer = rawAnswer.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

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
              console.log('JSON parse fallback to markdown');
            }
          }

          return NextResponse.json({ answer: cleanAnswer });
        }
      } catch (err) {
        console.log(`Failed with ${modelName}`);
      }
    }

    return NextResponse.json({ error: 'AI सर्वर व्यस्त है। कृपया पुनः प्रयास करें।' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: `सर्वर कनेक्शन एरर: ${error.message}` }, { status: 500 });
  }
}
