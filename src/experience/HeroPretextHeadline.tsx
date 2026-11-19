import { useEffect, useRef, useState } from 'react';
import { useMotionPreference } from './useMotionPreference';

interface HeroPretextHeadlineProps {
  text: string;
}

const CELL = 7;
const RADIUS = 155;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
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
      width = Math.max(1, Math.ceil(rect.width));
      height = Math.max(1, Math.ceil(rect.height));
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
      offCtx.fillStyle = '#000000';
      offCtx.textBaseline = 'top';
      if ('letterSpacing' in offCtx) {
        (offCtx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
          style.letterSpacing;
      }

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
          // Nudge baseline slightly to match CSS line-box top
          const drawX = wRect.left - rect.left;
          const drawY = wRect.top - rect.top + (wRect.height - parseFloat(style.fontSize)) * 0.14;
          offCtx.fillText(match[0], drawX, drawY);
        }
      } else {
        offCtx.fillText(text, 0, 0);
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
      const step = 2;
      for (let sy = 1; sy < CELL; sy += step) {
        for (let sx = 1; sx < CELL; sx += step) {
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

      for (let row = 0; row < rows; row++) {
        const y0 = row * CELL;
        const cy = y0 + CELL * 0.5;
        for (let col = 0; col < cols; col++) {
          const x0 = col * CELL;
          const cx = x0 + CELL * 0.5;
          const dist = Math.hypot(cx - pointer.x, cy - pointer.y);
          const inf = smoothstep(RADIUS, 18, dist) * pointer.pull;
          if (inf <= 0.04) continue;

          // Exaggerated ClearType subpixel sampling:
          // Left-shifted sample for Red, center for Green, right-shifted for Blue
          const aCenter = sampleCellAvg(x0, y0, 0);
          const aLeft = sampleCellAvg(x0, y0, -shift);
          const aRight = sampleCellAvg(x0, y0, shift);

          if (aCenter < 0.02 && aLeft < 0.02 && aRight < 0.02) continue;

          // Clear smooth text inside this pixel cell so the coarse block replaces it cleanly
          ctx.clearRect(x0, y0, CELL, CELL);

          // Exaggerated RGB subpixel ink absorption on paper (#f7f7fb):
          // Left edge of stroke: aRight > aLeft -> warm amber/red
          // Right edge of stroke: aLeft > aRight -> cool sky/cobalt blue
          // Center of stroke: high coverage -> deep ink (#16181f)
          const edgeDelta = (aRight - aLeft) * 1.45;
          const ink = Math.min(1, aCenter * 1.15);

          let r = 247 - ink * 225;
          let g = 247 - ink * 223;
          let b = 251 - ink * 220;

          if (edgeDelta > 0.02) {
            // Left edge -> warm amber / burnt red
            const t = Math.min(1, edgeDelta * (0.85 + 0.55 * inf));
            r = r + (208 - r) * t;
            g = g + (96 - g) * t;
            b = b + (22 - b) * t;
          } else if (edgeDelta < -0.02) {
            // Right edge -> cool cobalt / sky blue
            const t = Math.min(1, -edgeDelta * (0.85 + 0.55 * inf));
            r = r + (24 - r) * t;
            g = g + (116 - g) * t;
            b = b + (232 - b) * t;
          }

          const alpha = Math.min(1, Math.max(aCenter, Math.max(aLeft, aRight) * 0.85) * 1.15);
          ctx.fillStyle = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha.toFixed(3)})`;
          ctx.fillRect(x0, y0, CELL, CELL);

          // Subtle pixel-grid hairline around active exaggerated cells
          if (inf > 0.28) {
            ctx.strokeStyle = `rgba(22, 24, 31, ${(0.12 * inf).toFixed(3)})`;
            ctx.lineWidth = 0.75;
            ctx.strokeRect(x0 + 0.375, y0 + 0.375, CELL - 0.75, CELL - 0.75);
          }
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
      const lx = event.clientX - rect.left;
      const ly = event.clientY - rect.top;

      const nearX = Math.max(0, Math.min(width, lx));
      const nearY = Math.max(0, Math.min(height, ly));
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
