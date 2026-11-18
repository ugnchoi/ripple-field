import { useId, useRef, useState } from 'react';
import { SurfaceCanvas } from './SurfaceCanvas';
import type { SurfaceController, SurfaceFactory, SurfaceStatus } from './types';
import { useMotionPreference, useSurfacePause } from './useMotionPreference';

export interface PlaygroundProps { createSurface: SurfaceFactory; portfolioHref?: string }
const strengths = [{ label: 'Gentle', value: 0.35 }, { label: 'Medium', value: 0.7 }, { label: 'Strong', value: 1 }];

export function Playground({ createSurface, portfolioHref = '/' }: PlaygroundProps) {
  const reducedMotion = useMotionPreference();
  const [paused, setPaused] = useSurfacePause(reducedMotion);
  const [strength, setStrength] = useState(0.7);
  const [status, setStatus] = useState<SurfaceStatus | null>(null);
  const controller = useRef<SurfaceController | null>(null);
  const hintId = useId();
  const ready = status === 'ready';

  return <main className="water-playground">
    <SurfaceCanvas createSurface={createSurface} paused={paused} strength={strength} ambient={true}
      describedBy={hintId} onController={next => { controller.current = next; }}
      onChange={next => { setStatus(next.status); setPaused(next.paused); }} />
    <header className="water-playground__header">
      <h1>Water</h1>
      <a className="water-link" href={portfolioHref}>Back to portfolio</a>
    </header>
    <div className="water-playground__footer">
      <p className="water-playground__hint" id={hintId}>
        {!ready ? 'Explore at your own pace.' : paused
          ? 'Paused. Play surface motion to make ripples.'
          : 'Tap or click to make a ripple. Focus the surface and press Enter or Space to ripple at the center.'}
      </p>
      <div className="water-playground__controls" aria-label="Surface controls">
        <fieldset className="water-strength" disabled={!ready}>
          <legend>Strength</legend>
          <div>{strengths.map(item => <label key={item.value}>
            <input type="radio" name={`strength-${hintId}`} value={item.value}
              checked={strength === item.value} onChange={() => setStrength(item.value)} />
            <span>{item.label}</span>
          </label>)}</div>
        </fieldset>
        <div className="water-playground__actions">
          <button className="water-button" type="button" disabled={!ready} onClick={() => setPaused(value => !value)}>
            {paused ? 'Play surface motion' : 'Pause'}
          </button>
          <button className="water-button" type="button" disabled={!ready} onClick={() => controller.current?.clear()}>Clear ripples</button>
        </div>
      </div>
    </div>
  </main>;
}
