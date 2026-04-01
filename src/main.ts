import {
  Clock,
  OrthographicCamera,
  Points,
  Scene,
  Vector2,
  WebGLRenderer,
} from 'three';

import "./index.css"

import {
  AUTO_RANDOM_SPAWN_COUNT_PER_WINDOW,
  AUTO_RANDOM_SPAWN_STRENGTH,
  AUTO_RANDOM_SPAWN_STRENGTH_JITTER,
  AUTO_RANDOM_SPAWN_WIDTH_SCALE,
  AUTO_RANDOM_SPAWN_WINDOW_SEC,
  clientRectToWorldBounds,
  createPointGridGeometry,
  createRippleFieldMaterial,
  DEFAULT_DECAY,
  DEFAULT_SWELL_WIDTH,
  FOREGROUND_GLOBAL_FIELD_SCALE,
  FOREGROUND_KEY_STRENGTH_JITTER,
  FOREGROUND_KEY_SWELL_MIN_INTERVAL,
  FOREGROUND_KEY_SWELL_STRENGTH,
  FOREGROUND_POINTER_STRENGTH_JITTER,
  FOREGROUND_POINTER_SWELL_STRENGTH,
  FOREGROUND_QUIET_FIELD_SCALE_MUL,
  FOREGROUND_QUIET_OPACITY_MUL,
  ndcToWorldOrthographic,
  PERF_POINTER_SWELL_MIN_INTERVAL,
  POLISH_DEFAULT_ENABLED,
  primeShapeUniforms,
  resolvePerformanceBudget,
  SwellSourceBuffer,
} from './engine';

const rippleHost = document.querySelector<HTMLDivElement>('#ripple-host');
if (!rippleHost) {
  throw new Error('Missing #ripple-host container');
}

const quietToggle = document.querySelector<HTMLInputElement>('#quiet-mode');
const polishToggle = document.querySelector<HTMLInputElement>('#polish-layer');

const clock = new Clock();
const scene = new Scene();
const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
camera.position.z = 2;

const renderer = new WebGLRenderer({ antialias: true, alpha: false });
renderer.setClearColor(0xf7f7fb, 1);

const swellBuffer = new SwellSourceBuffer();
const rippleMaterial = createRippleFieldMaterial();
primeShapeUniforms(rippleMaterial.uniforms);

const lastPointerWorld = new Vector2(0, 0);
const safeBoundsScratch = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
const spawnWorldScratch = { x: 0, y: 0 };

let points: Points | null = null;
let currentAspect = 1;
let lastGridCols = -1;
let lastAppliedPixelRatio = -1;
let lastKeySwellTime = -1;
let lastPointerSwellTime = -1;
let lastSafeUniformKey = '';
let cachedSafeElement: HTMLElement | null = null;

let autoRandomSpawnWindowIndex = -1;
let autoRandomSpawnOffsets: number[] = [];
let autoRandomSpawnNextIndex = 0;

const reducedMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

const strengthJitter = (halfWidth: number): number => {
  return 1 - halfWidth + Math.random() * 2 * halfWidth;
};

const readPerformanceSignals = () => {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return {
    cssWidth: window.innerWidth,
    cssHeight: window.innerHeight,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    deviceMemoryGb: nav.deviceMemory,
  };
};

const syncQuietUniforms = (): void => {
  const quiet = quietToggle?.checked ?? false;
  const fieldMul = quiet ? FOREGROUND_QUIET_FIELD_SCALE_MUL : 1;
  rippleMaterial.uniforms.uGlobalFieldScale.value =
    FOREGROUND_GLOBAL_FIELD_SCALE * fieldMul;
  rippleMaterial.uniforms.uOpacityScale.value = quiet
    ? FOREGROUND_QUIET_OPACITY_MUL
    : 1;
};

quietToggle?.addEventListener('change', syncQuietUniforms);
syncQuietUniforms();

const syncPolishViewportUniforms = (): void => {
  const canvas = renderer.domElement;
  rippleMaterial.uniforms.uResolution.value.set(canvas.width, canvas.height);
  rippleMaterial.uniforms.uViewAspect.value = currentAspect;
};

const syncPolishUniforms = (): void => {
  const wants = polishToggle?.checked ?? false;
  const allowed = !reducedMotionMq.matches;
  rippleMaterial.uniforms.uPolishMaster.value = wants && allowed ? 1 : 0;
};

