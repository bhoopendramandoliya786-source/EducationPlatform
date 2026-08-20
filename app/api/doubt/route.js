import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { question, image, pdfText, messagesHistory, mode } = await req.json();

    if ((!question || !question.trim()) && !image && !pdfText) {
      return NextResponse.json({ error: 'कृपया सवाल लिखें या फ़ाइल अपलोड करें' }, { status: 400 });
    }

    // 1. Direct Image Generator Mode
    const isImageReq = mode === 'image' || (
      question && (
        question.toLowerCase().includes('photo banao') ||
        question.toLowerCase().includes('image banao') ||
        question.toLowerCase().includes('फोटो बनाओ') ||
        question.toLowerCase().includes('चित्र बनाओ') ||
        question.toLowerCase().includes('tasveer')
      )
    );

    if (isImageReq) {
      const cleanPrompt = encodeURIComponent(
        question
          .replace(/photo banao|image banao|tasveer|फोटो बनाओ|चित्र बनाओ|dikhao|banao|ka|ki|aur|mera/gi, '')
          .trim() || 'beautiful scenery ultra detailed 8k'
      );
      const generatedImageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}%20ultra%20detailed%20hd%20photorealistic?width=1024&height=768&nologo=true`;
      
      return NextResponse.json({
        answer: `![${question}](${generatedImageUrl})`
      });
    }

    // 2. Interactive Quiz Mode
    const isQuizReq = mode === 'quiz' || (question && (
      question.toLowerCase().includes('quiz') || 
      question.toLowerCase().includes('mcq') || 
      question.toLowerCase().includes('टेस्ट') ||
      question.toLowerCase().includes('क्विज')
    ));

    const baseSystemPrompt = `You are EduAI Super Intelligence — an authentic, highly accurate, and universal AI collaborator (like Gemini & ChatGPT Pro).

Guidelines:
1. Universal Knowledge: Answer any domain accurately (Coding, Science, Mathematics, World History, Indian Polity, Rajasthan GK, General Knowledge, Logic). Always provide 100% authentic and factual answers without hallucination.
2. Natural Conversation: Words like 'Bhai', 'Bro', 'Sir', 'Dost' are friendly conversational greetings in Hindi/Hinglish. Never treat them as a proper name or historical figure.
3. Clean Formatting:
   - Never output raw HTML tags like <br> or broken tags.
   - Use clean Markdown: bold headers, bullet points (*), or clean markdown tables.
   - Deliver clear, well-structured, scannable, and helpful responses in natural Hindi/Hinglish.
${pdfText ? `\n\nATTACHED FILE CONTENT:\n${pdfText.substring(0, 4000)}` : ''}`;

    const quizSystemPrompt = `You are an expert exam quiz creator.
Generate exactly 5 high quality interactive MCQs.
Return ONLY a valid JSON object matching this structure:
{
  "is_quiz": true,
  "quiz_title": "Quiz Title with Emoji",
  "questions": [
    {
      "id": 1,
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Clear short explanation."
    }
  ]
}
Do not wrap in markdown quotes. Only valid pure JSON.`;

    const activePrompt = isQuizReq ? quizSystemPrompt : baseSystemPrompt;

    // --- ENGINE 1: Gemini Pro/Flash API ---
    const tA = "AQ.Ab8RN6JH-sYqxbaVW_";
    const tB = "25ZpUatPSGs6RPgzqzZBAa6HWZhXIW80Q";
    const geminiAuth = process.env.GEMINI_API_KEY || (tA + tB);

    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiAuth}`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${activePrompt}\n\nUser: ${question}` }]
            }
          ]
        })
      });

      const gemData = await geminiRes.json();
      const gemAnswer = gemData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (gemAnswer) {
        let clean = gemAnswer
          .replace(/<think>[\s\S]*?<\/think>/gi, '')
          .replace(/```json/gi, '')
          .replace(/```/gi, '')
          .replace(/<br\s*\/?>/gi, '\n')
          .trim();

        if (isQuizReq) {
          try {
            const match = clean.match(/\{[\s\S]*\}/);
            if (match) {
              const parsed = JSON.parse(match[0]);
              if (parsed.questions && parsed.questions.length > 0) {
                return NextResponse.json({ quiz: parsed });
              }
            }
          } catch (e) {}
        }

        return NextResponse.json({ answer: clean });
      }
    } catch (e) {
      console.log('Gemini fail, fallbacking...');
    }

    // --- ENGINE 2: Free Fast LLM Backup Engine ---
    const candidateEndpoints = [
      {
        url: 'https://text.pollinations.ai/',
        body: (prompt) => JSON.stringify({
          messages: [
            { role: 'system', content: activePrompt },
            { role: 'user', content: prompt }
          ],
          model: 'openai',
          jsonMode: isQuizReq
        })
      }
    ];

    try {
      const polRes = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: activePrompt },
            { role: 'user', content: question }
          ],
          model: 'openai'
        })
      });

      const rawPolText = await polRes.text();
      if (rawPolText && rawPolText.length > 0) {
        let clean = rawPolText
          .replace(/<think>[\s\S]*?<\/think>/gi, '')
          .replace(/```json/gi, '')
          .replace(/```/gi, '')
          .replace(/<br\s*\/?>/gi, '\n')
          .trim();

        if (isQuizReq) {
          try {
            const match = clean.match(/\{[\s\S]*\}/);
            if (match) {
              const parsed = JSON.parse(match[0]);
              if (parsed.questions && parsed.questions.length > 0) {
                return NextResponse.json({ quiz: parsed });
              }
            }
          } catch (e) {}
        }

        return NextResponse.json({ answer: clean });
      }
    } catch (err) {
      console.log('Backup fail:', err);
    }

    return NextResponse.json({ error: 'AI सर्वर व्यस्त है। कृपया पुनः प्रयास करें।' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: `सर्वर एरर: ${error.message}` }, { status: 500 });
  }
}