export interface IntroVisit {
  reducedMotion: boolean;
  hasFragment: boolean;
  returning: boolean;
}
export interface IntroStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** Per-tab fallback still works when the browser denies storage. */
export function createIntroPolicy(storage: () => IntroStorage) {
  let claimed = false;
  return {
    claim(visit: IntroVisit): boolean {
      let seen = claimed;
      try { seen ||= storage().getItem('water-intro:v1') === 'seen'; } catch { /* storage is optional */ }
      claimed = true;
      try { storage().setItem('water-intro:v1', 'seen'); } catch { /* retain the in-memory claim */ }
      return !seen && !visit.reducedMotion && !visit.hasFragment && !visit.returning;
    },
  };
}

export const introSession = createIntroPolicy(() => window.sessionStorage);
