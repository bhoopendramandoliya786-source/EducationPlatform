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

    // Check if user specifically requested an interactive quiz
    const isQuizReq = question && (
      question.toLowerCase().includes('quiz') || 
      question.toLowerCase().includes('mcq') || 
      question.toLowerCase().includes('टेस्ट') ||
      question.toLowerCase().includes('क्विज')
    );

    // Completely Open & Intelligent System Persona (Zero topic bias)
    const baseSystemPrompt = `You are a state-of-the-art, highly intelligent, and versatile AI Assistant (powered by the latest reasoning architecture, equivalent to ChatGPT and Google Gemini).

KEY PRINCIPLES:
1. Unlimited Scope: Answer ANY query the user asks with deep knowledge, clarity, and precision (Science, Math, Coding, History, GK, Exams, Creative writing, Philosophy, General conversation, etc.).
2. Natural Communication: Communicate fluently in natural conversational Hindi, English, or Hinglish based on the user's phrasing. Use emojis naturally where appropriate.
3. Clean Formatting: Use Markdown effectively with bold text for emphasis, bullet points for lists, and clear structure. Avoid raw repetitive pipes or broken formatting.
4. Accuracy & Depth: Provide step-by-step logical answers for calculations/problems and authentic, factual information for general knowledge.`;

    const quizSystemPrompt = `You are an expert interactive test creator. The user wants a quiz/test. Return ONLY a valid JSON object matching this structure:
{
  "is_quiz": true,
  "quiz_title": "Quiz Title with relevant Emoji",
  "questions": [
    {
      "id": 1,
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Clear explanation of the correct answer."
    }
  ]
}
Do not include any other text, markdown blocks, or commentary. Only pure JSON.`;

    // Construct conversation payload with chat history for true context memory
    let messages = [
      { role: 'system', content: isQuizReq ? quizSystemPrompt : baseSystemPrompt }
    ];

    if (Array.isArray(messagesHistory) && messagesHistory.length > 0) {
      const recentHistory = messagesHistory.slice(-6);
      for (const msg of recentHistory) {
        if (msg.text && typeof msg.text === 'string') {
          messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.text
          });
        }
      }
    }

    if (image) {
      messages.push({
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: image } },
          { type: 'text', text: question ? `${question}\n(Please analyze this image and provide a thorough solution)` : 'Please analyze and explain this photo in detail.' }
        ]
      });
    } else {
      messages.push({ role: 'user', content: question });
    }

    // High Intelligence Production Models
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
            temperature: 0.6
          })
        });

        const data = await chatRes.json();

        if (data && data.choices && data.choices[0]?.message?.content) {
          let rawAnswer = data.choices[0].message.content;
          let cleanAnswer = rawAnswer
            .replace(/<think>[\s\S]*?<\/think>/gi, '')
            .replace(/```json/gi, '')
            .replace(/```/gi, '')
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
              console.log('Quiz parse fallback to raw text');
            }
          }

          return NextResponse.json({ answer: cleanAnswer });
        }
      } catch (err) {
        console.log(`Failed on model: ${modelName}, trying next...`);
      }
    }

    return NextResponse.json({ error: 'AI सर्वर व्यस्त है। कृपया पुनः प्रयास करें।' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: `सर्वर कनेक्शन एरर: ${error.message}` }, { status: 500 });
  }
}
