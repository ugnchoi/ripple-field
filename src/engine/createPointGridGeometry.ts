import { BufferGeometry, Float32BufferAttribute } from 'three';

import { GRID_COLS, GRID_JITTER, GRID_STAGGER, PERF_GRID_COLS_MIN } from './constants';

const fract01 = (value: number): number => value - Math.floor(value);

/** Secondary jitter axis from seed (deterministic, uncorrelated from `seed`). */
const jitterAlt = (seed: number): number => fract01(Math.sin(seed * 12.9898) * 43758.5453123);

/**
 * Staggered + micro-jittered lattice in world XY (z = 0) for the orthographic frustum
 * left = -aspect, right = aspect, bottom = -1, top = 1.
 */
export const createPointGridGeometry = (
  aspect: number,
  colsRequested: number = GRID_COLS,
): BufferGeometry => {
  const cols = Math.max(
    PERF_GRID_COLS_MIN,
    Math.min(GRID_COLS, Math.round(colsRequested)),
  );
  const rows = Math.max(56, Math.round((cols - 1) / aspect) + 1);

  const left = -aspect;
  const right = aspect;
  const bottom = -1;
  const top = 1;
  const width = right - left;
  const height = top - bottom;

  const count = cols * rows;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  const denomRow = Math.max(1, rows - 1);
  const denomCol = Math.max(1, cols - 1);
  const dx = width / denomCol;
  const dy = height / denomRow;

  let p = 0;
  let s = 0;
  for (let j = 0; j < rows; j += 1) {
    const v = j / denomRow;
    const yBase = bottom + v * height;
    const rowStagger = (j % 2) * GRID_STAGGER * dx;
    const spanW = width - (j % 2) * GRID_STAGGER * dx;

    for (let i = 0; i < cols; i += 1) {
      const u = i / denomCol;
      let x = left + rowStagger + u * spanW;
      let y = yBase;

      const seed = Math.random();
      const jx = (seed - 0.5) * GRID_JITTER * dx;
      const jy = (jitterAlt(seed) - 0.5) * GRID_JITTER * dy;
      x += jx;
      y += jy;

      positions[p] = x;
      positions[p + 1] = y;
      positions[p + 2] = 0;
      p += 3;
      seeds[s] = seed;
      s += 1;
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new Float32BufferAttribute(seeds, 1));

  return geometry;
};
