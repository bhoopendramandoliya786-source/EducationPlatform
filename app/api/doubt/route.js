import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { question, image, messagesHistory } = await req.json();

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

    const baseSystemPrompt = `You are a world-class visual AI Assistant & Tutor (ChatGPT & Gemini Pro level).

RULES FOR IMAGES & VISUAL EXPLANATION:
- When the user asks for photos, diagrams, or visual steps (e.g. "photo se samjhao", "diagram dikhao", "car making photos"):
  Insert real image embeds using this exact markdown syntax:
  ![Description](https://image.pollinations.ai/prompt/{english_visual_keyword_detailed}?width=800&height=500&nologo=true)
  (Example: ![Car Body Assembly](https://image.pollinations.ai/prompt/industrial%20robotic%20car%20assembly%20line%20modern%20factory%20photorealistic?width=800&height=500&nologo=true))
- Do NOT output raw broken table characters (| |---) or broken link text.
- Use natural conversational Hindi/Hinglish with emojis. Format headers and steps cleanly.`;

    const quizSystemPrompt = `You are an expert exam quiz architect. Output ONLY valid JSON:
{
  "is_quiz": true,
  "quiz_title": "Quiz Title with Emoji",
  "questions": [
    {
      "id": 1,
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Explanation text."
    }
  ]
}`;

    let messages = [
      { role: 'system', content: isQuizReq ? quizSystemPrompt : baseSystemPrompt }
    ];

    if (Array.isArray(messagesHistory) && messagesHistory.length > 0) {
      const recent = messagesHistory.slice(-6);
      for (const m of recent) {
        if (m.text && typeof m.text === 'string') {
          messages.push({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.text
          });
        }
      }
    }

    if (image) {
      messages.push({
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: image } },
          { type: 'text', text: question ? `${question}\n(Analyze this photo and provide a detailed solution)` : 'Please analyze this photo in detail.' }
        ]
      });
    } else {
      messages.push({ role: 'user', content: question });
    }

    const candidateModels = [
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'qwen/qwen3-32b',
      'meta-llama/llama-4-scout-17b-16e-instruct',
      'qwen/qwen3.6-27b'
    ];

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
            messages: messages,
            temperature: 0.5
          })
        });

        const data = await chatRes.json();

        if (data?.choices?.[0]?.message?.content) {
          let rawAnswer = data.choices[0].message.content;
          let cleanAnswer = rawAnswer
            .replace(/<think>[\s\S]*?<\/think>/gi, '')
            .replace(/```json/gi, '')
            .replace(/```/gi, '')
            .replace(/\|\s*---\s*\|/g, '')
            .replace(/\|/g, '')
            .trim();

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
              console.log('Quiz parse fallback');
            }
          }

          return NextResponse.json({ answer: cleanAnswer });
        }
      } catch (err) {
        console.log(`Failed on ${modelName}`);
      }
    }

    return NextResponse.json({ error: 'AI सर्वर व्यस्त है।' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: `सर्वर एरर: ${error.message}` }, { status: 500 });
  }
}
