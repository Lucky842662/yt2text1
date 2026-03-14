import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';

/**
 * Generate a summary + key points from transcript text
 */
export const generateSummary = async (transcript, title = '') => {
  const prompt = buildSummaryPrompt(transcript, title);

  if (AI_PROVIDER === 'gemini') {
    return generateWithGemini(prompt);
  } else if (AI_PROVIDER === 'openai') {
    return generateWithOpenAI(prompt);
  } else {
    throw new Error(`Unknown AI provider: ${AI_PROVIDER}`);
  }
};

/**
 * Build the prompt for summarization
 */
const buildSummaryPrompt = (transcript, title) => {
  return `You are an expert content summarizer. Analyze the following YouTube video transcript and provide:

1. A clear, concise summary (3-5 paragraphs) that captures the main ideas
2. 5-7 key bullet points highlighting the most important takeaways

Video Title: ${title || 'Unknown'}

Transcript:
${transcript.substring(0, 12000)} ${transcript.length > 12000 ? '... [transcript truncated]' : ''}

Format your response EXACTLY as JSON with this structure:
{
  "summary": "Your summary here as a single string with paragraph breaks using \\n\\n",
  "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"]
}

Only output valid JSON, no other text.`;
};

/**
 * Generate summary using Google Gemini
 */
const generateWithGemini = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return parseAIResponse(text);
};

/**
 * Generate summary using OpenAI GPT
 */
const generateWithOpenAI = async (prompt) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const baseURL = process.env.OPENAI_BASE_URL || undefined;
  const isOpenRouter = !!baseURL && baseURL.includes('openrouter.ai');
  const model =
    process.env.OPENAI_MODEL ||
    (isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini');

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL,
    defaultHeaders: isOpenRouter
      ? {
          ...(process.env.OPENROUTER_API_KEY
            ? { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` }
            : {}),
          ...(process.env.OPENROUTER_REFERER ? { 'HTTP-Referer': process.env.OPENROUTER_REFERER } : {}),
          ...(process.env.OPENROUTER_TITLE ? { 'X-Title': process.env.OPENROUTER_TITLE } : {}),
        }
      : undefined,
  });

  const request = {
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1500,
    temperature: 0.3,
  };

  // OpenRouter doesn't reliably support response_format=json_object
  if (!isOpenRouter) {
    request.response_format = { type: 'json_object' };
  }

  const completion = await openai.chat.completions.create(request);

  const text = completion.choices[0].message.content;
  return parseAIResponse(text);
};

/**
 * Parse and validate AI response JSON
 */
const parseAIResponse = (text) => {
  try {
    // Strip markdown code fences if present
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      summary: parsed.summary || 'Summary not available.',
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
    };
  } catch {
    // Fallback if JSON parsing fails
    return {
      summary: text.substring(0, 2000),
      keyPoints: [],
    };
  }
};
