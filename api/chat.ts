import { createRequire } from 'node:module';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface GeminiPart {
  text?: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: {
    message?: string;
  };
}

const require = createRequire(import.meta.url);
const resumeData = require('../docs/resume/resume.json') as Record<string, unknown>;

const MAX_MESSAGES = 12;
const MAX_CONTENT_LENGTH = 1000;

function buildSystemInstruction(resume: Record<string, unknown>): string {
  return [
    "You are Yoojin Choi's portfolio and resume assistant.",
    'Answer concisely, warmly, and clearly in a helpful tone.',
    'Use ONLY facts present in the resume JSON below.',
    'Never invent projects, companies, metrics, skills, or dates.',
    'If asked something not covered by the resume JSON, say so honestly and offer to reach Yoojin directly at ugn.choi@gmail.com or https://www.linkedin.com/in/ugnchoi.',
    '',
    'Resume JSON:',
    JSON.stringify(resume),
  ].join('\n');
}

function validateMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0) {
    return null;
  }

  const normalized: ChatMessage[] = [];
  for (const item of raw.slice(-MAX_MESSAGES)) {
    if (!item || typeof item !== 'object') {
      return null;
    }
    const { role, content } = item as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') {
      return null;
    }
    const trimmed = content.trim().slice(0, MAX_CONTENT_LENGTH);
    if (!trimmed) {
      return null;
    }
    normalized.push({ role, content: trimmed });
  }

  if (normalized.length === 0 || normalized[normalized.length - 1].role !== 'user') {
    return null;
  }

  return normalized;
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      { error: 'Chat is not configured yet (missing GEMINI_API_KEY).' },
      { status: 503 },
    );
  }

  let body: { messages?: unknown };
  try {
    body = (await request.json()) as { messages?: unknown };
  } catch {
    return Response.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  const messages = validateMessages(body?.messages);
  if (!messages) {
    return Response.json(
      {
        error:
          'Request must include a non-empty messages array ending with a user message.',
      },
      { status: 400 },
    );
  }

  const model = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
  // Vertex AI Express Mode keys start with "AQ.", while Google AI Studio keys start with "AIza".
  const endpoint = apiKey.startsWith('AQ.')
    ? `https://aiplatform.googleapis.com/v1/publishers/google/models/${encodeURIComponent(
        model,
      )}:generateContent?key=${encodeURIComponent(apiKey)}`
    : `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model,
      )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const payload = {
    systemInstruction: {
      parts: [{ text: buildSystemInstruction(resumeData) }],
    },
    contents: messages.map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    })),
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 512,
    },
  };

  let upstream: globalThis.Response;
  try {
    upstream = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    return Response.json(
      { error: 'Unable to reach the assistant service right now.' },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    return Response.json(
      { error: 'The assistant service returned an error.' },
      { status: 502 },
    );
  }

  let data: GeminiResponse;
  try {
    data = (await upstream.json()) as GeminiResponse;
  } catch {
    return Response.json(
      { error: 'Received an invalid response from the assistant service.' },
      { status: 502 },
    );
  }

  const parts = data.candidates?.[0]?.content?.parts;
  const reply = Array.isArray(parts)
    ? parts
        .map((part) => (typeof part.text === 'string' ? part.text : ''))
        .join('')
        .trim()
    : '';

  if (!reply) {
    return Response.json(
      { error: 'The assistant returned an empty response.' },
      { status: 502 },
    );
  }

  return Response.json({ reply });
}
