/** Shared UI/renderer boundary. No React or rendering dependency. */
export type SurfaceStatus = 'ready' | 'lost' | 'unavailable';

export interface SurfaceChange {
  status: SurfaceStatus;
  paused: boolean;
}

export interface SurfaceOptions {
  paused: boolean;
  /** Bounded user strength: 0.35 (gentle), 0.7 (medium), 1 (strong). */
  strength: number;
  /** Whether the renderer enables its supported autonomous background motion. */
  ambient: boolean;
  /** Emit after initialization and on status/pause changes; never every frame. */
  onChange: (change: SurfaceChange) => void;
}

export interface SurfaceController {
  setPaused(paused: boolean): void;
  setStrength(strength: number): void;
  /** Remove active disturbances without reseeding or changing pause/strength. */
  clear(): void;
  /** Coordinates in [0,1], top-left origin, relative to the displayed canvas. */
  disturb(normalizedX: number, normalizedY: number, strength?: number): void;
  /** Optional pointer hover in [0,1] normalized canvas coordinates. */
  hover?(normalizedX: number, normalizedY: number): void;
  /** Optional pointer leave notification. */
  leave?(): void;
  /** Idempotent: release RAF, listeners, observer and renderer resources. */
  dispose(): void;
}

/** Synchronous ownership; may throw on init failure. UI catches and offers retry.
 * Renderer emits ready/lost/unavailable through onChange, including paused state.
 * Renderer owns resize/context lifecycle; UI owns pointer/keyboard/preferences.
 * No global pointer/key handlers; disturb while paused must not queue events.
 */
export type SurfaceFactory = (
  canvas: HTMLCanvasElement,
  options: SurfaceOptions,
) => SurfaceController;
