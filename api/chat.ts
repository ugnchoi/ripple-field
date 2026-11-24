import { createRequire } from 'node:module';
import { CHAT_POLICY } from './chat-policy.mjs';

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
const linkedinData = require('../docs/resume/linkedin-posts.json') as {
  toneNotes?: string[];
  posts?: Array<{ title?: string; takeaway?: string }>;
};

const MAX_MESSAGES = 12;
const MAX_CONTENT_LENGTH = 1000;
const OLLAMA_TIMEOUT_MS = 45000;
const GEMINI_FALLBACK_MODELS = ['gemini-2.5-flash-lite', 'gemini-3.8-flash'];

function formatCompactResume(resume: Record<string, unknown>): string {
  const r = resume as {
    basics?: {
      name?: string;
      title?: string;
      specialties?: string[];
      tagline?: string;
      summary?: string;
      location?: { current?: string; openToWork?: string[] };
      email?: string;
      phone?: string;
      profiles?: Array<{ network?: string; url?: string }>;
    };
    pillars?: Array<{ title?: string; description?: string }>;
    work?: Array<{
      company?: string;
      position?: string;
      team?: string;
      location?: string;
      startDate?: string;
      endDate?: string | null;
      summary?: string;
      highlights?: string[];
      recognition?: string;
    }>;
    skills?: Array<{ category?: string; keywords?: string[] }>;
    education?: Array<{ institution?: string; degree?: string; area?: string; startDate?: string; endDate?: string }>;
    certifications?: Array<{ name?: string; issuer?: string; date?: string }>;
    awards?: Array<{ title?: string; result?: string; date?: string; category?: string }>;
    languages?: Array<{ language?: string; fluency?: string }>;
    volunteerAndOther?: Array<{ role?: string; organization?: string; startDate?: string; endDate?: string; summary?: string }>;
    recommendations?: Array<{ name?: string; title?: string; text?: string }>;
  };

  const lines: string[] = [];
  const b = r.basics;
  if (b) {
    lines.push(`${b.name ?? 'Yoojin Choi'} — ${b.title ?? ''}`);
    if (b.specialties?.length) lines.push(`Specialties: ${b.specialties.join(', ')}`);
    if (b.tagline) lines.push(`Tagline: ${b.tagline}`);
    if (b.summary) lines.push(`Summary: ${b.summary}`);
    if (b.location?.current) {
      lines.push(`Location: ${b.location.current}`);
    }
    const linkedin = b.profiles?.find((p) => p.url)?.url ?? '';
    lines.push(`Contact: ${b.email ?? ''} | ${b.phone ?? ''} | ${linkedin}`);
  }

  if (r.pillars?.length) {
    lines.push('', 'Approach:');
    for (const p of r.pillars) {
      lines.push(`- ${p.title}: ${p.description}`);
    }
  }

  if (r.work?.length) {
    lines.push('', 'Experience:');
    for (const w of r.work) {
      const period = `${w.startDate ?? ''}–${w.endDate ?? 'Present'}`;
      const team = w.team ? ` (${w.team})` : '';
      lines.push(`- ${w.position} at ${w.company}${team} [${period}, ${w.location ?? ''}]`);
      if (w.summary) lines.push(`  ${w.summary}`);
      if (w.highlights?.length) lines.push(`  Highlights: ${w.highlights.join(' ')}`);
      if (w.recognition) lines.push(`  Recognition: ${w.recognition}`);
    }
  }

  if (r.skills?.length) {
    lines.push('', 'Skills:');
    for (const s of r.skills) {
      lines.push(`- ${s.category}: ${(s.keywords ?? []).join(', ')}`);
    }
  }

  if (r.education?.length) {
    lines.push('', 'Education:');
    for (const e of r.education) {
      lines.push(`- ${e.institution}: ${e.degree} in ${e.area} (${e.startDate}–${e.endDate})`);
    }
  }

  if (r.awards?.length) {
    lines.push('', 'Awards:');
    for (const a of r.awards) {
      lines.push(`- ${a.title}: ${a.result} (${a.date}, ${a.category})`);
    }
  }

  if (r.certifications?.length) {
    lines.push(
      '',
      `Certifications (8 total IxDF): ${r.certifications.map((c) => `${c.name} (${c.date})`).join('; ')}`,
    );
  }

  if (r.languages?.length) {
    lines.push('', `Languages: ${r.languages.map((l) => `${l.language} (${l.fluency})`).join(', ')}`);
  }

  if (r.volunteerAndOther?.length) {
    lines.push('', 'Other:');
    for (const v of r.volunteerAndOther) {
      lines.push(`- ${v.role}, ${v.organization} (${v.startDate}–${v.endDate})${v.summary ? `: ${v.summary}` : ''}`);
    }
  }

  if (r.recommendations?.length) {
    lines.push('', 'Recommendation:');
    for (const rec of r.recommendations) {
      lines.push(`- ${rec.name} (${rec.title}): "${rec.text}"`);
    }
  }

  return lines.join('\n');
}

function buildSystemInstruction(
  resume: Record<string, unknown>,
  linkedin: { toneNotes?: string[]; posts?: Array<{ title?: string; takeaway?: string }> },
): string {
  const toneBlock = linkedin.toneNotes?.length
    ? ['Tone & Voice (inspired by Yoojin’s writing):', ...linkedin.toneNotes.map((t) => `- ${t}`)].join('\n')
    : '';

  const postsBlock = linkedin.posts?.length
    ? [
        'LinkedIn Writing & Perspectives:',
        ...linkedin.posts.map((p) => `- ${p.title}: ${p.takeaway}`),
      ].join('\n')
    : '';

  return [
    "You are Yoojin Choi's portfolio and resume assistant.",
    'Answer concisely, warmly, and clearly in a candid, grounded tone—never stiff or corporate-buzzwordy.',
    CHAT_POLICY,
    'Use ONLY facts and perspectives present in the resume and LinkedIn notes below.',
    'Never invent projects, companies, metrics, skills, or dates.',
    'If asked something not covered below, say so honestly and offer to reach Yoojin directly at ugn.choi@gmail.com or https://www.linkedin.com/in/ugnchoi.',
    '',
    toneBlock,
    '',
    formatCompactResume(resume),
    '',
    postsBlock,
  ]
    .filter(Boolean)
    .join('\n');
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
        keep_alive: '30m',
        options: {
          num_ctx: 4096,
          num_predict: 320,
        },
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

  const systemPrompt = buildSystemInstruction(resumeData, linkedinData);
  let lastError = 'The assistant service is unavailable.';

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

  if (geminiKey) {
    const result = await tryGemini(geminiKey, systemPrompt, messages);
    if (result.ok && result.reply) {
      return Response.json({ reply: result.reply });
    }
    lastError = result.error ?? lastError;
  }

  return Response.json({ error: lastError }, { status: 502 });
}
