import { useEffect, useRef, useState } from 'react';
import { useMotionPreference } from './useMotionPreference';

interface HeroPretextHeadlineProps {
  text: string;
}

const RADIUS = 210;
const PAD = 12;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Hero headline with a gentle autonomous duotone dispersion (warm amber / cool slate-blue)
 * that subtly deepens on hover while preserving the crisp original letterforms.
 */
export function HeroPretextHeadline({ text }: HeroPretextHeadlineProps) {
  const reducedMotion = useMotionPreference();
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasActive, setCanvasActive] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setCanvasActive(false);
      return;
    }

    const h1 = h1Ref.current;
    const canvas = canvasRef.current;
    if (!h1 || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d');
    const warmCanvas = document.createElement('canvas');
    const warmCtx = warmCanvas.getContext('2d');
    const coolCanvas = document.createElement('canvas');
    const coolCtx = coolCanvas.getContext('2d');
    if (!offCtx || !warmCtx || !coolCtx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;

    const pointer = {
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
      pull: 0,
      targetPull: 0,
    };

    const drawTintedMask = (targetCtx: CanvasRenderingContext2D, color: string) => {
      targetCtx.clearRect(0, 0, offscreen.width, offscreen.height);
      targetCtx.globalCompositeOperation = 'source-over';
      targetCtx.drawImage(offscreen, 0, 0);
      targetCtx.globalCompositeOperation = 'source-in';
      targetCtx.fillStyle = color;
      targetCtx.fillRect(0, 0, offscreen.width, offscreen.height);
      targetCtx.globalCompositeOperation = 'source-over';
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

      const bufW = Math.floor(width * dpr);
      const bufH = Math.floor(height * dpr);
      offscreen.width = bufW;
      offscreen.height = bufH;
      warmCanvas.width = bufW;
      warmCanvas.height = bufH;
      coolCanvas.width = bufW;
      coolCanvas.height = bufH;

      offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      offCtx.clearRect(0, 0, width, height);

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

      drawTintedMask(warmCtx, '#b85a32');
      drawTintedMask(coolCtx, '#2f6bc0');
      setCanvasActive(true);
    };

    const draw = (nowMs: number) => {
      const t = nowMs * 0.001;
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;
      pointer.pull += (pointer.targetPull - pointer.pull) * 0.08;

      // Gentle autonomous breathing dispersion
      const autoX = Math.sin(t * 0.72) * 1.1 + Math.cos(t * 0.41) * 0.45;
      const autoY = Math.cos(t * 0.58) * 0.55;

      // Subtle directional lean on hover
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const dx = pointer.x - centerX;
      const dy = pointer.y - centerY;
      const len = Math.max(1, Math.hypot(dx, dy));
      const hoverX = (dx / len) * 2.1 * pointer.pull;
      const hoverY = (dy / len) * 0.9 * pointer.pull;

      const splitX = autoX + hoverX;
      const splitY = autoY + hoverY;
      const layerAlpha = 0.24 + 0.26 * pointer.pull;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.globalAlpha = layerAlpha;
      ctx.drawImage(warmCanvas, -splitX * dpr, -splitY * dpr);
      ctx.drawImage(coolCanvas, splitX * dpr, splitY * dpr);

      ctx.globalAlpha = 1;
      ctx.drawImage(offscreen, 0, 0);

      rafId = window.requestAnimationFrame(draw);
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
        pointer.targetPull = 1 - smoothstep(20, RADIUS, edgeDist);
      } else {
        pointer.targetPull = 0;
      }
    };

    const onPointerLeave = () => {
      pointer.targetPull = 0;
    };

    rebuildMask();
    document.fonts?.ready?.then(() => {
      rebuildMask();
    });

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            rebuildMask();
          })
        : null;
    resizeObserver?.observe(h1);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    rafId = window.requestAnimationFrame(draw);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [text, reducedMotion]);

  return (
    <div className="hero-pretext">
      <h1 ref={h1Ref} className={canvasActive ? 'hero-pretext__h1--masked' : undefined}>
        {text}
      </h1>
      <canvas ref={canvasRef} className="hero-pretext__canvas" aria-hidden="true" />
    </div>
  );
}
