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
