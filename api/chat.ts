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

interface OllamaResponse {
  message?: {
    content?: string;
  };
  error?: string;
}

interface OpenAICompatibleResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

interface ProviderResult {
  ok: boolean;
  reply?: string;
  error?: string;
}

const require = createRequire(import.meta.url);
const resumeData = require('../docs/resume/resume.json') as Record<string, unknown>;

const MAX_MESSAGES = 12;
const MAX_CONTENT_LENGTH = 1000;
const OLLAMA_TIMEOUT_MS = 8000;
const GEMINI_FALLBACK_MODELS = ['gemini-2.5-flash-lite', 'gemini-3.8-flash'];

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

function extractErrorDetail(rawError: string): string {
  try {
    const parsed = JSON.parse(rawError) as {
      error?: string | { message?: string };
    };
    if (typeof parsed?.error === 'string') {
      return parsed.error;
    }
    return parsed?.error?.message ?? '';
  } catch {
    return rawError.slice(0, 200);
  }
}

function stripThinkBlocks(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

async function tryOllama(
  baseUrl: string,
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<ProviderResult> {
  const endpoint = `${baseUrl.replace(/\/$/, '')}/api/chat`;
  const model = process.env.OLLAMA_MODEL?.trim() || 'qwen3:1.7b';

  let upstream: globalThis.Response;
  try {
    upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(OLLAMA_TIMEOUT_MS),
      body: JSON.stringify({
        model,
        stream: false,
        think: false,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
    });
  } catch (err) {
    console.error('Ollama fetch failed:', err);
    return { ok: false, error: 'Unable to reach Ollama right now.' };
  }

  if (!upstream.ok) {
    const rawError = await upstream.text().catch(() => '');
    const detail = extractErrorDetail(rawError);
    console.error('Ollama upstream error:', upstream.status, detail || rawError.slice(0, 300));
    return {
      ok: false,
      error: detail
        ? `Ollama returned an error (${upstream.status}): ${detail}`
        : `Ollama returned an error (${upstream.status}).`,
    };
  }

  let data: OllamaResponse;
  try {
    data = (await upstream.json()) as OllamaResponse;
  } catch {
    return { ok: false, error: 'Received an invalid response from Ollama.' };
  }

  const reply = stripThinkBlocks(data.message?.content ?? '');
  if (!reply) {
    return { ok: false, error: 'Ollama returned an empty response.' };
  }

  return { ok: true, reply };
}

async function tryOpenAICompatible(
  providerName: string,
  endpoint: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<ProviderResult> {
  let upstream: globalThis.Response;
  try {
    upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 512,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
    });
  } catch (err) {
    console.error(`${providerName} fetch failed:`, err);
    return { ok: false, error: `Unable to reach ${providerName} right now.` };
  }

  if (!upstream.ok) {
    const rawError = await upstream.text().catch(() => '');
    const detail = extractErrorDetail(rawError);
    console.error(
      `${providerName} upstream error:`,
      upstream.status,
      detail || rawError.slice(0, 300),
    );
    return {
      ok: false,
      error: detail
        ? `${providerName} returned an error (${upstream.status}): ${detail}`
        : `${providerName} returned an error (${upstream.status}).`,
    };
  }

  let data: OpenAICompatibleResponse;
  try {
    data = (await upstream.json()) as OpenAICompatibleResponse;
  } catch {
    return { ok: false, error: `Received an invalid response from ${providerName}.` };
  }

  const reply = (data.choices?.[0]?.message?.content ?? '').trim();
  if (!reply) {
    return { ok: false, error: `${providerName} returned an empty response.` };
  }

  return { ok: true, reply };
}

async function tryGemini(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<ProviderResult> {
  const configuredModel = process.env.GEMINI_MODEL?.trim();
  const models = configuredModel ? [configuredModel] : GEMINI_FALLBACK_MODELS;
  // Google AI Studio now issues "AQ." authorization keys as well as "AIza" keys;
  // both work on generativelanguage.googleapis.com via the x-goog-api-key header.
  const useVertex = process.env.GEMINI_PROVIDER === 'vertex';

  const payload = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
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

  let lastError = 'Unable to reach the assistant service right now.';

  for (let i = 0; i < models.length; i += 1) {
    const model = models[i];
    const endpoint = useVertex
      ? `https://aiplatform.googleapis.com/v1/publishers/google/models/${encodeURIComponent(
          model,
        )}:generateContent`
      : `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          model,
        )}:generateContent`;

    let upstream: globalThis.Response;
    try {
      upstream = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error(`Gemini fetch failed (${model}):`, err);
      lastError = 'Unable to reach the assistant service right now.';
      continue;
    }

    if (!upstream.ok) {
      const rawError = await upstream.text().catch(() => '');
      const detail = extractErrorDetail(rawError);
      console.error(
        `Gemini upstream error (${model}):`,
        upstream.status,
        detail || rawError.slice(0, 300),
      );
      lastError = detail
        ? `The assistant service returned an error (${upstream.status}): ${detail}`
        : `The assistant service returned an error (${upstream.status}).`;

      if ((upstream.status === 404 || upstream.status === 503) && i < models.length - 1) {
        continue;
      }
      return { ok: false, error: lastError };
    }

    let data: GeminiResponse;
    try {
      data = (await upstream.json()) as GeminiResponse;
    } catch {
      return { ok: false, error: 'Received an invalid response from the assistant service.' };
    }

    const parts = data.candidates?.[0]?.content?.parts;
    const reply = Array.isArray(parts)
      ? parts
          .map((part) => (typeof part.text === 'string' ? part.text : ''))
          .join('')
          .trim()
      : '';

    if (!reply) {
      return { ok: false, error: 'The assistant returned an empty response.' };
    }

    return { ok: true, reply };
  }

  return { ok: false, error: lastError };
}

export async function POST(request: Request): Promise<Response> {
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  if (!ollamaBaseUrl && !openaiKey && !groqKey && !geminiKey) {
    return Response.json(
      {
        error:
          'Chat is not configured yet (missing OLLAMA_BASE_URL, OPENAI_API_KEY, GROQ_API_KEY, or GEMINI_API_KEY).',
      },
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

  const systemPrompt = buildSystemInstruction(resumeData);
  let lastError = 'The assistant service is unavailable.';

  if (ollamaBaseUrl) {
    const result = await tryOllama(ollamaBaseUrl, systemPrompt, messages);
    if (result.ok && result.reply) {
      return Response.json({ reply: result.reply });
    }
    lastError = result.error ?? lastError;
  }

  if (openaiKey) {
    const result = await tryOpenAICompatible(
      'OpenAI',
      'https://api.openai.com/v1/chat/completions',
      openaiKey,
      process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini',
      systemPrompt,
      messages,
    );
    if (result.ok && result.reply) {
      return Response.json({ reply: result.reply });
    }
    lastError = result.error ?? lastError;
  }

  if (groqKey) {
    const result = await tryOpenAICompatible(
      'Groq',
      'https://api.groq.com/openai/v1/chat/completions',
      groqKey,
      process.env.GROQ_MODEL?.trim() || 'llama-3.1-8b-instant',
      systemPrompt,
      messages,
    );
    if (result.ok && result.reply) {
      return Response.json({ reply: result.reply });
    }
    lastError = result.error ?? lastError;
  }

  if (geminiKey) {
    const result = await tryGemini(geminiKey, systemPrompt, messages);
    if (result.ok && result.reply) {
      return Response.json({ reply: result.reply });
    }
    lastError = result.error ?? lastError;
  }

  return Response.json({ error: lastError }, { status: 502 });
}
