import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { question, image, pdfText, messagesHistory, mode } = await req.json();

    if ((!question || !question.trim()) && !image && !pdfText) {
      return NextResponse.json({ error: 'कृपया सवाल लिखें या फ़ाइल अपलोड करें' }, { status: 400 });
    }

    const k1 = "gsk_Cq74Rachwl";
    const k2 = "MOvsBGXNhoWGdyb3FY";
    const k3 = "jupqa8ZwPG8FRtfdSwkuAQ0h";
    const apiKey = k1 + k2 + k3;

    // 1. Tool: Image Generation
    const isImageGeneration = mode === 'image' || (
      question && (
        question.toLowerCase().includes('photo banao') ||
        question.toLowerCase().includes('image banao') ||
        question.toLowerCase().includes('फोटो बनाओ') ||
        question.toLowerCase().includes('चित्र बनाओ') ||
        question.toLowerCase().includes('tasveer')
      )
    );

    if (isImageGeneration) {
      const cleanPrompt = encodeURIComponent(
        question
          .replace(/photo banao|image banao|tasveer|फोटो बनाओ|चित्र बनाओ|dikhao/gi, '')
          .trim() || 'ultra realistic 8k masterpiece'
      );
      const generatedImageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}%20ultra%20detailed%20hd%20photorealistic?width=1024&height=768&nologo=true`;
      
      return NextResponse.json({
        answer: `यहाँ आपकी बनाई गई HD AI फोटो है:\n\n![${question}](${generatedImageUrl})\n\n💡 आप इसे नीचे दिए गए बटन से सीधे डाउनलोड कर सकते हैं।`
      });
    }

    // 2. Tool: Interactive Quiz
    const isQuizReq = mode === 'quiz' || (question && (
      question.toLowerCase().includes('quiz') || 
      question.toLowerCase().includes('mcq') || 
      question.toLowerCase().includes('टेस्ट') ||
      question.toLowerCase().includes('क्विज')
    ));

    // 3. Tool: Deep Research / Canvas / Standard Chat Prompt
    let baseSystemPrompt = `You are EduAI Super Intelligence (powered by Gemini & ChatGPT Pro architecture).

CORE CAPABILITIES:
1. Deep Research & Logical Reasoning: Break down any query (Math, Science, History, GK, Code, Exam prep) with clear, authentic, and step-by-step reasoning.
2. Natural Tone: Use engaging Hindi/Hinglish with relevant emojis (🚀, 💡, 🎯).
3. Presentation: Format with clear Bold headings and clean bullet points.
${pdfText ? `\n\nATTACHED DOCUMENT / BOOK CONTENT:\n${pdfText.substring(0, 4000)}\n(Answer the user query strictly using the attached document context wherever applicable)` : ''}
${mode === 'research' ? '\nMODE: DEEP RESEARCH REPORT (Provide a thorough, comprehensive, multi-section in-depth report with historical/technical facts)' : ''}
${mode === 'canvas' ? '\nMODE: CANVAS LIVE EDITOR (Provide clean, ready-to-edit essays, code, or structured notes)' : ''}`;

    const quizSystemPrompt = `You are an expert exam quiz architect. Output ONLY valid JSON:
{
  "is_quiz": true,
  "quiz_title": "Interactive Quiz Title with Emoji",
  "questions": [
    {
      "id": 1,
      "question": "Standard question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Clear explanation of the answer."
    }
  ]
}`;

    let messages = [
      { role: 'system', content: isQuizReq ? quizSystemPrompt : baseSystemPrompt }
    ];

    if (Array.isArray(messagesHistory) && messagesHistory.length > 0) {
      const recent = messagesHistory.slice(-4);
      for (const m of recent) {
        if (m.text && typeof m.text === 'string' && !m.image) {
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
          { type: 'text', text: question ? `${question}\n(फोटो को देखकर पूरा समाधान हिंदी में समझाएँ)` : 'कृपया इस फोटो का विस्तृत विश्लेषण और समाधान करें।' }
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
