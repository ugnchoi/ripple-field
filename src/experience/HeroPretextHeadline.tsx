import { useEffect, useRef, useState } from 'react';
import { useMotionPreference } from './useMotionPreference';

interface HeroPretextHeadlineProps {
  text: string;
}

const CELL = 2;
const RADIUS = 165;
const PAD = 32;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function hash3(ix: number, iy: number): [number, number, number] {
  const h1 = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453123;
  const h2 = Math.sin(ix * 269.5 + iy * 183.3) * 43758.5453123;
  const h3 = Math.sin(ix * 419.2 + iy * 371.9) * 43758.5453123;
  return [
    (h1 - Math.floor(h1)) * 2 - 1,
    (h2 - Math.floor(h2)) * 2 - 1,
    h3 - Math.floor(h3),
  ];
}

/**
 * Hero headline with an interactive "pretext" ClearType pixelation & exaggerated
 * red/blue subpixel antialiasing lens when the pointer approaches the text.
 */
export function HeroPretextHeadline({ text }: HeroPretextHeadlineProps) {
  const reducedMotion = useMotionPreference();
  const wrapRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasActive, setCanvasActive] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setCanvasActive(false);
      return;
    }

    const wrap = wrapRef.current;
    const h1 = h1Ref.current;
    const canvas = canvasRef.current;
    if (!wrap || !h1 || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let maskData: Uint8ClampedArray | null = null;
    let maskW = 0;
    let maskH = 0;
    let rafId = 0;

    const pointer = {
      x: -9999,
      y: -9999,
      tx: -9999,
      ty: -9999,
      pull: 0,
      targetPull: 0,
    };

    const rebuildMask = () => {
      const rect = h1.getBoundingClientRect();
      width = Math.max(1, Math.ceil(rect.width) + PAD * 2);
      height = Math.max(1, Math.ceil(rect.height) + PAD * 2);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      maskW = width;
      maskH = height;
      offscreen.width = maskW;
      offscreen.height = maskH;
      offCtx.clearRect(0, 0, maskW, maskH);

      const style = window.getComputedStyle(h1);
      offCtx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      offCtx.fillStyle = '#16181f';
      offCtx.textBaseline = 'alphabetic';
      if ('letterSpacing' in offCtx) {
        (offCtx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
          style.letterSpacing;
      }

      const refMetrics = offCtx.measureText('Mg');
      const fontAscent = refMetrics.fontBoundingBoxAscent || parseFloat(style.fontSize) * 0.82;
      const fontDescent = refMetrics.fontBoundingBoxDescent || parseFloat(style.fontSize) * 0.22;

      const textNode = h1.firstChild;
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        const content = textNode.textContent ?? '';
        const range = document.createRange();
        const wordRegex = /\S+/g;
        let match: RegExpExecArray | null;
        while ((match = wordRegex.exec(content)) !== null) {
          range.setStart(textNode, match.index);
          range.setEnd(textNode, match.index + match[0].length);
          const wRect = range.getBoundingClientRect();
          const leading = wRect.height - (fontAscent + fontDescent);
          const drawX = PAD + (wRect.left - rect.left);
          const drawY = PAD + (wRect.top - rect.top) + leading * 0.5 + fontAscent;
          offCtx.fillText(match[0], drawX, drawY);
        }
      } else {
        offCtx.fillText(text, PAD, PAD + fontAscent);
      }

      maskData = offCtx.getImageData(0, 0, maskW, maskH).data;
    };

    const sampleAlpha = (x: number, y: number): number => {
      if (!maskData) return 0;
      const ix = Math.max(0, Math.min(maskW - 1, Math.round(x)));
      const iy = Math.max(0, Math.min(maskH - 1, Math.round(y)));
      return maskData[(iy * maskW + ix) * 4 + 3] / 255;
    };

    const sampleCellAvg = (x0: number, y0: number, dxShift: number): number => {
      let sum = 0;
      let count = 0;
      for (let sy = 0; sy < CELL; sy += 1) {
        for (let sx = 0; sx < CELL; sx += 1) {
          sum += sampleAlpha(x0 + sx + dxShift, y0 + sy);
          count += 1;
        }
      }
      return count > 0 ? sum / count : 0;
    };

    const draw = () => {
      rafId = 0;
      pointer.x += (pointer.tx - pointer.x) * 0.22;
      pointer.y += (pointer.ty - pointer.y) * 0.22;
      pointer.pull += (pointer.targetPull - pointer.pull) * 0.14;

      if (pointer.pull < 0.01 && pointer.targetPull === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setCanvasActive(false);
        return;
      }

      setCanvasActive(true);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Draw crisp base text first, then replace affected cells near the pointer
      ctx.drawImage(offscreen, 0, 0, width, height);

      const cols = Math.ceil(width / CELL);
      const rows = Math.ceil(height / CELL);
      const shift = 3.2;
      const sigma = RADIUS * 0.42;
      const nowSec = performance.now() * 0.001;

      for (let row = 0; row < rows; row++) {
        const y0 = row * CELL;
        const cy = y0 + CELL * 0.5;
        for (let col = 0; col < cols; col++) {
          const x0 = col * CELL;
          const cx = x0 + CELL * 0.5;
          const dist = Math.hypot(cx - pointer.x, cy - pointer.y);
          if (dist >= RADIUS) continue;

          // Smooth radial gradient: strongest at the cursor center, tapering softly outward
          const gaussian = Math.exp(-(dist * dist) / (2 * sigma * sigma));
          const edgeFade = 1 - smoothstep(RADIUS * 0.65, RADIUS, dist);
          const inf = gaussian * edgeFade * pointer.pull;
          if (inf <= 0.03) continue;

          // Exaggerated ClearType subpixel sampling:
          // Left-shifted sample for Red, center for Green, right-shifted for Blue
          const aCenter = sampleCellAvg(x0, y0, 0);
          const aLeft = sampleCellAvg(x0, y0, -shift);
          const aRight = sampleCellAvg(x0, y0, shift);

          if (aCenter < 0.02 && aLeft < 0.02 && aRight < 0.02) continue;

          // Clear smooth text in this cell proportionally; near center it fully decomposes into grains
          ctx.save();
          ctx.globalCompositeOperation = 'destination-out';
          ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, inf * 1.25).toFixed(3)})`;
          ctx.fillRect(x0, y0, CELL, CELL);
          ctx.restore();

          // Gentler RGB subpixel ink absorption preserving ClearType edge logic
          const edgeDelta = (aRight - aLeft) * 1.15;
          const ink = Math.min(1, aCenter * 1.15);

          let r = 247 - ink * 225;
          let g = 247 - ink * 223;
          let b = 251 - ink * 220;

          if (edgeDelta > 0.02) {
            const t = Math.min(0.55, edgeDelta * (0.42 + 0.35 * inf));
            r = r + (186 - r) * t;
            g = g + (108 - g) * t;
            b = b + (64 - b) * t;
          } else if (edgeDelta < -0.02) {
            const t = Math.min(0.55, -edgeDelta * (0.42 + 0.35 * inf));
            r = r + (62 - r) * t;
            g = g + (120 - g) * t;
            b = b + (198 - b) * t;
          }

          // Two grain populations:
          // 1. Anchored core grains (~55%): stay within the original letterform silhouette
          // 2. Drifting particles (~45%): detach and drift outward with subtle organic motion
          const [hx, hy, hs] = hash3(col, row);
          const isDrifter = hs >= 0.55;
          const baseCoverage = Math.max(aCenter, Math.max(aLeft, aRight) * 0.85);

          let gx: number;
          let gy: number;
          let grainRadius: number;
          let alpha: number;

          if (isDrifter) {
            const driftFactor = ((hs - 0.55) / 0.45);
            const dxFromPtr = cx - pointer.x;
            const dyFromPtr = cy - pointer.y;
            const ptrLen = Math.max(1, Math.hypot(dxFromPtr, dyFromPtr));
            const push = inf * inf * (7.0 + 14.0 * driftFactor);
            const breezeX = Math.sin(nowSec * 1.6 + hs * 19.0 + row * 0.25) * 3.2 * inf;
            const breezeY = Math.cos(nowSec * 1.3 + hs * 23.0 + col * 0.25) * 3.2 * inf;

            gx = cx + hx * (5.5 * inf) + (dxFromPtr / ptrLen) * push + breezeX;
            gy = cy + hy * (5.5 * inf) + (dyFromPtr / ptrLen) * push + breezeY;

            // Drifting particles are mostly fine, with rare larger accent specks
            const largeSpec = hs > 0.96 ? 1.35 : 0.0;
            grainRadius = (0.42 + 0.52 * baseCoverage + largeSpec) * (1 - inf * 0.22 * driftFactor);
            alpha = Math.min(1, baseCoverage * (0.48 + 0.42 * inf) * (1 - 0.35 * driftFactor * inf));
          } else {
            // Stay anchored inside the original text stroke with micro-grain texture
            gx = cx + hx * (1.15 * inf);
            gy = cy + hy * (1.15 * inf);
            const largeCore = hs > 0.51 ? 1.15 : 0.0;
            grainRadius = (0.52 + 0.68 * baseCoverage + largeCore) * (0.85 + 0.2 * (1 - inf));
            alpha = Math.min(1, baseCoverage * (0.72 + 0.4 * inf));
          }

          ctx.fillStyle = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(gx, gy, grainRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const settled =
        Math.abs(pointer.tx - pointer.x) < 0.4 &&
        Math.abs(pointer.ty - pointer.y) < 0.4 &&
        Math.abs(pointer.targetPull - pointer.pull) < 0.01;

      if (!settled || pointer.targetPull > 0) {
        rafId = window.requestAnimationFrame(draw);
      }
    };

    const ensureLoop = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(draw);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const rect = h1.getBoundingClientRect();
      const lx = event.clientX - rect.left + PAD;
      const ly = event.clientY - rect.top + PAD;

      const nearX = Math.max(PAD, Math.min(width - PAD, lx));
      const nearY = Math.max(PAD, Math.min(height - PAD, ly));
      const edgeDist = Math.hypot(lx - nearX, ly - nearY);

      if (edgeDist < RADIUS) {
        if (pointer.pull < 0.02) {
          pointer.x = lx;
          pointer.y = ly;
        }
        pointer.tx = lx;
        pointer.ty = ly;
        pointer.targetPull = 1;
        ensureLoop();
      } else if (pointer.targetPull > 0) {
        pointer.targetPull = 0;
        ensureLoop();
      }
    };

    const onPointerLeave = () => {
      if (pointer.targetPull > 0) {
        pointer.targetPull = 0;
        ensureLoop();
      }
    };

    rebuildMask();
    document.fonts?.ready?.then(() => {
      rebuildMask();
    });

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            rebuildMask();
            if (pointer.pull > 0.02) ensureLoop();
          })
        : null;
    resizeObserver?.observe(h1);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [text, reducedMotion]);

  return (
    <div ref={wrapRef} className="hero-pretext">
      <h1 ref={h1Ref} className={canvasActive ? 'hero-pretext__h1--masked' : undefined}>
        {text}
      </h1>
      <canvas ref={canvasRef} className="hero-pretext__canvas" aria-hidden="true" />
    </div>
  );
}
