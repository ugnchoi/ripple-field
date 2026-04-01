import { GRID_COLS } from './constants';

export type PerformanceDegradationTier = 'full' | 'balanced' | 'efficient';

export type PerformanceBudgetInput = {
  cssWidth: number;
  cssHeight: number;
  prefersReducedMotion: boolean;
  /** `navigator.deviceMemory` when available (GB). */
  deviceMemoryGb?: number;
};

export type PerformanceBudget = {
  tier: PerformanceDegradationTier;
  /** Lattice columns passed to `createPointGridGeometry`. */
  gridCols: number;
  /** Upper bound for `renderer.setPixelRatio`. */
  rendererPixelRatioCap: number;
  /** Approximate point count for the current aspect (diagnostic). */
  estimatedPointCount: number;
};

const estimateRows = (cols: number, aspect: number): number => {
  return Math.max(56, Math.round((cols - 1) / aspect) + 1);
};

const estimatePointCount = (cols: number, aspect: number): number => {
  return cols * estimateRows(cols, aspect);
};

const clampColsToPointBudget = (
  cols: number,
  aspect: number,
  maxPoints: number,
  minCols: number,
): number => {
  let c = Math.round(cols);
  while (c > minCols && estimatePointCount(c, aspect) > maxPoints) {
    c -= 4;
  }
  return Math.max(minCols, c);
};

/**
 * Picks grid density and DPR cap from viewport + device signals.
 * Keeps vertex cost within tier budgets without changing the single-batch architecture.
 */
export const resolvePerformanceBudget = (
  aspect: number,
  input: PerformanceBudgetInput,
): PerformanceBudget => {
  const pixels = Math.max(1, input.cssWidth * input.cssHeight);
  const memoryLow =
    input.deviceMemoryGb != null && Number.isFinite(input.deviceMemoryGb)
      ? input.deviceMemoryGb <= 4
      : false;

  let tier: PerformanceDegradationTier = 'full';
  if (input.prefersReducedMotion) {
    tier = 'efficient';
  } else if (memoryLow || pixels > 2_520_000) {
    tier = 'balanced';
  }
  if (input.cssWidth > 0 && input.cssWidth < 640) {
    tier = tier === 'full' ? 'balanced' : 'efficient';
  }

  const caps: Record<
    PerformanceDegradationTier,
    { cols: number; dpr: number; maxPoints: number }
  > = {
    full: { cols: GRID_COLS, dpr: 2, maxPoints: 62_000 },
    balanced: { cols: Math.round(GRID_COLS * 0.88), dpr: 1.5, maxPoints: 48_000 },
    efficient: { cols: Math.round(GRID_COLS * 0.72), dpr: 1.25, maxPoints: 36_000 },
  };

  const { cols: tierCols, dpr: rendererPixelRatioCap, maxPoints } = caps[tier];
  const gridCols = clampColsToPointBudget(tierCols, aspect, maxPoints, 96);

  return {
    tier,
    gridCols,
    rendererPixelRatioCap,
    estimatedPointCount: estimatePointCount(gridCols, aspect),
  };
};
