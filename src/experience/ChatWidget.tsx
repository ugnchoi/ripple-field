import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { resume } from '@/data/resume';
import yoojinAvatar from './yoojin-avatar.jpg';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_PROMPTS = [
  'What does Yoojin lead at BCG?',
  'Tell me about his AI & prototyping work',
  'Is he open to relocating to Montreal?',
] as const;

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fabRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contactEmail = resume.basics.email ?? 'ugn.choi@gmail.com';
  const hasUserMessage = messages.some((message) => message.role === 'user');

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

  return (
    <>
      {open && (
        <div
          id="yoojin-chat-panel"
          className="chat-panel no-print"
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
            <button
              type="button"
              className="chat-panel__close"
              onClick={closePanel}
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          <div className="chat-panel__body">
            <div className="chat-panel__messages" aria-live="polite">
              <div className="chat-msg chat-msg--assistant">
                <p>
                  Hi! I can answer questions about Yoojin&apos;s design leadership at
                  BCG, AI prototyping work, background, and availability.
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
                  <p>{message.content}</p>
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
              placeholder="Ask about experience, AI work, relocation…"
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

      <button
        ref={fabRef}
        type="button"
        className="chat-fab no-print"
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
    </>
  );
}