if (polishToggle) {
  polishToggle.checked = POLISH_DEFAULT_ENABLED;
}
polishToggle?.addEventListener('change', syncPolishUniforms);
syncPolishUniforms();

const refreshCachedSafeElement = (): void => {
  cachedSafeElement = document.querySelector<HTMLElement>('[data-ripple-safe="primary"]');
};

const rebuildGrid = (aspect: number, gridCols: number) => {
  if (points !== null) {
    scene.remove(points);
    points.geometry.dispose();
    points = null;
  }
  const geometry = createPointGridGeometry(aspect, gridCols);
  points = new Points(geometry, rippleMaterial);
  scene.add(points);
  currentAspect = aspect;
  lastGridCols = gridCols;
};

const applyPixelRatioCap = (cap: number): void => {
  const raw = window.devicePixelRatio || 1;
  const next = Math.min(raw, cap);
  if (Math.abs(next - lastAppliedPixelRatio) > 1e-3) {
    renderer.setPixelRatio(next);
    lastAppliedPixelRatio = next;
  }
};

const handleResize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / height;
  const budget = resolvePerformanceBudget(aspect, readPerformanceSignals());

  applyPixelRatioCap(budget.rendererPixelRatioCap);
  renderer.setSize(width, height);

  camera.left = -aspect;
  camera.right = aspect;
  camera.top = 1;
  camera.bottom = -1;
  camera.updateProjectionMatrix();

  refreshCachedSafeElement();

  const aspectChanged = points === null || Math.abs(aspect - currentAspect) > 1e-4;
  const densityChanged = budget.gridCols !== lastGridCols;
  if (aspectChanged || densityChanged) {
    rebuildGrid(aspect, budget.gridCols);
  }
  syncPolishViewportUniforms();
  syncPolishUniforms();
};

const updateSafeZoneUniforms = (): void => {
  const canvasRect = renderer.domElement.getBoundingClientRect();
  const safeEl = cachedSafeElement;
  if (!safeEl || !document.body.contains(safeEl)) {
    refreshCachedSafeElement();
  }
  const el = cachedSafeElement;
  if (!el) {
    if (lastSafeUniformKey !== 'disabled') {
      rippleMaterial.uniforms.uSafeEnabled.value = 0;
      lastSafeUniformKey = 'disabled';
    }
    return;
  }
  clientRectToWorldBounds(el.getBoundingClientRect(), canvasRect, currentAspect, safeBoundsScratch);
  const w = safeBoundsScratch.maxX - safeBoundsScratch.minX;
  const h = safeBoundsScratch.maxY - safeBoundsScratch.minY;
  const valid = w > 1e-4 && h > 1e-4;
  const key = valid
    ? `1|${safeBoundsScratch.minX.toFixed(4)}|${safeBoundsScratch.minY.toFixed(4)}|${safeBoundsScratch.maxX.toFixed(4)}|${safeBoundsScratch.maxY.toFixed(4)}`
    : '0';
  if (key === lastSafeUniformKey) {
    return;
  }
  lastSafeUniformKey = key;
  rippleMaterial.uniforms.uSafeEnabled.value = valid ? 1 : 0;
  if (valid) {
    rippleMaterial.uniforms.uSafeBounds.value.set(
      safeBoundsScratch.minX,
      safeBoundsScratch.minY,
      safeBoundsScratch.maxX,
      safeBoundsScratch.maxY,
    );
  }
};

const rollAutoRandomSpawnOffsets = (): void => {
  autoRandomSpawnOffsets = Array.from(
    { length: AUTO_RANDOM_SPAWN_COUNT_PER_WINDOW },
    () => Math.random() * AUTO_RANDOM_SPAWN_WINDOW_SEC,
  ).sort((a, b) => a - b);
  autoRandomSpawnNextIndex = 0;
};

const spawnRandomAutoSwell = (): void => {
  const rect = renderer.domElement.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) {
    return;
  }
  const x = rect.left + Math.random() * rect.width;
  const y = rect.top + Math.random() * rect.height;
  spawnAtClientPoint(
    x,
    y,
    AUTO_RANDOM_SPAWN_STRENGTH * strengthJitter(AUTO_RANDOM_SPAWN_STRENGTH_JITTER),
    AUTO_RANDOM_SPAWN_WIDTH_SCALE,
  );
};

