import { useEffect, useState, useSyncExternalStore } from 'react';

const query = '(prefers-reduced-motion: reduce)';
const subscribe = (notify: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};
const snapshot = () => window.matchMedia(query).matches;
export const useMotionPreference = () => useSyncExternalStore(subscribe, snapshot, () => true);

/** Never resumes automatically on preference or tab-visibility changes. */
export function useSurfacePause(reducedMotion: boolean) {
  const [paused, setPaused] = useState(() => reducedMotion || (typeof document !== 'undefined' && document.hidden));
  useEffect(() => { if (reducedMotion) setPaused(true); }, [reducedMotion]);
  useEffect(() => {
    const hidden = () => { if (document.hidden) setPaused(true); };
    document.addEventListener('visibilitychange', hidden);
    return () => document.removeEventListener('visibilitychange', hidden);
  }, []);
  return [paused, setPaused] as const;
}
