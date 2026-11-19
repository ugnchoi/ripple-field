import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent, type RefObject } from 'react';
import { resume } from '@/data/resume';
import yoojinAvatar from './yoojin-avatar.jpg';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_PROMPTS = [
  'What kind of work does Yoojin do?',
  "Tell me about Yoojin's design approach",
  'How does Yoojin think about AI and design?',
] as const;

interface ChatWidgetProps {
  heroAnchorRef?: RefObject<HTMLDivElement | null>;
  dockedOnly?: boolean;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function renderInlineBold(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={`${keyPrefix}-${idx}`}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderFormattedMessage(content: string) {
  const blocks = content.split(/\n{2,}/);
  return blocks.map((block, bIdx) => {
    const lines = block.split('\n').filter((line) => line.trim().length > 0);
    if (lines.length > 0 && lines.every((line) => /^\s*[-*•]\s+/.test(line))) {
      return (
        <ul key={`b-${bIdx}`} className="chat-msg__list">
          {lines.map((line, lIdx) => (
            <li key={`b-${bIdx}-l-${lIdx}`}>
              {renderInlineBold(line.replace(/^\s*[-*•]\s+/, ''), `b-${bIdx}-l-${lIdx}`)}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p key={`b-${bIdx}`}>
        {lines.map((line, lIdx) => (
          <span key={`b-${bIdx}-p-${lIdx}`}>
            {lIdx > 0 ? <br /> : null}
            {renderInlineBold(line, `b-${bIdx}-p-${lIdx}`)}
          </span>
        ))}
      </p>
    );
  });
}

export function ChatWidget({ heroAnchorRef, dockedOnly = false }: ChatWidgetProps = {}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [heroInput, setHeroInput] = useState('');
  const [heroFocused, setHeroFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(dockedOnly ? 1 : 0);
  const [dockOffset, setDockOffset] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dockRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contactEmail = resume.basics.email ?? 'ugn.choi@gmail.com';
  const hasUserMessage = messages.some((message) => message.role === 'user');
  const isDocked = dockedOnly || open || scrollProgress >= 0.72;

  useEffect(() => {
    if (heroFocused || heroInput.trim() || isDocked) return;
    const timer = window.setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % STARTER_PROMPTS.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [heroFocused, heroInput, isDocked]);

  useLayoutEffect(() => {
    if (dockedOnly) {
      setScrollProgress(1);
      setDockOffset({ dx: 0, dy: 0 });
      return;
    }

    let rafId = 0;
    const updatePosition = () => {
      rafId = 0;
      const anchor = heroAnchorRef?.current;
      const dock = dockRef.current;
      if (!anchor || !dock || open) {
        setScrollProgress(1);
        setDockOffset({ dx: 0, dy: 0 });
        return;
      }

      const range = Math.max(window.innerHeight * 0.42, 220);
      const t = clamp01(window.scrollY / range);
      setScrollProgress(t);

      if (t >= 1) {
        setDockOffset({ dx: 0, dy: 0 });
        return;
      }

      const anchorRect = anchor.getBoundingClientRect();
      const dockRect = dock.getBoundingClientRect();
      const margin = 20;
      const targetCenterX = window.innerWidth - margin - dockRect.width / 2;
      const targetCenterY = window.innerHeight - margin - dockRect.height / 2;
      const anchorCenterX = anchorRect.left + anchorRect.width / 2;
      const anchorCenterY = anchorRect.top + anchorRect.height / 2;

      setDockOffset({
        dx: (anchorCenterX - targetCenterX) * (1 - t),
        dy: (anchorCenterY - targetCenterY) * (1 - t),
      });
    };

    const scheduleUpdate = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updatePosition);
      }
    };

    updatePosition();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [heroAnchorRef, dockedOnly, open, isDocked]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [open, messages, loading, error]);

  const closePanel = () => {
    setOpen(false);
    requestAnimationFrame(() => {
      fabRef.current?.focus();
    });
  };

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closePanel();
    }
  };

  const sendMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role: 'user',
      content: trimmed,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        reply?: unknown;
        error?: unknown;
      } | null;

      if (!response.ok) {
        const message =
          data && typeof data.error === 'string'
            ? data.error
            : 'Chat service is currently unavailable.';
        throw new Error(message);
      }

      const reply =
        data && typeof data.reply === 'string' ? data.reply.trim() : '';
      if (!reply) {
        throw new Error('Received an empty reply from the assistant.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          role: 'assistant',
          content: reply,
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'Unable to reach the assistant right now.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleHeroSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = heroInput.trim();
    if (!trimmed) return;
    setHeroInput('');
    setOpen(true);
    void sendMessage(trimmed);
  };

  return (
    <>
      {open && (
        <div
          id="yoojin-chat-panel"
          className={`chat-panel no-print${expanded ? ' chat-panel--expanded' : ''}`}
          role="dialog"
          aria-label="Ask about Yoojin"
          onKeyDown={handlePanelKeyDown}
        >
          <header className="chat-panel__header">
            <div className="chat-panel__identity">
              <img
                src={yoojinAvatar}
                alt=""
                width={36}
                height={36}
                className="chat-panel__avatar"
              />
              <div>
                <h2 className="chat-panel__title">Ask about Yoojin</h2>
                <p className="chat-panel__subtitle">Portfolio &amp; resume assistant</p>
              </div>
            </div>
            <div className="chat-panel__actions">
              <button
                type="button"
                className="chat-panel__expand"
                onClick={() => setExpanded((prev) => !prev)}
                aria-label={expanded ? 'Shrink chat' : 'Expand chat to side sheet'}
                aria-pressed={expanded}
                title={expanded ? 'Shrink' : 'Expand'}
              >
                {expanded ? (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="4 14 10 14 10 20" />
                    <polyline points="20 10 14 10 14 4" />
                    <line x1="14" y1="10" x2="21" y2="3" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                ) : (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                className="chat-panel__close"
                onClick={closePanel}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
          </header>

          <div className="chat-panel__body">
            <div className="chat-panel__messages" aria-live="polite">
              <div className="chat-msg chat-msg--assistant">
                <p>
                  Hi! I can answer questions about Yoojin&apos;s work, design
                  approach, background, and writing on AI &amp; product craft.
                </p>
              </div>

              {!hasUserMessage && (
                <div className="chat-panel__starters" aria-label="Suggested questions">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="chat-starter"
                      onClick={() => void sendMessage(prompt)}
                      disabled={loading}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-msg chat-msg--${message.role}`}
                >
                  {renderFormattedMessage(message.content)}
                </div>
              ))}

              {loading && (
                <div
                  className="chat-msg chat-msg--assistant chat-msg--loading"
                  aria-label="Assistant is typing"
                >
                  <span className="chat-dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              )}

              {error && (
                <div className="chat-panel__error" role="status">
                  <p>{error}</p>
                  <p>
                    You can reach Yoojin directly at{' '}
                    <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
                  </p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <form className="chat-panel__form" onSubmit={handleSubmit}>
            <label htmlFor="yoojin-chat-input" className="chat-sr-only">
              Ask a question about Yoojin
            </label>
            <input
              ref={inputRef}
              id="yoojin-chat-input"
              type="text"
              className="chat-panel__input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about Yoojin’s work, approach, or thinking…"
              maxLength={1000}
              disabled={loading}
            />
            <button
              type="submit"
              className="chat-panel__send"
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}

      <div
        ref={dockRef}
        className={`chat-dock no-print${isDocked ? ' chat-dock--docked' : ' chat-dock--hero'}`}
        style={
          isDocked
            ? undefined
            : { transform: `translate3d(${dockOffset.dx}px, ${dockOffset.dy}px, 0)` }
        }
      >
        {isDocked ? (
          <button
            ref={fabRef}
            type="button"
            className="chat-fab"
            aria-expanded={open}
            aria-controls="yoojin-chat-panel"
            onClick={() => setOpen((prev) => !prev)}
          >
            <img
              src={yoojinAvatar}
              alt=""
              width={36}
              height={36}
              className="chat-fab__avatar"
            />
            <span className="chat-fab__label">Ask about Yoojin</span>
          </button>
        ) : (
          <div className="chat-hero-pill">
            <img
              src={yoojinAvatar}
              alt="Yoojin Choi"
              width={52}
              height={52}
              className="chat-hero-pill__avatar"
            />
            <div className="chat-hero-pill__content">
              <span className="chat-hero-pill__title">Ask about Yoojin</span>
              <form className="chat-hero-pill__form" onSubmit={handleHeroSubmit}>
                <label htmlFor="yoojin-hero-chat-input" className="chat-sr-only">
                  Ask a question about Yoojin
                </label>
                <input
                  id="yoojin-hero-chat-input"
                  type="text"
                  className="chat-hero-pill__input"
                  value={heroInput}
                  onChange={(event) => setHeroInput(event.target.value)}
                  onFocus={() => setHeroFocused(true)}
                  onBlur={() => setHeroFocused(false)}
                  placeholder={STARTER_PROMPTS[placeholderIndex]}
                  maxLength={1000}
                  disabled={loading}
                />
                {heroInput.trim() && (
                  <button
                    type="submit"
                    className="chat-hero-pill__send"
                    aria-label="Ask question"
                    disabled={loading}
                  >
                    →
                  </button>
                )}
              </form>
            </div>
            <a
              href={`mailto:${contactEmail}`}
              className="chat-hero-pill__mail"
              aria-label={`Email Yoojin at ${contactEmail}`}
              title={`Email ${contactEmail}`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </>
  );
}