const processAutoRandomSpawns = (elapsed: number): void => {
  if (reducedMotionMq.matches) {
    return;
  }
  const windowIndex = Math.floor(elapsed / AUTO_RANDOM_SPAWN_WINDOW_SEC);
  if (windowIndex !== autoRandomSpawnWindowIndex) {
    autoRandomSpawnWindowIndex = windowIndex;
    rollAutoRandomSpawnOffsets();
  }
  const tInWindow = elapsed - windowIndex * AUTO_RANDOM_SPAWN_WINDOW_SEC;
  while (
    autoRandomSpawnNextIndex < autoRandomSpawnOffsets.length &&
    tInWindow >= autoRandomSpawnOffsets[autoRandomSpawnNextIndex]
  ) {
    spawnRandomAutoSwell();
    autoRandomSpawnNextIndex += 1;
  }
};

const spawnAtClientPoint = (
  clientX: number,
  clientY: number,
  strength: number,
  widthScale = 1,
): void => {
  const rect = renderer.domElement.getBoundingClientRect();
  ndcToWorldOrthographic(clientX, clientY, rect, currentAspect, spawnWorldScratch);
  swellBuffer.spawn(spawnWorldScratch.x, spawnWorldScratch.y, clock.getElapsedTime(), {
    strength,
    width: DEFAULT_SWELL_WIDTH * widthScale,
    decay: DEFAULT_DECAY,
  });
};

const handlePointerDown = (event: PointerEvent) => {
  const now = clock.getElapsedTime();
  if (now - lastPointerSwellTime < PERF_POINTER_SWELL_MIN_INTERVAL) {
    return;
  }
  lastPointerSwellTime = now;

  ndcToWorldOrthographic(
    event.clientX,
    event.clientY,
    renderer.domElement.getBoundingClientRect(),
    currentAspect,
    lastPointerWorld,
  );
  swellBuffer.spawn(lastPointerWorld.x, lastPointerWorld.y, now, {
    strength:
      FOREGROUND_POINTER_SWELL_STRENGTH * strengthJitter(FOREGROUND_POINTER_STRENGTH_JITTER),
    width: DEFAULT_SWELL_WIDTH,
    decay: DEFAULT_DECAY,
  });
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.repeat) {
    return;
  }
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }
  const t = event.target;
  if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) {
    return;
  }

  const now = clock.getElapsedTime();
  if (now - lastKeySwellTime < FOREGROUND_KEY_SWELL_MIN_INTERVAL) {
    return;
  }
  lastKeySwellTime = now;

  swellBuffer.spawn(lastPointerWorld.x, lastPointerWorld.y, now, {
    strength:
      FOREGROUND_KEY_SWELL_STRENGTH * strengthJitter(FOREGROUND_KEY_STRENGTH_JITTER),
    width: DEFAULT_SWELL_WIDTH * 0.92,
    decay: DEFAULT_DECAY,
  });
};

const handleDemoControlClick = (event: Event) => {
  const el = event.currentTarget;
  if (!(el instanceof HTMLElement)) {
    return;
  }
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width * 0.5;
  const cy = r.top + r.height * 0.5;
  spawnAtClientPoint(
    cx,
    cy,
    FOREGROUND_POINTER_SWELL_STRENGTH * 0.55 * strengthJitter(0.04),
    0.88,
  );
};

handleResize();
window.addEventListener('resize', handleResize);

reducedMotionMq.addEventListener('change', () => {
  syncPolishUniforms();
  handleResize();
});

rippleHost.appendChild(renderer.domElement);
renderer.domElement.addEventListener('pointerdown', handlePointerDown);
window.addEventListener('keydown', handleKeyDown);

const demoPrimary = document.querySelector('#demo-primary');
const demoSecondary = document.querySelector('#demo-secondary');
demoPrimary?.addEventListener('click', handleDemoControlClick);
demoSecondary?.addEventListener('click', handleDemoControlClick);

const animate = () => {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  rippleMaterial.uniforms.uTime.value = elapsed;
  processAutoRandomSpawns(elapsed);
  updateSafeZoneUniforms();
  swellBuffer.copyToUniforms(rippleMaterial);
  renderer.render(scene, camera);
};

animate();
