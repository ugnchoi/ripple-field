import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { resume } from '../data/resume';
import { HeroPretextHeadline } from './HeroPretextHeadline';
import { introSession } from './introPolicy';
import { SurfaceCanvas } from './SurfaceCanvas';
import type { SurfaceController, SurfaceFactory, SurfaceStatus } from './types';
import { useMotionPreference, useSurfacePause } from './useMotionPreference';

export interface OpeningProps {
  createSurface: SurfaceFactory;
  /** Integration places this anchor before the unchanged Resume. */
  resumeHref?: string;
  playgroundHref?: string;
  onReadResume?: () => void;
  heroChatAnchorRef?: RefObject<HTMLDivElement | null>;
  children?: ReactNode;
}

export function Opening({
  createSurface,
  heroChatAnchorRef,
  children,
}: OpeningProps) {
  const reducedMotion = useMotionPreference();
  const [paused, setPaused] = useSurfacePause(reducedMotion);
  const [intro, setIntro] = useState(false);
  const [status, setStatus] = useState<SurfaceStatus | null>(null);
  const controller = useRef<SurfaceController | null>(null);
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

  return <section className="water-opening" aria-label="Portfolio opening">
    <SurfaceCanvas createSurface={createSurface} paused={paused} strength={0.7}
      ambient={true} allowPageScroll
      onInteract={() => setIntro(false)}
      onController={next => { controller.current = next; }}
      onChange={next => { setStatus(next.status); setPaused(next.paused); }} />
    <div className="water-opening__viewport">
      <div className="water-opening__main">
        <div className="water-opening__copy">
          <HeroPretextHeadline text={resume.basics.tagline} />
          <p>{resume.basics.title}</p>
          <p className="water-opening__specialties">{resume.basics.specialties.join(' · ')}</p>
        </div>
        <div ref={heroChatAnchorRef} className="water-opening__chat" aria-hidden="true" />
      </div>
    </div>
    {children}
  </section>;
}
