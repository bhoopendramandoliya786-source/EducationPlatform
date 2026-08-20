import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Free DuckDuckGo Instant Web Search for Live Knowledge
async function searchWeb(query) {
  try {
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(searchUrl, { headers: { 'User-Agent': 'EduAI-Bot/2.0' } });
    const data = await res.json();
    let snippet = data.AbstractText || '';
    if (!snippet && data.RelatedTopics && data.RelatedTopics.length > 0) {
      snippet = data.RelatedTopics.slice(0, 3).map(t => t.Text).filter(Boolean).join(' \n');
    }
    return snippet ? `[लाइव वेब संदर्भ]: ${snippet}` : '';
  } catch (e) {
    return '';
  }
}

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

    // Live Web Search check for news/facts/current topics
    let webContext = '';
    const needsSearch = question && (
      question.toLowerCase().includes('current') ||
      question.toLowerCase().includes('latest') ||
      question.toLowerCase().includes('news') ||
      question.toLowerCase().includes('आज') ||
      question.toLowerCase().includes('हाल ही')
    );

    if (needsSearch) {
      webContext = await searchWeb(question);
    }

    const baseSystemPrompt = `You are EduAI Super Intelligence (powered by modern reasoning architecture, equivalent to ChatGPT and Google Gemini).

CAPABILITIES & DIRECTIVES:
1. Deep Reasoning: Understand the core intent of the student. Break down complex math, science, history, coding, and competitive exams into clear, logical steps.
2. Natural Tone: Talk warmly and naturally in Hindi / Hinglish. Use emojis (🎯, 💡, 🚀, ✨) where helpful.
3. Clean Formatting: Structure responses with Bold headings, bullet points, and highlight formulas or key facts.
4. Universal Scope: Answer ANY subject across the globe without bias or pre-set restrictions.
${webContext ? `\nReal-time Web Context:\n${webContext}` : ''}`;

    const quizSystemPrompt = `You are an expert exam quiz architect. Output ONLY valid JSON:
{
  "is_quiz": true,
  "quiz_title": "Interactive Quiz Title with Emoji",
  "questions": [
    {
      "id": 1,
      "question": "Clear and standard question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Detailed explanation with authentic facts."
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
          { type: 'text', text: question ? `${question}\n(Analyze this photo and provide full detailed solution)` : 'Analyze and explain this image in detail.' }
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
              console.log('Quiz JSON parse fallback');
            }
          }

          return NextResponse.json({ 
            answer: cleanAnswer,
            hasWebContext: Boolean(webContext)
          });
        }
      } catch (err) {
        console.log(`Failed on ${modelName}, retrying...`);
      }
    }

    return NextResponse.json({ error: 'AI सर्वर व्यस्त है। कृपया पुनः प्रयास करें।' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: `सर्वर एरर: ${error.message}` }, { status: 500 });
  }
}
