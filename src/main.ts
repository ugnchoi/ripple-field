import {
  Clock,
  OrthographicCamera,
  Points,
  Scene,
  Vector2,
  WebGLRenderer,
} from 'three';

import {
  createPointGridGeometry,
  createRippleFieldMaterial,
  DEFAULT_DECAY,
  DEFAULT_SWELL_WIDTH,
  ndcToWorldOrthographic,
  primeShapeUniforms,
  SwellSourceBuffer,
} from './engine';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Missing #app container');
}

const clock = new Clock();
const scene = new Scene();
const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
camera.position.z = 2;

const renderer = new WebGLRenderer({ antialias: true, alpha: false });
renderer.setClearColor(0x1a1a1f, 1);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const swellBuffer = new SwellSourceBuffer();
const rippleMaterial = createRippleFieldMaterial();
primeShapeUniforms(rippleMaterial.uniforms);

const lastPointerWorld = new Vector2(0, 0);

let points: Points | null = null;
let currentAspect = 1;

const rebuildGrid = (aspect: number) => {
  if (points !== null) {
    scene.remove(points);
    points.geometry.dispose();
    points = null;
  }
  const geometry = createPointGridGeometry(aspect);
  points = new Points(geometry, rippleMaterial);
  scene.add(points);
  currentAspect = aspect;
};

const handleResize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / height;

  renderer.setSize(width, height);

  camera.left = -aspect;
  camera.right = aspect;
  camera.top = 1;
  camera.bottom = -1;
  camera.updateProjectionMatrix();

  if (points === null || Math.abs(aspect - currentAspect) > 1e-4) {
    rebuildGrid(aspect);
  }
};

/** Phase 2.5: keep jitter narrow so weak/strong inputs stay in one calm band. */
const devStrengthJitter = () => 0.94 + Math.random() * 0.12;

const handlePointerDown = (event: PointerEvent) => {
  const rect = renderer.domElement.getBoundingClientRect();
  ndcToWorldOrthographic(
    event.clientX,
    event.clientY,
    rect,
    currentAspect,
    lastPointerWorld,
  );
  swellBuffer.spawn(
    lastPointerWorld.x,
    lastPointerWorld.y,
    clock.getElapsedTime(),
    {
      strength: 0.78 * devStrengthJitter(),
      width: DEFAULT_SWELL_WIDTH,
      decay: DEFAULT_DECAY,
    },
  );
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

  swellBuffer.spawn(lastPointerWorld.x, lastPointerWorld.y, clock.getElapsedTime(), {
    strength: 0.5 * devStrengthJitter(),
    width: DEFAULT_SWELL_WIDTH * 0.95,
    decay: DEFAULT_DECAY,
  });
};

handleResize();
window.addEventListener('resize', handleResize);
app.appendChild(renderer.domElement);
renderer.domElement.addEventListener('pointerdown', handlePointerDown);
window.addEventListener('keydown', handleKeyDown);

const animate = () => {
  requestAnimationFrame(animate);
  rippleMaterial.uniforms.uTime.value = clock.getElapsedTime();
  swellBuffer.copyToUniforms(rippleMaterial);
  renderer.render(scene, camera);
};

animate();
