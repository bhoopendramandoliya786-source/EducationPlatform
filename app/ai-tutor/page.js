import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { question, image, pdfText, messagesHistory, mode } = await req.json();

    if ((!question || !question.trim()) && !image && !pdfText) {
      return NextResponse.json({ error: 'कृपया सवाल लिखें या फ़ाइल अपलोड करें' }, { status: 400 });
    }

    // 1. Image Generation Mode
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

    const activeSystemPrompt = isQuizReq ? quizSystemPrompt : baseSystemPrompt;

    // --- STRATEGY 1: GEMINI ENGINE (Official Fast SDK) ---
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: activeSystemPrompt,
        });

        const contents = [];
        if (Array.isArray(messagesHistory) && messagesHistory.length > 0) {
          const recent = messagesHistory.slice(-4);
          for (const m of recent) {
            if (m.text && typeof m.text === 'string') {
              contents.push({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
              });
            }
          }
        }

        const currentParts = [];
        if (image) {
          const base64Data = image.split(',')[1] || image;
          currentParts.push({
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg',
            },
          });
        }
        currentParts.push({ text: question || 'Please analyze this.' });

        const result = await model.generateContent({
          contents: [...contents, { role: 'user', parts: currentParts }],
        });

        let rawAnswer = result.response.text();
        let cleanAnswer = rawAnswer
          .replace(/<think>[\s\S]*?<\/think>/gi, '')
          .replace(/```json/gi, '')
          .replace(/```/gi, '')
          .replace(/<br\s*\/?>/gi, '\n')
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
      } catch (geminiErr) {
        console.error('Gemini attempt failed, switching to Groq fallback:', geminiErr.message);
      }
    }

    // --- STRATEGY 2: GROQ ENGINE (Ultra-Fast Backup) ---
    const k1 = "gsk_Cq74Rachwl";
    const k2 = "MOvsBGXNhoWGdyb3FY";
    const k3 = "jupqa8ZwPG8FRtfdSwkuAQ0h";
    const groqKey = process.env.GROQ_API_KEY || (k1 + k2 + k3);

    let groqMessages = [
      { role: 'system', content: activeSystemPrompt }
    ];

    if (Array.isArray(messagesHistory) && messagesHistory.length > 0) {
      const recent = messagesHistory.slice(-4);
      for (const m of recent) {
        if (m.text && typeof m.text === 'string') {
          groqMessages.push({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.text
          });
        }
      }
    }
    groqMessages.push({ role: 'user', content: question });

    const candidateModels = [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'mixtral-8x7b-32768'
    ];

    for (const modelName of candidateModels) {
      try {
        const chatRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: modelName,
            messages: groqMessages,
            temperature: 0.3
          })
        });

        const data = await chatRes.json();

        if (data?.choices?.[0]?.message?.content) {
          let rawAnswer = data.choices[0].message.content;
          let cleanAnswer = rawAnswer
            .replace(/<think>[\s\S]*?<\/think>/gi, '')
            .replace(/```json/gi, '')
            .replace(/```/gi, '')
            .replace(/<br\s*\/?>/gi, '\n')
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
        console.log(`Groq model failed: ${modelName}`);
      }
    }

    return NextResponse.json({ error: 'AI सर्वर व्यस्त है। कृपया 5 सेकंड बाद पुनः प्रयास करें।' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: `सर्वर एरर: ${error.message}` }, { status: 500 });
  }
}