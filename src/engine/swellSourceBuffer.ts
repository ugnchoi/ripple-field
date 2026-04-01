import { type ShaderMaterial, Vector2 } from 'three';

import { DEFAULT_DECAY, DEFAULT_SWELL_WIDTH, MAX_SWELL_SOURCES } from './constants';

export type SwellSpawnOptions = {
  strength?: number;
  width?: number;
  decay?: number;
};

const inactiveTime = -1;

export class SwellSourceBuffer {
  private readonly centers: Vector2[] = Array.from(
    { length: MAX_SWELL_SOURCES },
    () => new Vector2(),
  );

  private readonly startTimes = new Float32Array(MAX_SWELL_SOURCES);
  private readonly strengths = new Float32Array(MAX_SWELL_SOURCES);
  private readonly widths = new Float32Array(MAX_SWELL_SOURCES);
  private readonly decays = new Float32Array(MAX_SWELL_SOURCES);

  private uniformsDirty = true;

  constructor() {
    this.clear();
  }

  clear(): void {
    this.startTimes.fill(inactiveTime);
    this.uniformsDirty = true;
  }

  /**
   * Spawns a swell. When full, recycles the oldest active source (smallest `startTime`).
   */
  spawn(
    worldX: number,
    worldY: number,
    elapsedSeconds: number,
    {
      strength = 0.7,
      width = DEFAULT_SWELL_WIDTH,
      decay = DEFAULT_DECAY,
    }: SwellSpawnOptions = {},
  ): void {

    let index = -1;
    for (let i = 0; i < MAX_SWELL_SOURCES; i += 1) {
      if (this.startTimes[i] < 0) {
        index = i;
        break;
      }
    }

    if (index < 0) {
      index = 0;
      let oldest = Number.POSITIVE_INFINITY;
      for (let i = 0; i < MAX_SWELL_SOURCES; i += 1) {
        const t0 = this.startTimes[i];
        if (t0 < oldest) {
          oldest = t0;
          index = i;
        }
      }
    }

    this.centers[index].set(worldX, worldY);
    this.startTimes[index] = elapsedSeconds;
    this.strengths[index] = strength;
    this.widths[index] = width;
    this.decays[index] = decay;
    this.uniformsDirty = true;
  }

  copyToUniforms(material: ShaderMaterial): void {
    if (!this.uniformsDirty) {
      return;
    }
    const target = material.uniforms as {
      uStartTime: { value: Float32Array };
      uCenterX: { value: Float32Array };
      uCenterY: { value: Float32Array };
      uStrength: { value: Float32Array };
      uWidth: { value: Float32Array };
      uDecay: { value: Float32Array };
    };
    const sx = target.uCenterX.value;
    const sy = target.uCenterY.value;
    for (let i = 0; i < MAX_SWELL_SOURCES; i += 1) {
      target.uStartTime.value[i] = this.startTimes[i];
      sx[i] = this.centers[i].x;
      sy[i] = this.centers[i].y;
      target.uStrength.value[i] = this.strengths[i];
      target.uWidth.value[i] = this.widths[i];
      target.uDecay.value[i] = this.decays[i];
    }
    this.uniformsDirty = false;
  }
}
