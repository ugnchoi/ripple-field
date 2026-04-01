/**
 * Maps pointer coordinates to world XY on z = 0 for an orthographic camera with
 * `left = -aspect`, `right = aspect`, `top = 1`, `bottom = -1`.
 */
export const ndcToWorldOrthographic = (
  clientX: number,
  clientY: number,
  rect: DOMRectReadOnly,
  aspect: number,
  target: { x: number; y: number },
): void => {
  const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
  const ndcY = -(((clientY - rect.top) / rect.height) * 2 - 1);
  target.x = ndcX * aspect;
  target.y = ndcY;
};

export type WorldBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

/**
 * Maps the intersection of a DOM rect with the canvas to axis-aligned world XY bounds
 * (same space as `ndcToWorldOrthographic`). If there is no overlap, sets an empty range.
 */
export const clientRectToWorldBounds = (
  elementRect: DOMRectReadOnly,
  canvasRect: DOMRectReadOnly,
  aspect: number,
  target: WorldBounds,
): void => {
  const ix0 = Math.max(elementRect.left, canvasRect.left);
  const iy0 = Math.max(elementRect.top, canvasRect.top);
  const ix1 = Math.min(elementRect.right, canvasRect.right);
  const iy1 = Math.min(elementRect.bottom, canvasRect.bottom);

  if (ix1 <= ix0 || iy1 <= iy0) {
    target.minX = 0;
    target.minY = 0;
    target.maxX = 0;
    target.maxY = 0;
    return;
  }

  const corner = { x: 0, y: 0 };
  ndcToWorldOrthographic(ix0, iy0, canvasRect, aspect, corner);
  const ax0 = corner.x;
  const ay0 = corner.y;
  ndcToWorldOrthographic(ix1, iy1, canvasRect, aspect, corner);
  const ax1 = corner.x;
  const ay1 = corner.y;

  target.minX = Math.min(ax0, ax1);
  target.maxX = Math.max(ax0, ax1);
  target.minY = Math.min(ay0, ay1);
  target.maxY = Math.max(ay0, ay1);
};
