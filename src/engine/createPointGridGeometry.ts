import { BufferGeometry, Float32BufferAttribute } from 'three';

import { GRID_COLS } from './constants';

/**
 * Uniform lattice in world XY (z = 0) matching the orthographic frustum
 * left = -aspect, right = aspect, bottom = -1, top = 1.
 */
export const createPointGridGeometry = (aspect: number): BufferGeometry => {
  const cols = GRID_COLS;
  const rows = Math.max(56, Math.round((cols - 1) / aspect) + 1);

  const left = -aspect;
  const right = aspect;
  const bottom = -1;
  const top = 1;

  const count = cols * rows;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  const denomRow = Math.max(1, rows - 1);
  const denomCol = Math.max(1, cols - 1);

  let p = 0;
  let s = 0;
  for (let j = 0; j < rows; j += 1) {
    const v = j / denomRow;
    const y = bottom + v * (top - bottom);
    for (let i = 0; i < cols; i += 1) {
      const u = i / denomCol;
      const x = left + u * (right - left);
      positions[p] = x;
      positions[p + 1] = y;
      positions[p + 2] = 0;
      p += 3;
      seeds[s] = Math.random();
      s += 1;
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new Float32BufferAttribute(seeds, 1));

  return geometry;
};
