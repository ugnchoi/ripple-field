import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { resume } from '../data/resume';
import { introSession } from './introPolicy';
import { SurfaceCanvas } from './SurfaceCanvas';
import type { SurfaceController, SurfaceFactory, SurfaceStatus } from './types';
import { useMotionPreference, useSurfacePause } from './useMotionPreference';
import yoojinAvatar from './yoojin-avatar.jpg';

export interface OpeningProps {
  createSurface: SurfaceFactory;
  /** Integration places this anchor before the unchanged Resume. */
  resumeHref?: string;
  playgroundHref?: string;
  onReadResume?: () => void;
  onOpenChat?: () => void;
  chatOpen?: boolean;
  onHeroChatVisibilityChange?: (visible: boolean) => void;
}

export function Opening({
  createSurface,
  resumeHref = '#resume',
  playgroundHref = '/water/',
  onReadResume,
  onOpenChat,
  chatOpen = false,
  onHeroChatVisibilityChange,
}: OpeningProps) {
  const reducedMotion = useMotionPreference();
  const hintId = useId();
  const [paused, setPaused] = useSurfacePause(reducedMotion);
  const [intro, setIntro] = useState(false);
  const [status, setStatus] = useState<SurfaceStatus | null>(null);
  const controller = useRef<SurfaceController | null>(null);
  const heroChatRef = useRef<HTMLDivElement>(null);
  const visit = useRef<boolean | null>(null);
  const emitted = useRef(false);
  const finishCue = useCallback(() => {
    setIntro(false);
    controller.current?.clear();
  }, []);

  useEffect(() => {
    if (visit.current === null) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      visit.current = introSession.claim({ reducedMotion,
        hasFragment: Boolean(window.location.hash), returning: navigation?.type === 'back_forward' });
    }
    setIntro(visit.current);
  // The initial visit is claimed once; changing the preference must never replay it.
  }, []);

  useEffect(() => {
    if (!intro) return;
    const timer = window.setTimeout(() => setIntro(false), 1850);
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') finishCue(); };
    const hidden = () => { if (document.hidden) finishCue(); };
    window.addEventListener('keydown', escape);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', escape);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, [intro, finishCue]);

  useEffect(() => {
    if (reducedMotion) finishCue();
  }, [reducedMotion, finishCue]);

  useEffect(() => {
    if (intro && !paused && status === 'ready' && !emitted.current) {
      emitted.current = true;
      controller.current?.disturb(0.55, 0.48, 0.7);
    }
  }, [intro, paused, status]);

  useEffect(() => {
    const el = heroChatRef.current;
    if (!el || !onHeroChatVisibilityChange || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        onHeroChatVisibilityChange(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      onHeroChatVisibilityChange(false);
    };
  }, [onHeroChatVisibilityChange]);

  return <section className="water-opening" aria-label="Portfolio opening">
    <SurfaceCanvas createSurface={createSurface} paused={paused} strength={0.7}
      ambient={true} allowPageScroll describedBy={hintId}
      onInteract={() => setIntro(false)}
      onController={next => { controller.current = next; }}
      onChange={next => { setStatus(next.status); setPaused(next.paused); }} />
    <header className="water-opening__header">
      <p className="water-opening__name">{resume.basics.name}</p>
      {intro ? <button className="water-button" type="button" onClick={finishCue}>Skip animation</button>
        : <button className="water-button" type="button" disabled={status !== 'ready'} onClick={() => setPaused(value => !value)}>
          {paused ? 'Play surface motion' : 'Pause'}
        </button>}
    </header>
    <div className="water-opening__main">
      <div className="water-opening__copy">
        <h1>{resume.basics.tagline}</h1>
        <p>{resume.basics.title}</p>
      </div>
      {onOpenChat && (
        <div ref={heroChatRef} className="water-opening__chat">
          <button
            type="button"
            className="chat-fab chat-fab--hero"
            aria-expanded={chatOpen}
            aria-controls="yoojin-chat-panel"
            onClick={onOpenChat}
          >
            <img
              src={yoojinAvatar}
              alt=""
              width={52}
              height={52}
              className="chat-fab__avatar"
            />
            <span className="chat-fab__label">Ask about Yoojin</span>
          </button>
        </div>
      )}
    </div>
    <p id={hintId} className="water-opening__hint">{paused ? 'Surface motion is paused.' : 'Tap the surface to make a ripple, or focus it and press Enter.'}</p>
    <nav className="water-opening__navigation" aria-label="Explore the portfolio">
      <a
        href={resumeHref}
        className="water-link"
        onClick={event => {
          finishCue();
          if (onReadResume) {
            event.preventDefault();
            onReadResume();
          }
        }}
      >
        Read resume
      </a>
      <a href={playgroundHref} className="water-link">Explore the water</a>
    </nav>
  </section>;
}
