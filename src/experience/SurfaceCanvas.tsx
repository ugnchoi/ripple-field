import { useEffect, useRef, useState } from 'react';
import type { SurfaceChange, SurfaceController, SurfaceFactory } from './types';
import './experience.css';

interface SurfaceCanvasProps {
  createSurface: SurfaceFactory;
  paused: boolean;
  strength: number;
  ambient?: boolean;
  interactive?: boolean;
  allowPageScroll?: boolean;
  describedBy?: string;
  onChange?: (change: SurfaceChange) => void;
  onController?: (controller: SurfaceController | null) => void;
  onInteract?: () => void;
}

/** Owns one renderer lifetime. No concrete renderer or global input listener. */
export function SurfaceCanvas({ createSurface, paused, strength, ambient = false,
  interactive = true, allowPageScroll = false, describedBy, onChange, onController, onInteract }: SurfaceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<SurfaceController | null>(null);
  const latest = useRef({ paused, strength, onChange, onController, onInteract });
  latest.current = { paused, strength, onChange, onController, onInteract };
  const [status, setStatus] = useState<'initializing' | SurfaceChange['status']>('initializing');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let alive = true;
    let controller: SurfaceController | null = null;
    setStatus('initializing');
    const change = (next: SurfaceChange) => {
      if (!alive) return;
      setStatus(next.status);
      latest.current.onChange?.(next);
    };
    try {
      controller = createSurface(canvas, { paused: latest.current.paused,
        strength: latest.current.strength, ambient, onChange: change });
      controllerRef.current = controller;
      latest.current.onController?.(controller);
    } catch {
      change({ status: 'unavailable', paused: true });
    }
    return () => {
      alive = false;
      controllerRef.current = null;
      latest.current.onController?.(null);
      controller?.dispose();
    };
  }, [createSurface, ambient, retry]);

  useEffect(() => { controllerRef.current?.setPaused(paused); }, [paused, retry]);
  useEffect(() => { controllerRef.current?.setStrength(strength); }, [strength, retry]);

  const available = status === 'ready';
  const disturb = (x: number, y: number) => {
    if (!available || latest.current.paused) return;
    controllerRef.current?.disturb(x, y);
    latest.current.onInteract?.();
  };
  const normalizedPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;
    return {
      nx: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
      ny: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
    };
  };
  return <div className="water-surface" data-status={status}>
    <canvas key={retry} ref={canvasRef} className={`water-surface__canvas${interactive ? ' water-surface__canvas--interactive' : ''}${allowPageScroll ? ' water-surface__canvas--scrollable' : ''}`}
      tabIndex={interactive && available ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      aria-label={interactive ? 'Water surface: make a ripple' : undefined}
      aria-describedby={interactive ? describedBy : undefined}
      aria-disabled={interactive ? paused || !available : undefined}
      aria-hidden={interactive ? undefined : true}
      onPointerDown={interactive ? event => {
        if (!event.isPrimary || event.button !== 0 || paused || !available) return;
        const point = normalizedPoint(event);
        if (!point) return;
        event.currentTarget.focus({ preventScroll: true });
        disturb(point.nx, point.ny);
      } : undefined}
      onPointerMove={interactive ? event => {
        if (paused || !available) return;
        const point = normalizedPoint(event);
        if (!point) return;
        controllerRef.current?.hover?.(point.nx, point.ny);
      } : undefined}
      onPointerLeave={interactive ? () => {
        controllerRef.current?.leave?.();
      } : undefined}
      onKeyDown={interactive ? event => {
        if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
          event.preventDefault();
          disturb(0.5, 0.5);
        }
      } : undefined} />
    {status === 'lost' || status === 'unavailable' ? <div className="water-surface__fallback" role="status">
      <p>{status === 'lost' ? 'The surface was interrupted.' : 'The interactive surface is unavailable in this browser.'}</p>
      <button type="button" className="water-button" onClick={() => setRetry(value => value + 1)}>Try again</button>
    </div> : null}
  </div>;
}
